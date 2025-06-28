import XLSX from 'xlsx'
import ExcelJS from 'exceljs'
import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export class EnhancedExcelExportService {
  constructor() {
    // Use /tmp for serverless, local output dir otherwise
    this.outputDir = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME 
      ? '/tmp' 
      : path.join(__dirname, '..', 'output')
    this.tempDir = path.join(__dirname, '..', 'temp')
    
    // Ensure directories exist
    fs.ensureDirSync(this.outputDir)
    fs.ensureDirSync(this.tempDir)
  }

  /**
   * Enhanced export that properly handles rate cell population and column insertion
   */
  async exportWithOriginalFormat(originalFilePath, matchResults, jobId, originalFileName) {
    try {
      console.log(`📄 Creating enhanced export with original format for: ${originalFileName}`)
      
      // Validate matchResults
      if (!matchResults || !Array.isArray(matchResults)) {
        console.log('⚠️ No match results provided or invalid format, using empty array')
        matchResults = []
      }
      
      console.log(`📊 Processing ${matchResults.length} match results`)
      
      // Use ExcelJS for better format preservation
      const originalWorkbook = new ExcelJS.Workbook()
      await originalWorkbook.xlsx.readFile(originalFilePath)
      
      const newWorkbook = new ExcelJS.Workbook()
      
      // Copy workbook properties
      newWorkbook.creator = originalWorkbook.creator || 'Price Matching System'
      newWorkbook.lastModifiedBy = 'Price Matching System'
      newWorkbook.created = originalWorkbook.created || new Date()
      newWorkbook.modified = new Date()
      
      let totalItemsProcessed = 0
      
      // Process each worksheet
      for (const originalWorksheet of originalWorkbook.worksheets) {
        const sheetName = originalWorksheet.name
        console.log(`📋 Processing sheet: ${sheetName}`)
        
        // Create new worksheet with same name
        const newWorksheet = newWorkbook.addWorksheet(sheetName)
        
        // Copy worksheet properties
        newWorksheet.properties = { ...originalWorksheet.properties }
        newWorksheet.pageSetup = { ...originalWorksheet.pageSetup }
        newWorksheet.views = [...originalWorksheet.views]
        
        // Find matches for this sheet
        const sheetMatches = matchResults.filter(match => match.sheet_name === sheetName)
        console.log(`   🎯 Found ${sheetMatches.length} matches for sheet ${sheetName}`)
        
        // Create row lookup for matches
        const matchLookup = new Map()
        if (Array.isArray(sheetMatches) && sheetMatches.length > 0) {
          sheetMatches.forEach(match => {
            if (matchLookup.has(match.row_number)) {
              console.log(`   ⚠️ Duplicate row number ${match.row_number} in matches`)
            }
            matchLookup.set(match.row_number, match)
          })
          console.log(`   📊 Created match lookup with ${matchLookup.size} entries`)
        }
        
        // Analyze the sheet structure
        const sheetAnalysis = this.analyzeSheetStructure(originalWorksheet)
        console.log(`   📍 Sheet analysis:`, sheetAnalysis)
        
        // Determine insertion strategy for new columns
        const insertionStrategy = this.determineInsertionStrategy(originalWorksheet, sheetAnalysis)
        console.log(`   🎯 Insertion strategy:`, insertionStrategy)
        
        // Copy all rows with enhanced logic
        this.copyRowsWithEnhancements(
          originalWorksheet, 
          newWorksheet, 
          matchLookup, 
          sheetAnalysis, 
          insertionStrategy
        )
        
        // Copy additional worksheet properties
        this.copyWorksheetProperties(originalWorksheet, newWorksheet, insertionStrategy)
        
        totalItemsProcessed += sheetMatches.length
      }
      
      // Generate output path
      const outputPath = path.join(this.outputDir, `enhanced-matched-${jobId}-${originalFileName}`)
      
      // Write the new workbook
      await newWorkbook.xlsx.writeFile(outputPath)
      
      console.log(`✅ Enhanced export completed: ${outputPath}`)
      console.log(`📊 Total items processed: ${totalItemsProcessed}`)
      
      return outputPath
      
    } catch (error) {
      console.error(`❌ Error in enhanced exportWithOriginalFormat:`, error)
      throw error
    }
  }

  /**
   * Analyze the structure of the Excel sheet to find key columns and layout
   */
  analyzeSheetStructure(worksheet) {
    let rateColumnIndex = -1
    let quantityColumnIndex = -1
    let descriptionColumnIndex = -1
    let unitColumnIndex = -1
    let maxColumn = 1
    let headerRowNum = 1
    let dataStartRow = 2
    let lastDataRow = worksheet.rowCount || 1
    
    // Scan first 10 rows to find headers
    for (let rowNum = 1; rowNum <= Math.min(10, worksheet.rowCount); rowNum++) {
      const row = worksheet.getRow(rowNum)
      let foundHeaders = 0
      
      row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
        const cellValue = String(cell.value || '').toLowerCase().trim()
        
        // Look for quantity-related headers
        if (this.isQuantityColumn(cellValue)) {
          quantityColumnIndex = colNumber
          headerRowNum = rowNum
          foundHeaders++
        }
        
        // Look for rate-related headers
        if (this.isRateColumn(cellValue)) {
          rateColumnIndex = colNumber
          headerRowNum = rowNum
          foundHeaders++
        }
        
        // Look for description-related headers
        if (this.isDescriptionColumn(cellValue)) {
          descriptionColumnIndex = colNumber
          headerRowNum = rowNum
          foundHeaders++
        }
        
        // Look for unit-related headers
        if (this.isUnitColumn(cellValue)) {
          unitColumnIndex = colNumber
          headerRowNum = rowNum
          foundHeaders++
        }
        
        if (colNumber > maxColumn) maxColumn = colNumber
      })
      
      // If we found significant headers, this is likely the header row
      if (foundHeaders >= 2) {
        headerRowNum = rowNum
        dataStartRow = rowNum + 1
        break
      }
    }
    
    return {
      rateColumnIndex,
      quantityColumnIndex,
      descriptionColumnIndex,
      unitColumnIndex,
      maxColumn,
      headerRowNum,
      dataStartRow,
      lastDataRow
    }
  }

  /**
   * Determine the best strategy for inserting new columns
   */
  determineInsertionStrategy(worksheet, analysis) {
    const { 
      rateColumnIndex, 
      quantityColumnIndex, 
      maxColumn, 
      headerRowNum 
    } = analysis
    
    // Strategy 1: Try to place after quantity column
    if (quantityColumnIndex > 0) {
      // Check if there's space after quantity column
      const spacesAfterQuantity = this.countEmptyColumnsAfter(worksheet, quantityColumnIndex, headerRowNum)
      
      if (spacesAfterQuantity >= 2) {
        return {
          type: 'after_quantity',
          startColumn: quantityColumnIndex + 1,
          needsInsertion: false,
          availableSpace: spacesAfterQuantity
        }
      }
    }
    
    // Strategy 2: Try to place at the end
    const spacesAtEnd = this.countEmptyColumnsAfter(worksheet, maxColumn, headerRowNum)
    
    if (spacesAtEnd >= 2 || maxColumn <= 20) { // Reasonable column limit
      return {
        type: 'at_end',
        startColumn: maxColumn + 1,
        needsInsertion: false,
        availableSpace: spacesAtEnd
      }
    }
    
    // Strategy 3: Insert above existing data (emergency strategy)
    return {
      type: 'insert_above',
      startColumn: 1,
      needsInsertion: true,
      insertRowsCount: 3 // Match description, rate, unit
    }
  }

  /**
   * Copy rows with enhanced logic for rate population and column management
   */
  copyRowsWithEnhancements(originalWorksheet, newWorksheet, matchLookup, analysis, insertionStrategy) {
    const { rateColumnIndex, headerRowNum } = analysis
    
    // Handle insertion above data if needed
    let rowOffset = 0
    if (insertionStrategy.type === 'insert_above') {
      rowOffset = insertionStrategy.insertRowsCount
      this.insertHeadersAboveData(newWorksheet, insertionStrategy, analysis)
    }
    
    // Copy all rows
    originalWorksheet.eachRow({ includeEmpty: true }, (originalRow, rowNumber) => {
      const targetRowNumber = rowNumber + rowOffset
      const newRow = newWorksheet.getRow(targetRowNumber)
      const match = matchLookup.get(rowNumber)
      
      // Copy each cell with enhanced logic
      originalRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const newCell = newRow.getCell(colNumber)
        
        // Enhanced rate cell population - ONLY use existing rate column
        if (match && rateColumnIndex > 0 && colNumber === rateColumnIndex && rowNumber !== headerRowNum) {
          // Populate the existing rate cell with matched rate
          newCell.value = match.matched_rate !== undefined && match.matched_rate !== null ? match.matched_rate : 0
          
          console.log(`   💰 Populating existing rate cell (row ${rowNumber}, col ${colNumber}): ${match.matched_rate}`)
          
          // Preserve original formatting but add highlighting
          if (cell.style) {
            newCell.style = JSON.parse(JSON.stringify(cell.style))
          }
          // Add highlighting to show it was updated
          newCell.style = {
            ...newCell.style,
            fill: {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'E8F5E9' } // Light green background
            },
            border: {
              top: { style: 'thin', color: { argb: '4CAF50' } },
              left: { style: 'thin', color: { argb: '4CAF50' } },
              bottom: { style: 'thin', color: { argb: '4CAF50' } },
              right: { style: 'thin', color: { argb: '4CAF50' } }
            }
          }
          if (cell.numFmt || !newCell.numFmt) {
            newCell.numFmt = cell.numFmt || '#,##0.00'
          }
        } else {
          // Copy value and formatting as-is
          newCell.value = cell.value
          
          if (cell.style) {
            newCell.style = JSON.parse(JSON.stringify(cell.style))
          }
        }
        
        // Copy other cell properties
        this.copyCellProperties(cell, newCell)
      })
      
      // Copy row properties
      newRow.height = originalRow.height
      newRow.hidden = originalRow.hidden
      newRow.outlineLevel = originalRow.outlineLevel
      
      // Add new columns for match data (only if not inserting above)
      if (insertionStrategy.type !== 'insert_above' && match) {
        this.addMatchDataColumns(newRow, match, insertionStrategy, rowNumber === headerRowNum)
      }
    })
  }

  /**
   * Insert headers above existing data when needed
   */
  insertHeadersAboveData(newWorksheet, insertionStrategy, analysis) {
    // Add match description header
    const matchDescRow = newWorksheet.getRow(1)
    const matchDescCell = matchDescRow.getCell(1)
    matchDescCell.value = 'MATCHED DESCRIPTIONS'
    matchDescCell.style = {
      font: { bold: true, size: 12, color: { argb: 'FFFFFF' } },
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '1565C0' }
      },
      alignment: { horizontal: 'center', vertical: 'middle' },
      border: { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } }
    }
    
    // Add rate header
    const rateRow = newWorksheet.getRow(2)
    const rateCell = rateRow.getCell(1)
    rateCell.value = 'MATCHED RATES'
    rateCell.style = {
      font: { bold: true, size: 12, color: { argb: 'FFFFFF' } },
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '2E7D32' }
      },
      alignment: { horizontal: 'center', vertical: 'middle' },
      border: { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } }
    }
    
    // Add unit header
    const unitRow = newWorksheet.getRow(3)
    const unitCell = unitRow.getCell(1)
    unitCell.value = 'MATCHED UNITS'
    unitCell.style = {
      font: { bold: true, size: 12, color: { argb: 'FFFFFF' } },
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'E65100' }
      },
      alignment: { horizontal: 'center', vertical: 'middle' },
      border: { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } }
    }
  }

  /**
   * Add match data columns when space is available
   */
  addMatchDataColumns(newRow, match, insertionStrategy, isHeader) {
    const startCol = insertionStrategy.startColumn
    
    if (isHeader) {
      // Add headers for new columns
      const matchedNameHeader = newRow.getCell(startCol)
      matchedNameHeader.value = 'Matched Item'
      matchedNameHeader.style = {
        font: { bold: true, color: { argb: 'FFFFFF' } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '1565C0' } },
        alignment: { horizontal: 'center', vertical: 'middle' },
        border: { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } }
      }
      
      const unitHeader = newRow.getCell(startCol + 1)
      unitHeader.value = 'Unit'
      unitHeader.style = {
        font: { bold: true, color: { argb: 'FFFFFF' } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E65100' } },
        alignment: { horizontal: 'center', vertical: 'middle' },
        border: { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } }
      }
    } else {
      // Add match data
      const matchedNameCell = newRow.getCell(startCol)
      matchedNameCell.value = match.matched_description || ''
      matchedNameCell.style = {
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E3F2FD' } },
        border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } },
        alignment: { wrapText: true }
      }
      
      const unitCell = newRow.getCell(startCol + 1)
      unitCell.value = match.unit || match.matched_unit || ''
      unitCell.style = {
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3E0' } },
        border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } },
        alignment: { horizontal: 'center' }
      }
    }
  }

  /**
   * Copy additional worksheet properties
   */
  copyWorksheetProperties(originalWorksheet, newWorksheet, insertionStrategy) {
    // Copy column properties
    if (originalWorksheet && originalWorksheet.columns) {
      originalWorksheet.columns.forEach((column, index) => {
        if (column.width) {
          newWorksheet.getColumn(index + 1).width = column.width
        }
        if (column.hidden) {
          newWorksheet.getColumn(index + 1).hidden = column.hidden
        }
      })
    }
    
    // Set width for new columns if they exist
    if (insertionStrategy.type !== 'insert_above') {
      const startCol = insertionStrategy.startColumn
      newWorksheet.getColumn(startCol).width = 40 // Matched Item
      newWorksheet.getColumn(startCol + 1).width = 10 // Unit
    }
    
    // Copy merged cells (with offset if needed)
    if (originalWorksheet && originalWorksheet.model && originalWorksheet.model.merges) {
      try {
        const rowOffset = insertionStrategy.type === 'insert_above' ? insertionStrategy.insertRowsCount : 0
        
        for (const mergeRange of originalWorksheet.model.merges) {
          if (rowOffset > 0) {
            // Adjust merge range for row offset
            const adjustedRange = {
              ...mergeRange,
              top: mergeRange.top + rowOffset,
              bottom: mergeRange.bottom + rowOffset
            }
            newWorksheet.mergeCells(adjustedRange)
          } else {
            newWorksheet.mergeCells(mergeRange)
          }
        }
      } catch (mergeError) {
        console.warn(`⚠️ Could not merge cells: ${mergeError.message}`)
      }
    }
  }

  /**
   * Helper functions for column detection
   */
  isQuantityColumn(cellValue) {
    const quantityTerms = ['quantity', 'qty', 'quantities', 'no', 'nos', 'number', 'count', 'amount']
    return quantityTerms.some(term => cellValue.includes(term))
  }

  isRateColumn(cellValue) {
    const rateTerms = ['rate', 'price', 'unit rate', 'unit price', 'cost', 'amount']
    return rateTerms.some(term => cellValue.includes(term))
  }

  isDescriptionColumn(cellValue) {
    const descTerms = ['description', 'item', 'work', 'activity', 'task', 'service']
    return descTerms.some(term => cellValue.includes(term))
  }

  isUnitColumn(cellValue) {
    const unitTerms = ['unit', 'uom', 'measure', 'measurement']
    return unitTerms.some(term => cellValue.includes(term))
  }

  /**
   * Count empty columns after a given column
   */
  countEmptyColumnsAfter(worksheet, columnIndex, headerRowNum) {
    let emptyCount = 0
    const checkRow = worksheet.getRow(headerRowNum)
    
    for (let col = columnIndex + 1; col <= columnIndex + 10; col++) {
      const cell = checkRow.getCell(col)
      if (!cell.value || String(cell.value).trim() === '') {
        emptyCount++
      } else {
        break
      }
    }
    
    return emptyCount
  }

  /**
   * Copy cell properties safely
   */
  copyCellProperties(sourceCell, targetCell) {
    try {
      if (sourceCell.formula && !sourceCell.sharedFormula) {
        targetCell.formula = sourceCell.formula
      } else if (sourceCell.sharedFormula) {
        targetCell.value = sourceCell.value
      }
      if (sourceCell.hyperlink) targetCell.hyperlink = sourceCell.hyperlink
      if (sourceCell.dataValidation) targetCell.dataValidation = JSON.parse(JSON.stringify(sourceCell.dataValidation))
      if (sourceCell.comment) targetCell.comment = sourceCell.comment
      if (sourceCell.name) targetCell.name = sourceCell.name
    } catch (err) {
      console.warn(`⚠️ Could not copy cell property: ${err.message}`)
    }
  }

  /**
   * Export filtered results from the UI (unchanged)
   */
  async exportFilteredResults(jobId, matchResults, originalFileName = 'filtered_results.xlsx') {
    try {
      console.log(`📤 Exporting ${matchResults?.length || 0} filtered results`)
      
      if (!matchResults || !Array.isArray(matchResults)) {
        throw new Error('Match results must be a valid array')
      }
      
      const outputPath = path.join(this.outputDir, `filtered-${jobId}-${originalFileName}`)
      
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Filtered Results')
      
      const headers = [
        'Sheet Name', 'Row Number', 'Original Description', 'Matched Description', 
        'Quantity', 'Matched Rate', 'Unit', 'Total Amount', 'Confidence %', 'Match Method'
      ]
      
      const headerRow = worksheet.addRow(headers)
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFF' } }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '4472C4' } }
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
      })
      
      if (matchResults && matchResults.length > 0) {
        matchResults.forEach(match => {
          const row = worksheet.addRow([
            match.sheet_name || '', match.row_number || '', match.original_description || '',
            match.matched_description || '', match.quantity || '', match.matched_rate || '',
            match.unit || '', match.total_amount || '', 
            Math.round((match.similarity_score || 0) * 100) + '%', match.match_method || ''
          ])
          
          row.eachCell((cell) => {
            cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
          })
        })
      }
      
      worksheet.columns.forEach(column => {
        let maxLength = 0
        column.eachCell({ includeEmpty: false }, (cell) => {
          const columnLength = cell.value ? cell.value.toString().length : 10
          if (columnLength > maxLength) maxLength = columnLength
        })
        column.width = Math.min(maxLength + 2, 50)
      })
      
      await workbook.xlsx.writeFile(outputPath)
      console.log(`✅ Filtered export completed: ${outputPath}`)
      return outputPath
      
    } catch (error) {
      console.error(`❌ Error in exportFilteredResults:`, error)
      throw error
    }
  }
}