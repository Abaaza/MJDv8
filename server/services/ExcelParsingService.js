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
   * Detect fallback structure when headers aren't clear - SMART MODE
   */
  detectFallbackStructure(jsonData, sheetName) {
    console.log(`   🔍 Attempting SMART fallback structure detection for ${sheetName}`)
    
    // Strategy 1: Find the best description column by analyzing content quality
    const candidates = []
    
    for (let rowIndex = 0; rowIndex < Math.min(30, jsonData.length); rowIndex++) {
      const row = jsonData[rowIndex]
      if (!row || row.length < 2) continue
      
      // Analyze each column for description quality
      for (let colIndex = 0; colIndex < Math.min(15, row.length); colIndex++) {
        const cell = row[colIndex]
        if (!cell) continue
        
        // Calculate quality score for this column
        const quality = this.validateDescriptionColumn(jsonData, rowIndex, colIndex)
        if (quality >= 2) { // Minimum threshold for fallback
          candidates.push({
            headerRow: rowIndex,
            descriptionCol: colIndex,
            quality: quality,
            sampleContent: String(cell).substring(0, 30)
          })
          console.log(`   💡 Fallback candidate col ${colIndex + 1} at row ${rowIndex + 1}: quality ${quality}, sample: "${String(cell).substring(0, 30)}..."`)
        }
      }
    }
    
    // Sort by quality and select the best one
    if (candidates.length > 0) {
      const best = candidates.sort((a, b) => b.quality - a.quality)[0]
      
      // Now find the best quantity column near the description column
      let quantityCol = -1
      let rateCol = -1
      
      // Look for quantity column to the right of description column
      const headerRow = jsonData[best.headerRow]
      if (headerRow) {
        for (let colIndex = best.descriptionCol + 1; colIndex < Math.min(headerRow.length, best.descriptionCol + 8); colIndex++) {
          const quality = this.validateQuantityColumn(jsonData, best.headerRow, colIndex)
          if (quality >= 2) {
            quantityCol = colIndex
            console.log(`   💡 Found quantity column at ${colIndex + 1} (quality: ${quality})`)
            
            // Look for rate column after quantity
            if (colIndex + 1 < headerRow.length) {
              const rateQuality = this.validateQuantityColumn(jsonData, best.headerRow, colIndex + 1)
              if (rateQuality >= 1) {
                rateCol = colIndex + 1
              }
            }
            break
          }
        }
      }
      
      if (quantityCol >= 0) {
        console.log(`   ✅ Smart Fallback: Found description at col ${best.descriptionCol + 1}, quantity at col ${quantityCol + 1}`)
        return {
          found: true,
          headerRow: best.headerRow,
          descriptionCol: best.descriptionCol,
          quantityCol: quantityCol,
          rateCol: rateCol,
          unitCol: -1
        }
      }
    }
    
    // Strategy 2: If no good candidates found, try very basic fallback
    console.log(`   ⚠️ No good candidates found, trying basic fallback...`)
    
    // Look for ANY column with text longer than 10 characters on average
    for (let rowIndex = 0; rowIndex < Math.min(15, jsonData.length); rowIndex++) {
      const row = jsonData[rowIndex]
      if (!row || row.length < 2) continue
      
      for (let colIndex = 0; colIndex < Math.min(8, row.length); colIndex++) {
        const quality = this.validateDescriptionColumn(jsonData, rowIndex, colIndex)
        if (quality >= 1) { // Very low threshold
          // Find any numeric column to the right
          for (let qtyCol = colIndex + 1; qtyCol < Math.min(row.length, colIndex + 5); qtyCol++) {
            const qtyQuality = this.validateQuantityColumn(jsonData, rowIndex, qtyCol)
            if (qtyQuality >= 1) {
              console.log(`   ⚠️ Basic fallback: col ${colIndex + 1}=description, col ${qtyCol + 1}=quantity`)
              return {
                found: true,
                headerRow: rowIndex,
                descriptionCol: colIndex,
                quantityCol: qtyCol,
                rateCol: qtyCol + 1 < row.length ? qtyCol + 1 : -1,
                unitCol: -1
              }
            }
          }
        }
      }
    }
    
    return { found: false }
  }

  /**
   * Validate that a column contains numeric quantities
   * Returns a quality score (higher is better)
   */
  validateQuantityColumn(jsonData, headerRow, colIndex) {
    let quality = 0
    let numericRows = 0
    let totalRows = 0
    let positiveRows = 0
    let decimalRows = 0
    
    // Check up to 20 data rows after the header
    const maxRows = Math.min(headerRow + 21, jsonData.length)
    for (let rowIndex = headerRow + 1; rowIndex < maxRows; rowIndex++) {
      const row = jsonData[rowIndex]
      if (!row || !row[colIndex]) continue
      
      const cellValue = String(row[colIndex]).trim()
      if (cellValue.length === 0) continue
      
      totalRows++
      
      // Check if it's numeric
      if (!isNaN(cellValue) && cellValue !== '') {
        const value = parseFloat(cellValue)
        numericRows++
        
        if (value > 0) {
          positiveRows++
        }
        
        if (cellValue.includes('.') || cellValue.includes(',')) {
          decimalRows++
        }
      }
    }
    
    if (totalRows === 0) return 0
    
    const numericRatio = numericRows / totalRows
    const positiveRatio = positiveRows / totalRows
    
    // Start with base score if mostly numeric
    if (numericRatio > 0.7) quality += 3
    else if (numericRatio > 0.5) quality += 2
    else if (numericRatio > 0.3) quality += 1
    
    // Bonus for positive values (quantities should be positive)
    if (positiveRatio > 0.5) quality += 2
    else if (positiveRatio > 0.3) quality += 1
    
    // Bonus for having some decimal values (common in quantities)
    if (decimalRows > 0) quality += 1
    
    return Math.max(0, quality)
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
      
      // Track potential description columns with quality scores
      const descriptionCandidates = []
      
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const cellValue = this.normalizeHeaderText(row[colIndex])
        
        // Description column patterns
        if (this.isDescriptionHeader(cellValue)) {
          // Validate this column actually contains meaningful descriptions
          const quality = this.validateDescriptionColumn(jsonData, rowIndex, colIndex)
          descriptionCandidates.push({
            colIndex,
            quality,
            headerName: String(row[colIndex] || '').trim()
          })
          console.log(`   🔍 Found potential description column at ${colIndex + 1}: "${String(row[colIndex] || '').trim()}" (quality: ${quality})`)
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
      
      // Select the best description column based on quality
      if (descriptionCandidates.length > 0) {
        const bestCandidate = descriptionCandidates.sort((a, b) => b.quality - a.quality)[0]
        if (bestCandidate.quality >= 3) { // Minimum quality threshold
          descriptionCol = bestCandidate.colIndex
          headerRow = rowIndex
          console.log(`   ✅ Selected description column ${descriptionCol + 1}: "${bestCandidate.headerName}" (quality: ${bestCandidate.quality})`)
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
   * Validate that a column actually contains meaningful descriptions
   * Returns a quality score (higher is better)
   */
  validateDescriptionColumn(jsonData, headerRow, colIndex) {
    let quality = 0
    let textRows = 0
    let meaningfulRows = 0
    let totalLength = 0
    let numericRows = 0
    let shortRows = 0
    
    // Check up to 20 data rows after the header
    const maxRows = Math.min(headerRow + 21, jsonData.length)
    for (let rowIndex = headerRow + 1; rowIndex < maxRows; rowIndex++) {
      const row = jsonData[rowIndex]
      if (!row || !row[colIndex]) continue
      
      const cellValue = String(row[colIndex]).trim()
      if (cellValue.length === 0) continue
      
      textRows++
      totalLength += cellValue.length
      
      // Check if it's mostly numeric (bad for descriptions)
      if (/^\d+(\.\d+)?$/.test(cellValue)) {
        numericRows++
      }
      
      // Check if it's too short (bad for descriptions)
      if (cellValue.length <= 3) {
        shortRows++
      }
      
      // Check for meaningful descriptive content
      if (cellValue.length > 10 && 
          /[a-zA-Z]/.test(cellValue) && 
          !(/^\d+$/.test(cellValue))) {
        meaningfulRows++
      }
    }
    
    if (textRows === 0) return 0
    
    // Calculate quality score
    const averageLength = totalLength / textRows
    const meaningfulRatio = meaningfulRows / textRows
    const numericRatio = numericRows / textRows
    const shortRatio = shortRows / textRows
    
    // Start with base score
    quality = 1
    
    // Bonus for meaningful content
    if (meaningfulRatio > 0.7) quality += 5
    else if (meaningfulRatio > 0.5) quality += 3
    else if (meaningfulRatio > 0.3) quality += 1
    
    // Bonus for good average length
    if (averageLength > 30) quality += 3
    else if (averageLength > 15) quality += 2
    else if (averageLength > 5) quality += 1
    
    // Penalty for too many numeric values
    if (numericRatio > 0.8) quality -= 5
    else if (numericRatio > 0.5) quality -= 3
    else if (numericRatio > 0.3) quality -= 1
    
    // Penalty for too many short values
    if (shortRatio > 0.8) quality -= 3
    else if (shortRatio > 0.5) quality -= 2
    
    console.log(`     Column ${colIndex + 1} validation: ${textRows} rows, avg length: ${averageLength.toFixed(1)}, meaningful: ${meaningfulRatio.toFixed(2)}, numeric: ${numericRatio.toFixed(2)}, quality: ${quality}`)
    
    return Math.max(0, quality)
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