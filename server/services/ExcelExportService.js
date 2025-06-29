import XLSX from 'xlsx'
import ExcelJS from 'exceljs'
import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export class ExcelExportService {
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
   * Export results while preserving original Excel structure
   * Enhanced for complete format preservation including colors, formulas, row heights, column widths
   */
  async exportWithOriginalFormat(originalFilePath, matchResults, jobId, originalFileName) {
    try {
      console.log(`📄 Creating export with ENHANCED format preservation for: ${originalFileName}`)
      
      // Validate matchResults
      if (!matchResults || !Array.isArray(matchResults)) {
        console.log('⚠️ No match results provided or invalid format, using empty array')
        matchResults = []
      }
      
      console.log(`📊 Processing ${matchResults.length} match results`)
      
      // Use ExcelJS for complete format preservation
      const originalWorkbook = new ExcelJS.Workbook()
      
      // Enhanced read options to preserve all formatting
      await originalWorkbook.xlsx.readFile(originalFilePath, {
        ignoreNodes: [],
        map: (v, p) => v
      })
      
      const newWorkbook = new ExcelJS.Workbook()
      
      // Copy ALL workbook properties for complete preservation
      newWorkbook.creator = originalWorkbook.creator || 'Price Matching System'
      newWorkbook.lastModifiedBy = 'Price Matching System'
      newWorkbook.created = originalWorkbook.created || new Date()
      newWorkbook.modified = new Date()
      newWorkbook.company = originalWorkbook.company
      newWorkbook.manager = originalWorkbook.manager
      newWorkbook.title = originalWorkbook.title
      newWorkbook.subject = originalWorkbook.subject
      newWorkbook.keywords = originalWorkbook.keywords
      newWorkbook.category = originalWorkbook.category
      newWorkbook.description = originalWorkbook.description
      
      // Copy calculation properties
      if (originalWorkbook.calcProperties) {
        newWorkbook.calcProperties = { ...originalWorkbook.calcProperties }
      }
      
      let totalItemsProcessed = 0
      
      // Process ALL worksheets (including hidden ones)
      for (const originalWorksheet of originalWorkbook.worksheets) {
        const sheetName = originalWorksheet.name
        console.log(`📋 Processing sheet: ${sheetName} (${originalWorksheet.state || 'visible'})`)
        
        // Create new worksheet with same name and ALL properties
        const newWorksheet = newWorkbook.addWorksheet(sheetName, {
          state: originalWorksheet.state,
          properties: originalWorksheet.properties
        })
        
        // Copy ALL worksheet properties for complete preservation
        newWorksheet.properties = JSON.parse(JSON.stringify(originalWorksheet.properties || {}))
        newWorksheet.pageSetup = JSON.parse(JSON.stringify(originalWorksheet.pageSetup || {}))
        newWorksheet.views = JSON.parse(JSON.stringify(originalWorksheet.views || []))
        newWorksheet.headerFooter = JSON.parse(JSON.stringify(originalWorksheet.headerFooter || {}))
        newWorksheet.dataValidations = JSON.parse(JSON.stringify(originalWorksheet.dataValidations || {}))
        
        // Copy print settings
        if (originalWorksheet.pageBreaks) {
          newWorksheet.pageBreaks = JSON.parse(JSON.stringify(originalWorksheet.pageBreaks))
        }
        
        // Copy auto filter settings
        if (originalWorksheet.autoFilter) {
          newWorksheet.autoFilter = originalWorksheet.autoFilter
        }
        
        // Copy protection settings
        if (originalWorksheet.protection) {
          newWorksheet.protection = JSON.parse(JSON.stringify(originalWorksheet.protection))
        }
        
        // Find matches for this sheet
        const sheetMatches = matchResults.filter(match => match.sheet_name === sheetName)
        console.log(`   🎯 Found ${sheetMatches.length} matches for sheet ${sheetName}`)
        
        // Create row lookup for matches
        const matchLookup = new Map()
        if (Array.isArray(sheetMatches) && sheetMatches.length > 0) {
          sheetMatches.forEach(match => {
            // Log for debugging row number mapping
            if (matchLookup.has(match.row_number)) {
              console.log(`   ⚠️ Duplicate row number ${match.row_number} in matches`)
            }
            matchLookup.set(match.row_number, match)
          })
          console.log(`   📊 Created match lookup with ${matchLookup.size} entries`)
          console.log(`   📊 Row numbers in matches: ${Array.from(matchLookup.keys()).slice(0, 5).join(', ')}...`)
        }
        
        // Enhanced column detection and insertion strategy
        const sheetAnalysis = this.analyzeSheetStructure(originalWorksheet)
        const insertionStrategy = this.determineInsertionStrategy(originalWorksheet, sheetAnalysis)
        
        console.log(`   📍 Sheet analysis:`, sheetAnalysis)
        console.log(`   🎯 Insertion strategy:`, insertionStrategy)
        
        // Use COMPLETE row copying with full format preservation
        this.copyRowsWithCompleteFormatPreservation(
          originalWorksheet, 
          newWorksheet, 
          matchLookup, 
          sheetAnalysis, 
          insertionStrategy
        )
        
        // Copy ALL column properties (widths, styles, hidden state)
        this.copyCompleteColumnProperties(originalWorksheet, newWorksheet)
        
        // Copy conditional formatting
        this.copyConditionalFormatting(originalWorksheet, newWorksheet)
        
        // Copy merged cells with exact positioning
        this.copyMergedCellsExact(originalWorksheet, newWorksheet, insertionStrategy)
        
        // Copy images and charts if present
        await this.copyImagesAndCharts(originalWorksheet, newWorksheet)
        
        totalItemsProcessed += sheetMatches.length
        
        // Add headers and finalize columns based on insertion strategy
        if (insertionStrategy.type !== 'insert_above') {
          this.addColumnHeaders(newWorksheet, insertionStrategy, sheetAnalysis)
        }
        
        // Copy ALL remaining worksheet properties
        this.copyAllWorksheetProperties(originalWorksheet, newWorksheet, insertionStrategy)
        
        // Copy row groups and outline levels
        this.copyRowGroupsAndOutlines(originalWorksheet, newWorksheet)
        
        // Copy column groups and outline levels
        this.copyColumnGroupsAndOutlines(originalWorksheet, newWorksheet)
      }
      
      // Generate output path
      const outputPath = path.join(this.outputDir, `matched-${jobId}-${originalFileName}`)
      
      // Write the new workbook
      await newWorkbook.xlsx.writeFile(outputPath)
      
      console.log(`✅ Export completed: ${outputPath}`)
      console.log(`📊 Total items processed: ${totalItemsProcessed}`)
      
      return outputPath
      
    } catch (error) {
      console.error(`❌ Error in exportWithOriginalFormat:`, error)
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
    
    // If no rate column found, we'll need to create one
    const needsRateColumn = rateColumnIndex === -1
    
    return {
      rateColumnIndex,
      quantityColumnIndex,
      descriptionColumnIndex,
      unitColumnIndex,
      maxColumn,
      headerRowNum,
      dataStartRow,
      lastDataRow,
      needsRateColumn
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
      headerRowNum,
      needsRateColumn
    } = analysis
    
    // Strategy 1: Try to place after quantity column (with 3 empty columns gap)
    if (quantityColumnIndex > 0) {
      // Calculate required columns: rate column (if needed) + 3 empty + 2 for match data
      const requiredColumns = (needsRateColumn ? 1 : 0) + 3 + 2
      const spacesAfterQuantity = this.countEmptyColumnsAfter(worksheet, quantityColumnIndex, headerRowNum)
      
      if (spacesAfterQuantity >= requiredColumns) {
        const rateColumn = needsRateColumn ? quantityColumnIndex + 1 : -1
        const matchDataStart = quantityColumnIndex + (needsRateColumn ? 1 : 0) + 4 // Skip rate + 3 empty
        
        return {
          type: 'after_quantity',
          startColumn: matchDataStart,
          needsInsertion: false,
          availableSpace: spacesAfterQuantity,
          emptyColumnsGap: 3,
          needsRateColumn,
          rateColumnPosition: rateColumn
        }
      }
    }
    
    // Strategy 2: Try to place at the end (with 3 empty columns gap)
    const spacesAtEnd = this.countEmptyColumnsAfter(worksheet, maxColumn, headerRowNum)
    
    if (spacesAtEnd >= 5 || maxColumn <= 17) { // Leave room for 3 empty + 2 data columns
      const rateColumn = needsRateColumn ? maxColumn + 1 : -1
      return {
        type: 'at_end',
        startColumn: maxColumn + 4, // Skip 3 empty columns
        needsInsertion: false,
        availableSpace: spacesAtEnd,
        emptyColumnsGap: 3,
        needsRateColumn,
        rateColumnPosition: rateColumn
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
   * Copy rows with COMPLETE format preservation including all styles, colors, formulas
   */
  copyRowsWithCompleteFormatPreservation(originalWorksheet, newWorksheet, matchLookup, analysis, insertionStrategy) {
    const { rateColumnIndex, headerRowNum } = analysis
    
    // Handle insertion above data if needed
    let rowOffset = 0
    if (insertionStrategy.type === 'insert_above') {
      rowOffset = insertionStrategy.insertRowsCount
      this.insertHeadersAboveData(newWorksheet, insertionStrategy, analysis, matchLookup)
    }
    
    // Add rate column header if needed
    if (insertionStrategy.needsRateColumn && insertionStrategy.rateColumnPosition > 0) {
      this.addRateColumnHeader(newWorksheet, insertionStrategy.rateColumnPosition, headerRowNum)
    }
    
    // Copy all rows
    originalWorksheet.eachRow({ includeEmpty: true }, (originalRow, rowNumber) => {
      const targetRowNumber = rowNumber + rowOffset
      const newRow = newWorksheet.getRow(targetRowNumber)
      
      // Try both direct row number and adjusted row number to match Excel parsing
      let match = matchLookup.get(rowNumber)
      if (!match && rowNumber > 1) {
        // Sometimes there's an offset issue, try the row number without header offset
        match = matchLookup.get(rowNumber - 1)
      }
      if (!match && rowNumber > 1) {
        // Also try with the actual data row calculation
        match = matchLookup.get(rowNumber + 1)
      }
      
      // Copy each cell with COMPLETE format preservation
      originalRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const newCell = newRow.getCell(colNumber)
        
        // Enhanced rate cell population - ONLY ONE cell at quantity level
        if (match && rateColumnIndex > 0 && colNumber === rateColumnIndex && rowNumber !== headerRowNum) {
          // Check if this rate has already been populated for this match
          if (!match._ratePopulated) {
            // Ensure we're on the correct data row that matches the quantity
            const isCorrectDataRow = rowNumber >= analysis.dataStartRow && 
                                   (match.row_number === rowNumber || 
                                    match.row_number === rowNumber - 1 || 
                                    match.row_number === rowNumber + 1)
            
            if (isCorrectDataRow) {
              // Populate the existing rate cell with matched rate (ONLY ONCE)
              newCell.value = match.matched_rate !== undefined && match.matched_rate !== null ? match.matched_rate : 0
              match._ratePopulated = true // Mark as populated to prevent duplicates
              
              console.log(`   💰 Populating rate cell ONCE (row ${rowNumber}, col ${colNumber}): ${match.matched_rate}`)
              console.log(`   📍 Match details - Sheet row: ${match.row_number}, Excel row: ${rowNumber}, Target row: ${targetRowNumber}`)
              console.log(`   📊 Data starts at row: ${analysis.dataStartRow}, Header at row: ${analysis.headerRowNum}`)
            
              // COMPLETE style preservation with enhancement
              this.copyCompleteStyle(cell, newCell)
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
              // Copy original with COMPLETE preservation
              this.copyCompleteCell(cell, newCell)
            }
          } else {
            // Copy original with COMPLETE preservation
            this.copyCompleteCell(cell, newCell)
          }
        } else if (match && analysis.unitColumnIndex > 0 && colNumber === analysis.unitColumnIndex && rowNumber !== headerRowNum) {
          // Populate unit cell with matched unit - only once and on correct row
          if (!match._unitPopulated) {
            // Ensure we're on the correct data row that matches the quantity
            const isCorrectDataRow = rowNumber >= analysis.dataStartRow && 
                                   (match.row_number === rowNumber || 
                                    match.row_number === rowNumber - 1 || 
                                    match.row_number === rowNumber + 1)
            
            if (isCorrectDataRow) {
              newCell.value = match.unit || match.matched_unit || cell.value || ''
              match._unitPopulated = true // Mark as populated
              
              console.log(`   📏 Populating unit cell ONCE (row ${rowNumber}, col ${colNumber}): ${match.unit || match.matched_unit}`)
              
              // COMPLETE style preservation with enhancement
              this.copyCompleteStyle(cell, newCell)
              // Add subtle highlighting for unit updates
              newCell.style = {
                ...newCell.style,
                fill: {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: 'FFF3E0' } // Light orange background
                }
              }
            } else {
              // Copy original with COMPLETE preservation
              this.copyCompleteCell(cell, newCell)
            }
          } else {
            // Copy original with COMPLETE preservation
            this.copyCompleteCell(cell, newCell)
          }
        } else {
          // Copy EVERYTHING with complete preservation
          this.copyCompleteCell(cell, newCell)
        }
      })
      
      // Add new rate column data if needed
      if (insertionStrategy.needsRateColumn && insertionStrategy.rateColumnPosition > 0 && match && rowNumber !== headerRowNum) {
        this.addRateColumnData(newRow, match, insertionStrategy.rateColumnPosition)
      }
      
      // Copy ALL row properties for complete preservation
      newRow.height = originalRow.height
      newRow.hidden = originalRow.hidden
      newRow.outlineLevel = originalRow.outlineLevel
      if (originalRow.style) {
        newRow.style = JSON.parse(JSON.stringify(originalRow.style))
      }
      if (originalRow.font) {
        newRow.font = JSON.parse(JSON.stringify(originalRow.font))
      }
      if (originalRow.alignment) {
        newRow.alignment = JSON.parse(JSON.stringify(originalRow.alignment))
      }
      if (originalRow.fill) {
        newRow.fill = JSON.parse(JSON.stringify(originalRow.fill))
      }
      if (originalRow.border) {
        newRow.border = JSON.parse(JSON.stringify(originalRow.border))
      }
      
      // Add new columns for match data (only if not inserting above)
      if (insertionStrategy.type !== 'insert_above' && match) {
        this.addMatchDataColumns(newRow, match, insertionStrategy, rowNumber === headerRowNum)
      } else if (insertionStrategy.type === 'insert_above' && match) {
        // Add match data to the rows above
        this.addMatchDataAbove(newWorksheet, match, rowNumber - analysis.dataStartRow + 1)
      }
    })
  }

  /**
   * Insert match data above existing data when no space is available
   */
  insertHeadersAboveData(newWorksheet, insertionStrategy, analysis, matchLookup) {
    // Create header rows for match data
    const matchDescRow = newWorksheet.getRow(1)
    const rateRow = newWorksheet.getRow(2)
    const unitRow = newWorksheet.getRow(3)
    
    // Set up match data in columns corresponding to each data item
    let dataColumnIndex = 1
    
    matchLookup.forEach((match, originalRowNumber) => {
      // Add match description
      const matchDescCell = matchDescRow.getCell(dataColumnIndex)
      matchDescCell.value = match.matched_description || ''
      matchDescCell.style = {
        font: { bold: true, size: 10 },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E3F2FD' } },
        border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } },
        alignment: { wrapText: true, horizontal: 'center' }
      }
      
      // Add rate
      const rateCell = rateRow.getCell(dataColumnIndex)
      rateCell.value = match.matched_rate || 0
      rateCell.numFmt = '#,##0.00'
      rateCell.style = {
        font: { bold: true, size: 10 },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E8F5E9' } },
        border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } },
        alignment: { horizontal: 'center' }
      }
      
      // Add unit
      const unitCell = unitRow.getCell(dataColumnIndex)
      unitCell.value = match.unit || match.matched_unit || ''
      unitCell.style = {
        font: { bold: true, size: 10 },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3E0' } },
        border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } },
        alignment: { horizontal: 'center' }
      }
      
      dataColumnIndex++
    })
    
    // Add headers
    const matchDescHeader = matchDescRow.getCell(dataColumnIndex + 1)
    matchDescHeader.value = 'MATCHED ITEMS'
    matchDescHeader.style = {
      font: { bold: true, size: 12, color: { argb: 'FFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '1565C0' } },
      alignment: { horizontal: 'center', vertical: 'middle' }
    }
    
    const rateHeader = rateRow.getCell(dataColumnIndex + 1)
    rateHeader.value = 'MATCHED RATES'
    rateHeader.style = {
      font: { bold: true, size: 12, color: { argb: 'FFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '2E7D32' } },
      alignment: { horizontal: 'center', vertical: 'middle' }
    }
    
    const unitHeader = unitRow.getCell(dataColumnIndex + 1)
    unitHeader.value = 'MATCHED UNITS'
    unitHeader.style = {
      font: { bold: true, size: 12, color: { argb: 'FFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E65100' } },
      alignment: { horizontal: 'center', vertical: 'middle' }
    }
  }

  /**
   * Add column headers for new columns
   */
  addColumnHeaders(newWorksheet, insertionStrategy, analysis) {
    if (insertionStrategy.type === 'insert_above') return
    
    const headerRow = newWorksheet.getRow(analysis.headerRowNum)
    const startCol = insertionStrategy.startColumn
    
    // Add headers for new columns
    const matchedNameHeader = headerRow.getCell(startCol)
    matchedNameHeader.value = 'Matched Item'
    matchedNameHeader.style = {
      font: { bold: true, color: { argb: 'FFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '1565C0' } },
      alignment: { horizontal: 'center', vertical: 'middle' },
      border: { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } }
    }
    
    const unitHeader = headerRow.getCell(startCol + 1)
    unitHeader.value = 'Unit'
    unitHeader.style = {
      font: { bold: true, color: { argb: 'FFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E65100' } },
      alignment: { horizontal: 'center', vertical: 'middle' },
      border: { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } }
    }
  }

  /**
   * Add rate column header when creating new rate column
   */
  addRateColumnHeader(newWorksheet, rateColumnPosition, headerRowNum) {
    const headerRow = newWorksheet.getRow(headerRowNum)
    const rateHeader = headerRow.getCell(rateColumnPosition)
    
    rateHeader.value = 'Rate'
    rateHeader.style = {
      font: { bold: true, color: { argb: 'FFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '2E7D32' } },
      alignment: { horizontal: 'center', vertical: 'middle' },
      border: { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } }
    }
    
    console.log(`   📊 Added Rate column header at position ${rateColumnPosition}`)
  }

  /**
   * Add rate data to new rate column
   */
  addRateColumnData(newRow, match, rateColumnPosition) {
    const rateCell = newRow.getCell(rateColumnPosition)
    
    if (!match._newRatePopulated) {
      rateCell.value = match.matched_rate !== undefined && match.matched_rate !== null ? match.matched_rate : 0
      rateCell.numFmt = '#,##0.00'
      rateCell.style = {
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E8F5E9' } },
        border: {
          top: { style: 'thin', color: { argb: '4CAF50' } },
          left: { style: 'thin', color: { argb: '4CAF50' } },
          bottom: { style: 'thin', color: { argb: '4CAF50' } },
          right: { style: 'thin', color: { argb: '4CAF50' } }
        },
        alignment: { horizontal: 'center' }
      }
      
      match._newRatePopulated = true
      console.log(`   💰 Added rate ${match.matched_rate} to new rate column at position ${rateColumnPosition}`)
    }
  }

  /**
   * Add match data columns when space is available
   */
  addMatchDataColumns(newRow, match, insertionStrategy, isHeader) {
    if (insertionStrategy.type === 'insert_above') return
    
    const startCol = insertionStrategy.startColumn
    
    if (!isHeader) {
      // Add match data
      const matchedNameCell = newRow.getCell(startCol)
      matchedNameCell.value = match.matched_description || ''
      matchedNameCell.style = {
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E3F2FD' } },
        border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } },
        alignment: { wrapText: true }
      }
      
      // Only add unit cell if there's no existing unit column being populated
      if (!analysis.unitColumnIndex || analysis.unitColumnIndex <= 0) {
        const unitCell = newRow.getCell(startCol + 1)
        unitCell.value = match.unit || match.matched_unit || ''
        unitCell.style = {
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3E0' } },
          border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } },
          alignment: { horizontal: 'center' }
        }
      }
    }
  }

  /**
   * Copy COMPLETE column properties including widths, styles, groups
   */
  copyCompleteColumnProperties(originalWorksheet, newWorksheet) {
    try {
      // Copy all column properties
      if (originalWorksheet.columns) {
        originalWorksheet.columns.forEach((column, index) => {
          const newColumn = newWorksheet.getColumn(index + 1)
          
          // Copy all column properties
          if (column.width !== undefined) newColumn.width = column.width
          if (column.hidden !== undefined) newColumn.hidden = column.hidden
          if (column.outlineLevel !== undefined) newColumn.outlineLevel = column.outlineLevel
          if (column.style) newColumn.style = JSON.parse(JSON.stringify(column.style))
          if (column.font) newColumn.font = JSON.parse(JSON.stringify(column.font))
          if (column.alignment) newColumn.alignment = JSON.parse(JSON.stringify(column.alignment))
          if (column.border) newColumn.border = JSON.parse(JSON.stringify(column.border))
          if (column.fill) newColumn.fill = JSON.parse(JSON.stringify(column.fill))
          if (column.numFmt) newColumn.numFmt = column.numFmt
        })
      }
    } catch (err) {
      console.warn(`⚠️ Could not copy column properties: ${err.message}`)
    }
  }

  /**
   * Copy conditional formatting rules
   */
  copyConditionalFormatting(originalWorksheet, newWorksheet) {
    try {
      if (originalWorksheet.conditionalFormattings) {
        originalWorksheet.conditionalFormattings.forEach(cf => {
          newWorksheet.addConditionalFormatting(JSON.parse(JSON.stringify(cf)))
        })
      }
    } catch (err) {
      console.warn(`⚠️ Could not copy conditional formatting: ${err.message}`)
    }
  }

  /**
   * Copy merged cells with exact positioning
   */
  copyMergedCellsExact(originalWorksheet, newWorksheet, insertionStrategy) {
    try {
      if (originalWorksheet.model && originalWorksheet.model.merges) {
        const rowOffset = insertionStrategy.type === 'insert_above' ? insertionStrategy.insertRowsCount : 0
        
        for (const mergeRange of originalWorksheet.model.merges) {
          try {
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
          } catch (mergeError) {
            console.warn(`⚠️ Could not merge cells ${JSON.stringify(mergeRange)}: ${mergeError.message}`)
          }
        }
      }
    } catch (err) {
      console.warn(`⚠️ Could not copy merged cells: ${err.message}`)
    }
  }

  /**
   * Copy images and charts (basic support)
   */
  async copyImagesAndCharts(originalWorksheet, newWorksheet) {
    try {
      // Copy images if present
      if (originalWorksheet.model && originalWorksheet.model.media) {
        for (const media of originalWorksheet.model.media) {
          try {
            // This is a basic implementation - full image copying would need more work
            console.log(`🇫️ Found image/media in worksheet: ${media.name || 'unnamed'}`)
          } catch (mediaError) {
            console.warn(`⚠️ Could not copy media: ${mediaError.message}`)
          }
        }
      }
      
      // Note: Chart copying would require special ExcelJS chart support
      if (originalWorksheet.charts && originalWorksheet.charts.length > 0) {
        console.log(`📈 Found ${originalWorksheet.charts.length} charts in worksheet (basic preservation only)`)
      }
      
    } catch (err) {
      console.warn(`⚠️ Could not copy images/charts: ${err.message}`)
    }
  }

  /**
   * Copy row groups and outline levels
   */
  copyRowGroupsAndOutlines(originalWorksheet, newWorksheet) {
    try {
      // Row outlines are typically handled through individual row.outlineLevel
      // but we can also copy worksheet-level outline settings
      if (originalWorksheet.properties && originalWorksheet.properties.outlineProperties) {
        newWorksheet.properties.outlineProperties = JSON.parse(JSON.stringify(originalWorksheet.properties.outlineProperties))
      }
    } catch (err) {
      console.warn(`⚠️ Could not copy row groups: ${err.message}`)
    }
  }

  /**
   * Copy column groups and outline levels
   */
  copyColumnGroupsAndOutlines(originalWorksheet, newWorksheet) {
    try {
      // Column outlines are typically handled through individual column.outlineLevel
      // Additional column grouping logic would go here if needed
      console.log(`📊 Copied column outline levels via individual column properties`)
    } catch (err) {
      console.warn(`⚠️ Could not copy column groups: ${err.message}`)
    }
  }

  /**
   * Copy ALL additional worksheet properties for complete preservation
   */
  copyAllWorksheetProperties(originalWorksheet, newWorksheet, insertionStrategy) {
    // Column properties are now handled by copyCompleteColumnProperties
    // This method now focuses on other worksheet-level properties
    
    // Set width for new columns if they exist
    if (insertionStrategy.type !== 'insert_above') {
      const startCol = insertionStrategy.startColumn
      newWorksheet.getColumn(startCol).width = 40 // Matched Item
      newWorksheet.getColumn(startCol + 1).width = 10 // Unit
      
      // Set width for new rate column if created
      if (insertionStrategy.needsRateColumn && insertionStrategy.rateColumnPosition > 0) {
        newWorksheet.getColumn(insertionStrategy.rateColumnPosition).width = 12 // Rate
      }
    }
    
    // Merged cells are now handled by copyMergedCellsExact
    // Additional worksheet-level property copying
    try {
      // Copy worksheet background
      if (originalWorksheet.background) {
        newWorksheet.background = JSON.parse(JSON.stringify(originalWorksheet.background))
      }
      
      // Copy print areas
      if (originalWorksheet.pageSetup && originalWorksheet.pageSetup.printArea) {
        newWorksheet.pageSetup.printArea = originalWorksheet.pageSetup.printArea
      }
      
      // Copy freeze panes
      if (originalWorksheet.views && originalWorksheet.views[0] && originalWorksheet.views[0].state === 'frozen') {
        newWorksheet.views[0] = JSON.parse(JSON.stringify(originalWorksheet.views[0]))
      }
      
      // Copy tab color
      if (originalWorksheet.properties && originalWorksheet.properties.tabColor) {
        newWorksheet.properties.tabColor = originalWorksheet.properties.tabColor
      }
      
    } catch (propertyError) {
      console.warn(`⚠️ Could not copy some worksheet properties: ${propertyError.message}`)
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
   * Copy COMPLETE cell with all properties, styles, formulas
   */
  copyCompleteCell(sourceCell, targetCell) {
    try {
      // Copy value
      targetCell.value = sourceCell.value
      
      // Copy COMPLETE style
      this.copyCompleteStyle(sourceCell, targetCell)
      
      // Copy all other properties
      this.copyCellProperties(sourceCell, targetCell)
      
    } catch (err) {
      console.warn(`⚠️ Could not copy complete cell: ${err.message}`)
    }
  }

  /**
   * Copy COMPLETE style including all formatting
   */
  copyCompleteStyle(sourceCell, targetCell) {
    try {
      if (sourceCell.style) {
        targetCell.style = JSON.parse(JSON.stringify(sourceCell.style))
      }
      
      // Explicitly copy each style component
      if (sourceCell.font) {
        targetCell.font = JSON.parse(JSON.stringify(sourceCell.font))
      }
      if (sourceCell.alignment) {
        targetCell.alignment = JSON.parse(JSON.stringify(sourceCell.alignment))
      }
      if (sourceCell.border) {
        targetCell.border = JSON.parse(JSON.stringify(sourceCell.border))
      }
      if (sourceCell.fill) {
        targetCell.fill = JSON.parse(JSON.stringify(sourceCell.fill))
      }
      if (sourceCell.numFmt) {
        targetCell.numFmt = sourceCell.numFmt
      }
      if (sourceCell.protection) {
        targetCell.protection = JSON.parse(JSON.stringify(sourceCell.protection))
      }
      
    } catch (err) {
      console.warn(`⚠️ Could not copy complete style: ${err.message}`)
    }
  }

  /**
   * Copy cell properties safely with enhanced preservation
   */
  copyCellProperties(sourceCell, targetCell) {
    try {
      // Copy formulas with proper handling
      if (sourceCell.formula && !sourceCell.sharedFormula) {
        targetCell.formula = sourceCell.formula
      } else if (sourceCell.sharedFormula) {
        targetCell.value = sourceCell.value
      } else if (sourceCell.formulaType === 'array') {
        targetCell.value = sourceCell.value // Array formulas need special handling
      }
      
      // Copy all other properties
      if (sourceCell.hyperlink) {
        targetCell.hyperlink = JSON.parse(JSON.stringify(sourceCell.hyperlink))
      }
      if (sourceCell.dataValidation) {
        targetCell.dataValidation = JSON.parse(JSON.stringify(sourceCell.dataValidation))
      }
      if (sourceCell.comment) {
        targetCell.comment = JSON.parse(JSON.stringify(sourceCell.comment))
      }
      if (sourceCell.name) {
        targetCell.name = sourceCell.name
      }
      if (sourceCell.master) {
        targetCell.master = sourceCell.master
      }
      if (sourceCell.type) {
        targetCell.type = sourceCell.type
      }
      
    } catch (err) {
      console.warn(`⚠️ Could not copy cell property: ${err.message}`)
    }
  }

  /**
   * Remove the old headers that are no longer needed
   */
  cleanupOldHeaders(newWorksheet, insertionStrategy, analysis) {
    // Remove the old header creation code since we're using enhanced logic
    // This is handled in addColumnHeaders() method
  }

  /**
   * Export filtered results from the UI
   */
  async exportFilteredResults(jobId, matchResults, originalFileName = 'filtered_results.xlsx') {
    try {
      console.log(`📤 Exporting ${matchResults?.length || 0} filtered results`)
      
      // Validate matchResults
      if (!matchResults || !Array.isArray(matchResults)) {
        console.error('❌ Invalid matchResults provided to exportFilteredResults')
        throw new Error('Match results must be a valid array')
      }
      
      const outputPath = path.join(this.outputDir, `filtered-${jobId}-${originalFileName}`)
      
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Filtered Results')
      
      // Define headers
      const headers = [
        'Sheet Name',
        'Row Number',
        'Original Description',
        'Matched Description', 
        'Quantity',
        'Matched Rate',
        'Unit',
        'Total Amount',
        'Confidence %',
        'Match Method'
      ]
      
      // Add headers with formatting
      const headerRow = worksheet.addRow(headers)
      headerRow.eachCell((cell, colNumber) => {
        cell.font = { bold: true, color: { argb: 'FFFFFF' } }
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '4472C4' }
        }
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
      })
      
      // Add data rows
      if (matchResults && matchResults.length > 0) {
        matchResults.forEach(match => {
          const row = worksheet.addRow([
            match.sheet_name || '',
            match.row_number || '',
            match.original_description || '',
            match.matched_description || '',
            match.quantity || '',
            match.matched_rate || '',
            match.unit || '',
            match.total_amount || '',
            Math.round((match.similarity_score || 0) * 100) + '%',
            match.match_method || ''
          ])
          
          // Add borders to data rows
          row.eachCell((cell) => {
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            }
          })
        })
      }
      
      // Auto-fit columns
      worksheet.columns.forEach(column => {
        let maxLength = 0
        column.eachCell({ includeEmpty: false }, (cell) => {
          const columnLength = cell.value ? cell.value.toString().length : 10
          if (columnLength > maxLength) {
            maxLength = columnLength
          }
        })
        column.width = Math.min(maxLength + 2, 50)
      })
      
      // Add summary at the bottom
      const summaryRowIndex = matchResults.length + 3
      worksheet.getCell(`A${summaryRowIndex}`).value = 'SUMMARY'
      worksheet.getCell(`A${summaryRowIndex}`).font = { bold: true }
      
      worksheet.getCell(`A${summaryRowIndex + 1}`).value = `Total Items: ${matchResults.length}`
      worksheet.getCell(`A${summaryRowIndex + 2}`).value = `Total Amount: ${matchResults.reduce((sum, match) => sum + (match.total_amount || 0), 0).toLocaleString()}`
      
      // Calculate average confidence safely
      const avgConfidence = matchResults.length > 0 
        ? Math.round(matchResults.reduce((sum, match) => sum + (match.similarity_score || 0), 0) / matchResults.length * 100)
        : 0
      worksheet.getCell(`A${summaryRowIndex + 3}`).value = `Average Confidence: ${avgConfidence}%`
      
      // Save workbook
      await workbook.xlsx.writeFile(outputPath)
      
      console.log(`✅ Filtered export completed: ${outputPath}`)
      return outputPath
      
    } catch (error) {
      console.error(`❌ Error in exportFilteredResults:`, error)
      throw error
    }
  }

  /**
   * Basic export to Excel (fallback method)
   */
  async exportToExcel(matchResults, jobId, originalFileName = 'export.xlsx') {
    try {
      console.log(`📤 Basic Excel export for ${matchResults?.length || 0} results`)
      
      // Validate matchResults
      if (!matchResults || !Array.isArray(matchResults)) {
        console.error('❌ Invalid matchResults provided to exportToExcel')
        throw new Error('Match results must be a valid array')
      }
      
      const outputPath = path.join(this.outputDir, `basic-export-${jobId}-${originalFileName}`)
      
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Match Results')
      
      // Define headers
      const headers = [
        'Sheet Name',
        'Row Number',
        'Original Description',
        'Matched Description', 
        'Quantity',
        'Matched Rate',
        'Unit',
        'Total Amount',
        'Confidence %',
        'Match Method'
      ]
      
      // Add headers with formatting
      const headerRow = worksheet.addRow(headers)
      headerRow.eachCell((cell, colNumber) => {
        cell.font = { bold: true, color: { argb: 'FFFFFF' } }
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '2E7D32' }
        }
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
        cell.alignment = { horizontal: 'center', vertical: 'middle' }
      })
      
      // Add data rows
      if (matchResults && matchResults.length > 0) {
        matchResults.forEach(match => {
          const row = worksheet.addRow([
            match.sheet_name || '',
            match.row_number || '',
            match.original_description || '',
            match.matched_description || '',
            match.quantity || '',
            match.matched_rate || '',
            match.unit || '',
            match.total_amount || '',
            Math.round((match.similarity_score || 0) * 100) + '%',
            match.match_method || ''
          ])
          
          // Add borders to data rows
          row.eachCell((cell) => {
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            }
          })
        })
      }
      
      // Auto-fit columns
      worksheet.columns.forEach(column => {
        let maxLength = 0
        column.eachCell({ includeEmpty: false }, (cell) => {
          const columnLength = cell.value ? cell.value.toString().length : 10
          if (columnLength > maxLength) {
            maxLength = columnLength
          }
        })
        column.width = Math.min(maxLength + 2, 50)
      })
      
      // Add summary at the bottom
      const summaryRowIndex = matchResults.length + 3
      worksheet.getCell(`A${summaryRowIndex}`).value = 'SUMMARY'
      worksheet.getCell(`A${summaryRowIndex}`).font = { bold: true, size: 14 }
      
      worksheet.getCell(`A${summaryRowIndex + 1}`).value = `Total Items: ${matchResults.length}`
      worksheet.getCell(`A${summaryRowIndex + 2}`).value = `Total Amount: ${matchResults.reduce((sum, match) => sum + (match.total_amount || 0), 0).toLocaleString()}`
      
      // Calculate average confidence safely
      const avgConfidence = matchResults.length > 0 
        ? Math.round(matchResults.reduce((sum, match) => sum + (match.similarity_score || 0), 0) / matchResults.length * 100)
        : 0
      worksheet.getCell(`A${summaryRowIndex + 3}`).value = `Average Confidence: ${avgConfidence}%`
      
      // Save workbook
      await workbook.xlsx.writeFile(outputPath)
      
      console.log(`✅ Basic export completed: ${outputPath}`)
      return outputPath
      
    } catch (error) {
      console.error(`❌ Error in exportToExcel:`, error)
      throw error
    }
  }
}
