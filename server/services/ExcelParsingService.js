import XLSX from 'xlsx'
import ExcelJS from 'exceljs'
import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export class ExcelParsingService {
  constructor() {
    this.tempDir = path.join(__dirname, '..', 'temp')
    this.outputDir = path.join(__dirname, '..', 'output')
  }

  /**
   * Main function to parse Excel file and extract items with quantities
   */
  async parseExcelFile(filePath, jobId, originalFileName) {
    try {
      console.log(`🔍 Starting Excel parsing for: ${originalFileName}`)
      
      // Load workbook
      const workbook = XLSX.readFile(filePath)
      console.log(`📊 Found ${workbook.SheetNames.length} sheets:`, workbook.SheetNames)
      
      let allItems = []
      let totalRowsProcessed = 0
      let itemsWithQuantities = 0
      let sectionHeaders = [] // Store section headers
      
      // Process each sheet
      for (const sheetName of workbook.SheetNames) {
        try {
          console.log(`📋 Processing sheet: ${sheetName}`)
          const { items: sheetItems, headers: sheetHeaders } = await this.processSheet(workbook, sheetName)
          
          console.log(`   📌 Raw items found: ${sheetItems.length}`)
          
          // Filter items to only include those with quantities > 0 (be more lenient)
          const validItems = sheetItems.filter(item => {
            const hasQty = item.quantity && !isNaN(item.quantity) && parseFloat(item.quantity) > 0
            const hasDesc = item.description && item.description.trim().length > 0
            if (!hasQty && hasDesc) {
              console.log(`   ⚠️ Skipping item without quantity: "${item.description.substring(0, 50)}..." at row ${item.row_number}`)
            }
            if (hasQty && !hasDesc) {
              console.log(`   ⚠️ Skipping item without description at row ${item.row_number}, qty: ${item.quantity}`)
            }
            return hasQty && hasDesc
          })
          
          console.log(`   📌 Valid items with quantities: ${validItems.length}`)
          
          // Add section headers to items
          validItems.forEach(item => {
            // Find the most recent header before this item
            const relevantHeader = sheetHeaders
              .filter(h => h.row < item.row_number)
              .sort((a, b) => b.row - a.row)[0]
            
            if (relevantHeader) {
              item.section_header = relevantHeader.text
            }
          })
          
          allItems = allItems.concat(validItems)
          sectionHeaders = sectionHeaders.concat(sheetHeaders)
          totalRowsProcessed += sheetItems.length
          itemsWithQuantities += validItems.length
          
        } catch (sheetError) {
          console.warn(`⚠️ Error processing sheet ${sheetName}:`, sheetError.message)
          console.warn(`   Stack:`, sheetError.stack)
        }
      }
      
      console.log(`📈 Parsing Summary:`)
      console.log(`   - Total rows processed: ${totalRowsProcessed}`)
      console.log(`   - Items with quantities: ${itemsWithQuantities}`)
      console.log(`   - Items ready for matching: ${allItems.length}`)
      console.log(`   - Section headers found: ${sectionHeaders.length}`)
      
      return allItems
      
    } catch (error) {
      console.error(`❌ Error parsing Excel file:`, error)
      console.error(`   Stack:`, error.stack)
      throw error
    }
  }

  /**
   * Process a single sheet and extract items
   */
  async processSheet(workbook, sheetName) {
    const worksheet = workbook.Sheets[sheetName]
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null })
    
    if (!jsonData || jsonData.length === 0) {
      return { items: [], headers: [] }
    }
    
    // Find header row and columns
    const headerInfo = this.findHeaders(jsonData)
    if (!headerInfo.found) {
      console.warn(`⚠️ Could not find clear headers in sheet ${sheetName}, trying fallback detection...`)
      // Try fallback: assume first few columns are description, then quantity
      const fallbackInfo = this.detectFallbackStructure(jsonData, sheetName)
      if (!fallbackInfo.found) {
        console.warn(`⚠️ Could not detect structure in sheet ${sheetName}`)
        return { items: [], headers: [] }
      }
      Object.assign(headerInfo, fallbackInfo)
    }
    
    console.log(`   🎯 Headers found at row ${headerInfo.headerRow + 1}:`)
    console.log(`   - Description column: ${headerInfo.descriptionCol + 1}`)
    console.log(`   - Quantity column: ${headerInfo.quantityCol + 1}`)
    console.log(`   - Rate column: ${headerInfo.rateCol + 1 || 'Not found'}`)
    console.log(`   - Unit column: ${headerInfo.unitCol + 1 || 'Not found'}`)
    
    const items = []
    const headers = []
    let totalRows = 0
    let skippedEmpty = 0
    let skippedNoDesc = 0
    let skippedNoQty = 0
    let skippedByFilter = 0
    
    // Process data rows
    for (let rowIndex = headerInfo.headerRow + 1; rowIndex < jsonData.length; rowIndex++) {
      const row = jsonData[rowIndex]
      if (!row || row.length === 0) {
        skippedEmpty++
        continue
      }
      
      totalRows++
      
      // Check if this row might be a section header
      const potentialHeader = this.detectSectionHeader(row, headerInfo)
      if (potentialHeader) {
        headers.push({
          row: rowIndex + 1,
          text: potentialHeader
        })
      }
      
      const item = this.extractItemFromRow(
        row, 
        headerInfo, 
        rowIndex + 1, 
        sheetName
      )
      
      if (item) {
        items.push(item)
      } else {
        // Count why items were skipped for debugging
        const description = this.extractDescription(row[headerInfo.descriptionCol])
        const quantity = this.extractQuantity(row[headerInfo.quantityCol])
        
        if (!description) {
          skippedNoDesc++
        } else if (!quantity || quantity <= 0) {
          skippedNoQty++
        } else if (this.shouldSkipItem(description)) {
          skippedByFilter++
        }
      }
    }
    
    console.log(`   📈 Parsing results for ${sheetName}:`)
    console.log(`      - Total data rows: ${totalRows}`)
    console.log(`      - Items extracted: ${items.length}`)
    console.log(`      - Section headers: ${headers.length}`)
    console.log(`      - Skipped empty: ${skippedEmpty}`)
    console.log(`      - Skipped no description: ${skippedNoDesc}`)
    console.log(`      - Skipped no quantity: ${skippedNoQty}`)
    console.log(`      - Skipped by filter: ${skippedByFilter}`)
    
    return { items, headers }
  }

  /**
   * Detect if a row is a section header
   */
  detectSectionHeader(row, headerInfo) {
    if (!row || row.length === 0) return null
    
    // Check if the row has text in description column but no quantity
    const descriptionCell = row[headerInfo.descriptionCol]
    const quantityCell = row[headerInfo.quantityCol]
    
    if (descriptionCell && !this.extractQuantity(quantityCell)) {
      const desc = String(descriptionCell).trim()
      
      // Check if it looks like a header (all caps, ends with colon, contains keywords)
      const isAllCaps = desc === desc.toUpperCase() && desc.length > 3
      const hasColon = desc.endsWith(':')
      const headerKeywords = ['section', 'part', 'chapter', 'category', 'group', 'summary', 'total']
      const hasKeyword = headerKeywords.some(kw => desc.toLowerCase().includes(kw))
      
      // Check if most cells in the row are empty (typical for headers)
      const nonEmptyCells = row.filter(cell => cell && String(cell).trim()).length
      const mostlyEmpty = nonEmptyCells <= 2
      
      if ((isAllCaps || hasColon || hasKeyword) && mostlyEmpty) {
        return desc
      }
    }
    
    return null
  }

  /**
   * Detect fallback structure when headers aren't clear - AGGRESSIVE MODE
   */
  detectFallbackStructure(jsonData, sheetName) {
    console.log(`   🔍 Attempting AGGRESSIVE fallback structure detection for ${sheetName}`)
    
    // Try multiple strategies to find ANY structure
    
    // Strategy 1: Look for any column with meaningful text and any column with numbers
    for (let rowIndex = 0; rowIndex < Math.min(30, jsonData.length); rowIndex++) {
      const row = jsonData[rowIndex]
      if (!row || row.length < 2) continue
      
      const columnInfo = []
      
      // Analyze each column
      for (let colIndex = 0; colIndex < Math.min(15, row.length); colIndex++) {
        const cell = row[colIndex]
        if (!cell) continue
        
        const cellStr = String(cell).trim()
        if (cellStr.length === 0) continue
        
        const hasText = isNaN(cellStr) && cellStr.length > 1
        const hasNumber = !isNaN(cellStr) && parseFloat(cellStr) > 0
        
        columnInfo.push({
          index: colIndex,
          content: cellStr,
          hasText,
          hasNumber,
          length: cellStr.length
        })
      }
      
      // Find best text column (longest meaningful text)
      const textColumns = columnInfo.filter(col => col.hasText && col.length > 3)
      const numberColumns = columnInfo.filter(col => col.hasNumber)
      
      if (textColumns.length > 0 && numberColumns.length > 0) {
        const bestTextCol = textColumns.sort((a, b) => b.length - a.length)[0]
        const bestNumberCol = numberColumns[0]
        
        console.log(`   ✅ Aggressive Fallback: Found description at col ${bestTextCol.index + 1}, quantity at col ${bestNumberCol.index + 1}`)
        return {
          found: true,
          headerRow: rowIndex > 2 ? rowIndex - 2 : 0,
          descriptionCol: bestTextCol.index,
          quantityCol: bestNumberCol.index,
          rateCol: numberColumns.length > 1 ? numberColumns[1].index : -1,
          unitCol: -1
        }
      }
    }
    
    // Strategy 2: Assume common patterns - first few columns are description, then quantity
    if (jsonData.length > 5) {
      console.log(`   ⚠️ Using LAST RESORT fallback: assuming col 1=description, col 2=quantity`)
      return {
        found: true,
        headerRow: 0,
        descriptionCol: 0,
        quantityCol: 1,
        rateCol: jsonData[0] && jsonData[0].length > 2 ? 2 : -1,
        unitCol: -1
      }
    }
    
    return { found: false }
  }

  /**
   * Find header row and column positions in the sheet data
   */
  findHeaders(jsonData) {
    let headerRow = -1
    let descriptionCol = -1
    let quantityCol = -1
    let rateCol = -1
    let unitCol = -1
    
    // Look for headers in first 15 rows
    for (let rowIndex = 0; rowIndex < Math.min(15, jsonData.length); rowIndex++) {
      const row = jsonData[rowIndex]
      if (!row) continue
      
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const cellValue = this.normalizeHeaderText(row[colIndex])
        
        // Description column patterns
        if (this.isDescriptionHeader(cellValue)) {
          descriptionCol = colIndex
          headerRow = rowIndex
        }
        
        // Quantity column patterns
        else if (this.isQuantityHeader(cellValue)) {
          quantityCol = colIndex
          if (headerRow === -1) headerRow = rowIndex
        }
        
        // Rate/Price column patterns
        else if (this.isRateHeader(cellValue)) {
          rateCol = colIndex
          if (headerRow === -1) headerRow = rowIndex
        }
        
        // Unit column patterns
        else if (this.isUnitHeader(cellValue)) {
          unitCol = colIndex
          if (headerRow === -1) headerRow = rowIndex
        }
      }
      
      // If we found description and quantity, that's good enough
      if (descriptionCol >= 0 && quantityCol >= 0) {
        break
      }
    }
    
    return {
      found: descriptionCol >= 0 && quantityCol >= 0,
      headerRow,
      descriptionCol,
      quantityCol,
      rateCol,
      unitCol
    }
  }

  /**
   * Normalize header text for comparison
   */
  normalizeHeaderText(cellValue) {
    if (!cellValue) return ''
    return String(cellValue).toLowerCase().trim().replace(/[^a-z0-9]/g, '')
  }

  /**
   * Check if a header is a description column
   */
  isDescriptionHeader(normalized) {
    const patterns = [
      'description', 'desc', 'item', 'itemdescription', 'workdescription',
      'particulars', 'work', 'activity', 'specification', 'details',
      'scope', 'scopeofwork', 'operation', 'task', 'descriptionofwork',
      'itemofwork', 'workitem', 'material', 'service', 'component',
      'element', 'descr', 'itemdesc', 'workdesc', 'particular'
    ]
    return patterns.some(pattern => normalized.includes(pattern))
  }

  /**
   * Check if a header is a quantity column
   */
  isQuantityHeader(normalized) {
    const patterns = [
      'quantity', 'qty', 'quan', 'qnty', 'amount', 'volume', 'area',
      'length', 'nos', 'number', 'count', 'units', 'each', 'total',
      'sum', 'net', 'gross', 'quntity', 'qunatity', 'qnty', 'qtty',
      'no', 'num', 'nbr', 'pcs', 'pieces', 'meters', 'sqm', 'cum',
      'm2', 'm3', 'lm', 'kg', 'tons', 'tonnes', 'liters', 'gallons'
    ]
    return patterns.some(pattern => normalized.includes(pattern)) ||
           normalized.match(/^(qty|quan|qnty|no|nos|q|num|nbr|m|m2|m3)$/i)
  }

  /**
   * Check if a header is a rate/price column
   */
  isRateHeader(normalized) {
    const patterns = [
      'rate', 'price', 'unitrate', 'unitprice', 'cost', 'unitcost',
      'rateper', 'priceperunit', 'costperunit'
    ]
    return patterns.some(pattern => normalized.includes(pattern))
  }

  /**
   * Check if a header is a unit column
   */
  isUnitHeader(normalized) {
    const patterns = [
      'unit', 'uom', 'unitofmeasure', 'unitofmeasurement', 'measure',
      'measurement', 'units'
    ]
    return patterns.some(pattern => normalized.includes(pattern))
  }

  /**
   * Extract item data from a row - AGGRESSIVE MODE
   */
  extractItemFromRow(row, headerInfo, rowNumber, sheetName) {
    const description = this.extractDescription(row[headerInfo.descriptionCol])
    const quantity = this.extractQuantity(row[headerInfo.quantityCol])
    const rate = headerInfo.rateCol >= 0 ? this.extractRate(row[headerInfo.rateCol]) : null
    const unit = headerInfo.unitCol >= 0 ? this.extractUnit(row[headerInfo.unitCol]) : ''
    
    // AGGRESSIVE: Try to extract from ANY column if main columns fail
    let finalDescription = description
    let finalQuantity = quantity
    
    if (!finalDescription && row && row.length > 0) {
      // Look for description in any column with meaningful text
      for (let i = 0; i < row.length; i++) {
        if (i === headerInfo.quantityCol || i === headerInfo.rateCol) continue
        const cellDesc = this.extractDescription(row[i])
        if (cellDesc && cellDesc.length > 0) { // Even more lenient
          finalDescription = cellDesc
          break
        }
      }
    }
    
    if (!finalQuantity && row && row.length > 0) {
      // Look for quantity in any column after description column
      for (let i = headerInfo.descriptionCol + 1; i < row.length; i++) {
        const cellQty = this.extractQuantity(row[i])
        if (cellQty && cellQty > 0) {
          finalQuantity = cellQty
          break
        }
      }
    }
    
    // MUCH MORE LENIENT: Only skip if absolutely no description or quantity
    if (!finalDescription || finalDescription.length < 1) {
      return null
    }
    
    if (!finalQuantity || finalQuantity <= 0) {
      return null
    }
    
    // Skip obvious non-items but be very selective
    if (this.shouldSkipItem(finalDescription)) {
      return null
    }
    
    // NO DEDUPLICATION - return all items including duplicates
    const itemData = {
      id: `${sheetName}_${rowNumber}_${Date.now()}_${Math.random()}`, // More unique ID
      description: finalDescription.trim(),
      original_description: finalDescription.trim(),
      quantity: parseFloat(finalQuantity),
      rate: rate ? parseFloat(rate) : null,
      unit: unit || '',
      row_number: rowNumber,
      sheet_name: sheetName,
      total_amount: rate ? parseFloat(finalQuantity) * parseFloat(rate) : null
    }
    
    return itemData
  }

  /**
   * Extract and clean description text
   */
  extractDescription(cellValue) {
    if (!cellValue) return null
    
    let desc = String(cellValue).trim()
    
    // Only remove very obvious prefixes, keep most content
    desc = desc.replace(/^(item\s*\d+[\.\-\:\s]*)/i, '')
    desc = desc.replace(/^(\d+[\.\-\:\s]+)/i, '')
    
    // Don't remove parentheses content - it might be important specifications
    // desc = desc.replace(/\s*\(.*?\)\s*$/g, '') // Remove trailing parentheses content
    
    return desc.trim()
  }

  /**
   * Extract quantity from cell value
   */
  extractQuantity(cellValue) {
    if (!cellValue && cellValue !== 0) return null
    
    // Handle different quantity formats
    let qtyStr = String(cellValue).trim()
    
    // If it's already a number, return it
    if (!isNaN(qtyStr) && qtyStr !== '') {
      const qty = parseFloat(qtyStr)
      return qty > 0 ? qty : null
    }
    
    // Try to extract number from text - be more flexible
    // Look for patterns like "123.45", "1,234.56", "123", etc.
    const numberPattern = /(\d+(?:[,\.]\d+)*)/g
    const matches = qtyStr.match(numberPattern)
    
    if (matches && matches.length > 0) {
      // Take the first number found
      let numStr = matches[0]
      
      // Handle comma as thousands separator (only if followed by 3 digits)
      numStr = numStr.replace(/,(\d{3})/g, '$1')
      
      // Handle comma as decimal separator in some locales
      if (numStr.includes(',') && !numStr.includes('.')) {
        numStr = numStr.replace(/,/g, '.')
      }
      
      try {
        const qty = parseFloat(numStr)
        return !isNaN(qty) && qty > 0 ? qty : null
      } catch {
        return null
      }
    }
    
    return null
  }

  /**
   * Extract rate from cell value
   */
  extractRate(cellValue) {
    if (!cellValue) return null
    
    let rateStr = String(cellValue).trim()
    
    // Remove currency symbols and common text
    rateStr = rateStr.replace(/[£$€₹\s]/g, '')
    rateStr = rateStr.replace(/,(\d{3})/g, '$1')
    
    try {
      const rate = parseFloat(rateStr)
      return !isNaN(rate) && rate > 0 ? rate : null
    } catch {
      return null
    }
  }

  /**
   * Extract unit from cell value
   */
  extractUnit(cellValue) {
    if (!cellValue) return ''
    return String(cellValue).trim()
  }

  /**
   * Determine if an item should be skipped - ONLY SKIP ABSOLUTE TOTALS
   */
  shouldSkipItem(description) {
    const desc = description.toLowerCase().trim()
    
    // Only skip very specific total rows with exact match
    if (desc === 'grand total' || desc === 'page total') {
      return true
    }
    
    // Everything else is valid - we want ALL items
    return false
  }
} 