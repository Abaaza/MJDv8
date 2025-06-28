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
      
      // Load workbook with error handling for corrupted files
      let workbook
      try {
        workbook = XLSX.readFile(filePath, { 
          cellDates: true, 
          cellNF: false, 
          cellText: false,
          sheetStubs: false,
          bookVBA: false,
          password: '' // Handle password-protected files gracefully
        })
      } catch (readError) {
        console.error('❌ Error reading Excel file:', readError.message)
        if (readError.message.includes('password') || readError.message.includes('encrypted')) {
          throw new Error('File appears to be password protected. Please provide an unprotected Excel file.')
        }
        if (readError.message.includes('format') || readError.message.includes('BIFF')) {
          throw new Error('Unsupported Excel format. Please save as .xlsx or .xls format.')
        }
        throw new Error(`Unable to read Excel file: ${readError.message}`)
      }
      
      console.log(`📊 Found ${workbook.SheetNames.length} sheets:`, workbook.SheetNames)
      
      // Filter out hidden or system sheets
      const visibleSheets = workbook.SheetNames.filter(name => {
        const sheet = workbook.Sheets[name]
        return sheet && !name.startsWith('_') && !name.toLowerCase().includes('hidden')
      })
      
      if (visibleSheets.length === 0) {
        throw new Error('No readable sheets found in Excel file')
      }
      
      console.log(`📋 Processing ${visibleSheets.length} visible sheets:`, visibleSheets)
      
      let allItems = []
      let totalRowsProcessed = 0
      let itemsWithQuantities = 0
      let sectionHeaders = [] // Store section headers
      
      // Process each visible sheet
      for (const sheetName of visibleSheets) {
        try {
          console.log(`📋 Processing sheet: ${sheetName}`)
          
          // Check if sheet has any data before processing
          const sheet = workbook.Sheets[sheetName]
          const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:A1')
          const rowCount = range.e.r - range.s.r + 1
          const colCount = range.e.c - range.s.c + 1
          
          console.log(`   📏 Sheet dimensions: ${rowCount} rows x ${colCount} columns`)
          
          if (rowCount < 2 || colCount < 2) {
            console.log(`   ⏭️ Skipping sheet ${sheetName} - insufficient data`)
            continue
          }
          
          const { items: sheetItems, headers: sheetHeaders } = await this.processSheet(workbook, sheetName)
          
          console.log(`   📌 Raw items found: ${sheetItems.length}`)
          
          // Enhanced filtering with better validation
          const validItems = sheetItems.filter(item => {
            const qty = parseFloat(item.quantity)
            const hasValidQty = !isNaN(qty) && qty > 0 && qty < 999999 // Reasonable upper limit
            const desc = (item.description || '').trim()
            const hasValidDesc = desc.length >= 3 && 
                                !desc.match(/^(total|subtotal|sum|^\d+$|^[a-z]$)$/i) && // Exclude totals/single chars
                                !desc.match(/^={2,}|^-{2,}|^_{2,}/) // Exclude separator lines
            
            if (!hasValidQty && hasValidDesc && item.quantity !== undefined) {
              console.log(`   ⚠️ Skipping item with invalid quantity: "${desc.substring(0, 50)}..." qty: ${item.quantity} at row ${item.row_number}`)
            }
            if (hasValidQty && !hasValidDesc) {
              console.log(`   ⚠️ Skipping item with invalid description at row ${item.row_number}, qty: ${item.quantity}, desc: "${desc}"`)
            }
            
            return hasValidQty && hasValidDesc
          })
          
          console.log(`   📌 Valid items with quantities: ${validItems.length}`)
          
          // Add section headers to items for better context
          validItems.forEach(item => {
            // Find ALL headers before this item (up to 3 levels)
            const relevantHeaders = sheetHeaders
              .filter(h => h.row < item.row_number)
              .sort((a, b) => b.row - a.row)
              .slice(0, 3) // Take up to 3 most recent headers
            
            if (relevantHeaders.length > 0) {
              // Combine headers for hierarchical context (newest to oldest)
              const headerContext = relevantHeaders
                .reverse() // Put in chronological order
                .map(h => h.text)
                .join(' > ')
              
              item.section_header = headerContext
              
              // Also enhance the description with context if it's very short
              if (item.description.length < 30 && !item.description.toLowerCase().includes(relevantHeaders[0].text.toLowerCase())) {
                // Prepend the most recent header for better matching
                item.enhanced_description = `${relevantHeaders[relevantHeaders.length - 1].text}: ${item.description}`
                console.log(`   🔧 Enhanced description: "${item.enhanced_description}"`)
              }
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
      
      // Post-processing: Remove duplicates and validate data quality
      const uniqueItems = this.removeDuplicateItems(allItems)
      const qualityScore = this.calculateDataQuality(uniqueItems, totalRowsProcessed)
      
      console.log(`📈 Parsing Summary:`)
      console.log(`   - Total rows processed: ${totalRowsProcessed}`)
      console.log(`   - Items with quantities found: ${itemsWithQuantities}`)
      console.log(`   - Before duplicate removal: ${allItems.length} items`)
      console.log(`   - Duplicates removed: ${allItems.length - uniqueItems.length}`)
      console.log(`   - Final items for matching: ${uniqueItems.length}`)
      console.log(`   - Section headers found: ${sectionHeaders.length}`)
      console.log(`   - Data quality score: ${qualityScore}%`)
      
      if (qualityScore < 60) {
        console.warn(`⚠️ Low data quality detected. Please verify Excel file format.`)
      }
      
      allItems = uniqueItems
      
      return allItems
      
    } catch (error) {
      console.error(`❌ Error parsing Excel file:`, error)
      console.error(`   Stack:`, error.stack)
      
      // Provide more helpful error messages
      if (error.message.includes('ENOENT')) {
        throw new Error('Excel file not found or has been moved')
      }
      if (error.message.includes('permission') || error.message.includes('EACCES')) {
        throw new Error('Permission denied accessing Excel file. Please ensure file is not open in Excel.')
      }
      if (error.message.includes('EMFILE') || error.message.includes('too many files')) {
        throw new Error('System resource limit reached. Please try again in a moment.')
      }
      
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
    
    // DEBUG: Log the actual header row to verify columns
    if (headerInfo.headerRow >= 0 && jsonData[headerInfo.headerRow]) {
      const headerRow = jsonData[headerInfo.headerRow]
      console.log(`   📊 Header row contents:`)
      headerRow.forEach((cell, idx) => {
        if (cell) {
          console.log(`      Col ${idx + 1}: "${String(cell).trim()}"`)
        }
      })
      
      // Verify we're reading from the right column
      if (headerInfo.descriptionCol >= 0 && headerRow[headerInfo.descriptionCol]) {
        console.log(`   ✅ Description header verified: "${headerRow[headerInfo.descriptionCol]}"`)
      }
      
      // Sample first data row to verify we're reading the right data
      const firstDataRow = jsonData[headerInfo.headerRow + 1]
      if (firstDataRow && firstDataRow[headerInfo.descriptionCol]) {
        console.log(`   📝 First description value: "${String(firstDataRow[headerInfo.descriptionCol]).substring(0, 50)}..."`)
      }
    }
    
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
        // DEBUG: Log first few items to verify we're reading the right data
        if (items.length < 3) {
          console.log(`   📝 Item ${items.length + 1}: "${item.description.substring(0, 50)}..." (Row ${item.row_number})`)
        }
        items.push(item)
      } else {
        // Count why items were skipped for debugging
        const description = this.extractDescription(row[headerInfo.descriptionCol])
        const quantity = this.extractQuantity(row[headerInfo.quantityCol])
        
        // DEBUG: Log what we're trying to extract
        if (skippedNoDesc < 3 || skippedNoQty < 3) {
          console.log(`   ⚠️ Skipped row ${rowIndex + 1}: desc="${row[headerInfo.descriptionCol]}", qty="${row[headerInfo.quantityCol]}"`)
        }
        
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
      
      // Enhanced header detection patterns for BOQ documents
      
      // Pattern 1: Numbered sections like "1.1 PILING", "2.3 CONCRETE"
      const numberedSectionPattern = /^\d+(\.\d+)*\s+[A-Z]/
      
      // Pattern 2: Letter-based sections like "D Groundwork", "D20 Excavating"
      const letterSectionPattern = /^[A-Z]\d*\s+[A-Z]/
      
      // Pattern 3: All caps headers that are meaningful (not just random text)
      const isAllCaps = desc === desc.toUpperCase() && desc.length > 3
      
      // Pattern 4: Headers with specific keywords
      const headerKeywords = [
        'piling', 'groundwork', 'excavating', 'filling', 'concrete', 
        'steel', 'masonry', 'plumbing', 'electrical', 'finishes',
        'general', 'preliminary', 'summary', 'total', 'provisional'
      ]
      const hasKeyword = headerKeywords.some(kw => desc.toLowerCase().includes(kw))
      
      // Pattern 5: Underlined or formatted headers (often have specific text patterns)
      const hasUnderlinePattern = desc.includes('_') || desc.includes('=')
      
      // Check if most cells in the row are empty (typical for headers)
      const nonEmptyCells = row.filter(cell => cell && String(cell).trim()).length
      const mostlyEmpty = nonEmptyCells <= 3 // Allow up to 3 non-empty cells
      
      // Determine if this is a header
      if (numberedSectionPattern.test(desc) || 
          letterSectionPattern.test(desc) || 
          (isAllCaps && hasKeyword && mostlyEmpty) || 
          (hasKeyword && mostlyEmpty && desc.length < 100) ||
          hasUnderlinePattern) {
        
        console.log(`   📑 Found section header: "${desc}"`)
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
        
        // Enhanced text detection - exclude single numbers or very short text
        const hasText = isNaN(cellStr) && cellStr.length > 3 && 
                       !cellStr.match(/^[A-Z]$/) && // Not just single letter
                       !cellStr.match(/^\d+$/) // Not just numbers
        const hasNumber = !isNaN(cellStr) && parseFloat(cellStr) > 0
        const hasMeaningfulText = hasText && 
                                 cellStr.split(' ').length > 1 || // Multiple words
                                 cellStr.length > 10 // Or reasonably long single word
        
        columnInfo.push({
          index: colIndex,
          content: cellStr,
          hasText,
          hasNumber,
          hasMeaningfulText,
          length: cellStr.length
        })
      }
      
      // Find best text column (prefer meaningful text over short text)
      const textColumns = columnInfo.filter(col => col.hasMeaningfulText || (col.hasText && col.length > 5))
      const numberColumns = columnInfo.filter(col => col.hasNumber)
      
      if (textColumns.length > 0 && numberColumns.length > 0) {
        // Prefer columns with meaningful text (multiple words or longer text)
        const bestTextCol = textColumns.sort((a, b) => {
          // Prioritize meaningful text
          if (a.hasMeaningfulText && !b.hasMeaningfulText) return -1
          if (!a.hasMeaningfulText && b.hasMeaningfulText) return 1
          // Then by length
          return b.length - a.length
        })[0]
        
        // For quantity, prefer columns that come after the description column
        const quantityColumns = numberColumns.filter(col => col.index > bestTextCol.index)
        const bestNumberCol = quantityColumns.length > 0 ? quantityColumns[0] : numberColumns[0]
        
        console.log(`   ✅ Aggressive Fallback: Found description at col ${bestTextCol.index + 1} ("${bestTextCol.content.substring(0, 30)}..."), quantity at col ${bestNumberCol.index + 1}`)
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
    
    // Strategy 2: Look for Description header explicitly before using last resort
    for (let rowIndex = 0; rowIndex < Math.min(15, jsonData.length); rowIndex++) {
      const row = jsonData[rowIndex]
      if (!row) continue
      
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const cellValue = String(row[colIndex] || '').trim()
        if (cellValue.toLowerCase() === 'description' || cellValue.toLowerCase() === 'desc') {
          console.log(`   ✅ Found Description header in fallback search at row ${rowIndex + 1}, col ${colIndex + 1}`)
          
          // Look for quantity column after description
          let quantityCol = -1
          for (let qCol = colIndex + 1; qCol < row.length; qCol++) {
            const qCell = String(row[qCol] || '').trim().toLowerCase()
            if (qCell.includes('qty') || qCell.includes('quantity') || qCell === 'no' || qCell === 'nos') {
              quantityCol = qCol
              break
            }
          }
          
          if (quantityCol >= 0) {
            return {
              found: true,
              headerRow: rowIndex,
              descriptionCol: colIndex,
              quantityCol: quantityCol,
              rateCol: -1,
              unitCol: -1
            }
          }
        }
      }
    }
    
    // LAST RESORT: Only if we really can't find headers
    if (jsonData.length > 5) {
      console.log(`   ⚠️ Using LAST RESORT fallback - WARNING: This may pick wrong columns!`)
      console.log(`   ⚠️ Please ensure your Excel has a 'Description' header`)
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
      
      // First pass: Look for exact "Description" match (case-insensitive)
      let foundExactDescription = false
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const cellValue = String(row[colIndex] || '').trim()
        
        // Check for exact "Description" match first (highest priority)
        if (cellValue.toLowerCase() === 'description') {
          descriptionCol = colIndex
          headerRow = rowIndex
          foundExactDescription = true
          console.log(`   ✅ Found exact "Description" header at row ${rowIndex + 1}, col ${colIndex + 1}`)
        }
      }
      
      // Second pass: Look for other headers
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const cellValue = this.normalizeHeaderText(row[colIndex])
        
        // Skip if we already found exact description column
        if (foundExactDescription && colIndex === descriptionCol) continue
        
        // Description column patterns (only if we haven't found exact match)
        if (!foundExactDescription && this.isDescriptionHeader(cellValue)) {
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
    // Exclude patterns that are definitely NOT description columns
    const excludePatterns = ['bill', 'billing', 'flag', 'flags', 'ref', 'reference', 'page', 'section', 'no', 'number', 'serial', 'sr']
    if (excludePatterns.some(pattern => normalized === pattern || normalized.endsWith(pattern))) {
      return false
    }
    
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
    // DEBUG: Log what we're extracting
    if (rowNumber <= headerInfo.headerRow + 3) {
      console.log(`   🔍 Row ${rowNumber}: Extracting from col ${headerInfo.descriptionCol + 1} = "${row[headerInfo.descriptionCol]}", col ${headerInfo.quantityCol + 1} = "${row[headerInfo.quantityCol]}"`)
    }
    
    const description = this.extractDescription(row[headerInfo.descriptionCol])
    const quantity = this.extractQuantity(row[headerInfo.quantityCol])
    const rate = headerInfo.rateCol >= 0 ? this.extractRate(row[headerInfo.rateCol]) : null
    const unit = headerInfo.unitCol >= 0 ? this.extractUnit(row[headerInfo.unitCol]) : ''
    
    // AGGRESSIVE: Try to extract from ANY column if main columns fail
    let finalDescription = description
    let finalQuantity = quantity
    
    if (!finalDescription && row && row.length > 0) {
      console.log(`   ⚠️ No description found in designated column ${headerInfo.descriptionCol + 1}, searching other columns...`)
      // Look for description in any column with meaningful text
      for (let i = 0; i < row.length; i++) {
        if (i === headerInfo.quantityCol || i === headerInfo.rateCol) continue
        const cellDesc = this.extractDescription(row[i])
        if (cellDesc && cellDesc.length > 0) { // Even more lenient
          console.log(`   ✅ Found description in column ${i + 1}: "${cellDesc.substring(0, 30)}..."`)
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
    
    // CRITICAL: Reject pure numbers or very short numeric values
    if (desc.match(/^\d+$/) && desc.length <= 3) {
      console.log(`   ❌ Rejecting numeric-only description: "${desc}"`)
      return null
    }
    
    // Also reject single letters
    if (desc.match(/^[A-Z]$/i)) {
      console.log(`   ❌ Rejecting single letter description: "${desc}"`)
      return null
    }
    
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

  /**
   * Remove duplicate items based on description and quantity
   */
  removeDuplicateItems(items) {
    const seen = new Map()
    const unique = []
    
    for (const item of items) {
      // More precise duplicate detection: include row number to avoid removing legitimate items
      // Only remove if EXACT same description, quantity, sheet AND adjacent rows (likely actual duplicates)
      const descKey = item.description.toLowerCase().trim()
      const key = `${descKey}_${item.quantity}_${item.sheet_name}`
      
      const previousItem = seen.get(key)
      
      if (!previousItem) {
        // First occurrence, keep it
        seen.set(key, item)
        unique.push(item)
      } else {
        // Check if it's likely a real duplicate (adjacent rows or very close)
        const rowDiff = Math.abs(item.row_number - previousItem.row_number)
        
        if (rowDiff <= 2 && item.sheet_name === previousItem.sheet_name) {
          // Likely a duplicate (same content in adjacent rows)
          console.log(`   🔄 Removed likely duplicate: "${item.description.substring(0, 40)}..." at row ${item.row_number} (previous at row ${previousItem.row_number})`)
        } else {
          // Not adjacent - likely legitimate item with same description/qty
          // Keep it but update the seen map for future comparisons
          seen.set(key, item)
          unique.push(item)
          console.log(`   ✅ Kept similar item: "${item.description.substring(0, 40)}..." at row ${item.row_number} (different context)`)
        }
      }
    }
    
    console.log(`   📊 Duplicate removal: ${items.length} items → ${unique.length} unique items`)
    return unique
  }

  /**
   * Calculate data quality score based on various metrics
   */
  calculateDataQuality(items, totalRows) {
    if (totalRows === 0) return 0
    
    let qualityScore = 0
    let checks = 0
    
    // Check 1: Item extraction rate (should be > 10% of total rows)
    const extractionRate = (items.length / totalRows) * 100
    qualityScore += Math.min(extractionRate * 2, 40) // Max 40 points
    checks++
    
    // Check 2: Description quality (length, variety)
    const avgDescLength = items.reduce((sum, item) => sum + item.description.length, 0) / items.length
    const descQuality = Math.min((avgDescLength / 30) * 30, 30) // Max 30 points
    qualityScore += descQuality
    checks++
    
    // Check 3: Quantity validity (reasonable ranges)
    const validQuantities = items.filter(item => {
      const qty = parseFloat(item.quantity)
      return qty > 0 && qty <= 10000 // Reasonable range
    }).length
    const qtyQuality = (validQuantities / items.length) * 20 // Max 20 points
    qualityScore += qtyQuality
    checks++
    
    // Check 4: Structural consistency (presence of units, rates)
    const withUnits = items.filter(item => item.unit && item.unit.trim()).length
    const structuralQuality = (withUnits / items.length) * 10 // Max 10 points
    qualityScore += structuralQuality
    checks++
    
    return Math.round(qualityScore)
  }

  /**
   * Enhanced description extraction with better text cleaning
   */
  extractDescription(cell) {
    if (!cell) return null
    
    let description = String(cell).trim()
    
    // Remove excessive whitespace and normalize
    description = description.replace(/\s+/g, ' ')
    
    // Remove common Excel artifacts
    description = description.replace(/^[-=_]+$/, '') // Separator lines
    description = description.replace(/^\d+\.$/, '') // Just numbers with dots
    
    // Filter out very short or meaningless descriptions
    if (description.length < 3) return null
    if (/^[A-Z]$/.test(description)) return null // Single capital letters
    if (/^\d+$/.test(description)) return null // Just numbers
    
    return description
  }

  /**
   * Enhanced quantity extraction with better number parsing
   */
  extractQuantity(cell) {
    if (!cell) return null
    
    const cellStr = String(cell).trim()
    
    // Handle various number formats
    let cleanedStr = cellStr
      .replace(/,/g, '') // Remove commas
      .replace(/[^\d.-]/g, '') // Keep only digits, dots, and minus
    
    const quantity = parseFloat(cleanedStr)
    
    // Validate the quantity
    if (isNaN(quantity) || quantity <= 0 || quantity > 999999) {
      return null
    }
    
    return quantity
  }
} 