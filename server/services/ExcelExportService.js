import XLSX from 'xlsx'
import ExcelJS from 'exceljs'
import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export class ExcelExportService {
  constructor() {
    this.outputDir = path.join(__dirname, '..', 'output')
    this.tempDir = path.join(__dirname, '..', 'temp')
    
    // Ensure directories exist
    fs.ensureDirSync(this.outputDir)
    fs.ensureDirSync(this.tempDir)
  }

  /**
   * Export results while preserving original Excel structure
   */
  async exportWithOriginalFormat(originalFilePath, matchResults, jobId, originalFileName) {
    try {
      console.log(`📄 Creating export with original format for: ${originalFileName}`)
      
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
        sheetMatches.forEach(match => {
          matchLookup.set(match.row_number, match)
        })
        
        // Find where to add new columns (after last used column)
        let maxColumn = 1
        originalWorksheet.eachRow((row, rowNumber) => {
          const lastCell = row.actualCellCount
          if (lastCell > maxColumn) maxColumn = lastCell
        })
        
        console.log(`   📍 Adding match columns starting at column ${maxColumn + 2}`)
        
        // Copy all rows with original formatting
        originalWorksheet.eachRow({ includeEmpty: true }, (originalRow, rowNumber) => {
          const newRow = newWorksheet.getRow(rowNumber)
          
          // Copy each cell with its value and style
          originalRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            const newCell = newRow.getCell(colNumber)
            
            // Copy value
            newCell.value = cell.value
            
            // Deep copy all cell properties for perfect format preservation
            if (cell.style) {
              newCell.style = JSON.parse(JSON.stringify(cell.style))
            }
            
            // Copy all possible cell properties
            if (cell.formula) newCell.formula = cell.formula
            if (cell.sharedFormula) newCell.sharedFormula = cell.sharedFormula
            if (cell.hyperlink) newCell.hyperlink = cell.hyperlink
            if (cell.dataValidation) newCell.dataValidation = JSON.parse(JSON.stringify(cell.dataValidation))
            if (cell.comment) newCell.comment = cell.comment
            if (cell.name) newCell.name = cell.name
          })
          
          // Copy row properties
          newRow.height = originalRow.height
          newRow.hidden = originalRow.hidden
          newRow.outlineLevel = originalRow.outlineLevel
          
          // Add match data if this row has a match
          const match = matchLookup.get(rowNumber)
          if (match) {
            // Leave a gap column
            const gapCol = maxColumn + 1
            
            // Add matched data
            const matchedDescCell = newRow.getCell(maxColumn + 2)
            matchedDescCell.value = match.matched_description || ''
            matchedDescCell.style = {
              fill: {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'E8F4FD' }
              },
              border: {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
              }
            }
            
            const matchedRateCell = newRow.getCell(maxColumn + 3)
            matchedRateCell.value = match.matched_rate || 0
            matchedRateCell.numFmt = '#,##0.00'
            matchedRateCell.style = {
              fill: {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'E8F4FD' }
              },
              border: {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
              }
            }
            
            const unitCell = newRow.getCell(maxColumn + 4)
            unitCell.value = match.unit || ''
            unitCell.style = {
              fill: {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'E8F4FD' }
              },
              border: {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
              }
            }
            
            const totalCell = newRow.getCell(maxColumn + 5)
            totalCell.value = match.total_amount || 0
            totalCell.numFmt = '#,##0.00'
            totalCell.style = {
              fill: {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'E8F4FD' }
              },
              border: {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
              },
              font: { bold: true }
            }
            
            const confidenceCell = newRow.getCell(maxColumn + 6)
            confidenceCell.value = Math.round(match.similarity_score || 0) // Already a percentage
            confidenceCell.numFmt = '0"%"'
            confidenceCell.style = {
              fill: {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: match.similarity_score >= 70 ? 'C8E6C9' : 'FFE0B2' }
              },
              border: {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
              }
            }
            
            const methodCell = newRow.getCell(maxColumn + 7)
            methodCell.value = match.match_method || 'AI'
            methodCell.style = {
              fill: {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'F3E5F5' }
              },
              border: {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
              }
            }
            
            totalItemsProcessed++
          }
        })
        
        // Add headers for new columns if sheet has data
        if (originalWorksheet.rowCount > 0) {
          // Find header row (usually row with most filled cells in first 10 rows)
          let headerRowNum = 1
          let maxCells = 0
          for (let i = 1; i <= Math.min(10, originalWorksheet.rowCount); i++) {
            const row = originalWorksheet.getRow(i)
            const cellCount = row.actualCellCount
            if (cellCount > maxCells) {
              maxCells = cellCount
              headerRowNum = i
            }
          }
          
          const headerRow = newWorksheet.getRow(headerRowNum)
          
          // Add header cells with styling
          const headers = [
            { col: maxColumn + 2, text: 'Matched Item', color: '1976D2' },
            { col: maxColumn + 3, text: 'Matched Rate', color: '1976D2' },
            { col: maxColumn + 4, text: 'Unit', color: '1976D2' },
            { col: maxColumn + 5, text: 'Total Amount', color: '1976D2' },
            { col: maxColumn + 6, text: 'Confidence', color: '388E3C' },
            { col: maxColumn + 7, text: 'Match Method', color: '7B1FA2' }
          ]
          
          headers.forEach(({ col, text, color }) => {
            const cell = headerRow.getCell(col)
            cell.value = text
            cell.style = {
              font: { bold: true, color: { argb: 'FFFFFF' } },
              fill: {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: color }
              },
              alignment: { horizontal: 'center', vertical: 'middle' },
              border: {
                top: { style: 'medium' },
                left: { style: 'medium' },
                bottom: { style: 'medium' },
                right: { style: 'medium' }
              }
            }
          })
        }
        
        // Copy column properties
        originalWorksheet.columns.forEach((column, index) => {
          if (column.width) {
            newWorksheet.getColumn(index + 1).width = column.width
          }
          if (column.hidden) {
            newWorksheet.getColumn(index + 1).hidden = column.hidden
          }
        })
        
        // Set width for new columns
        newWorksheet.getColumn(maxColumn + 2).width = 40 // Matched Item
        newWorksheet.getColumn(maxColumn + 3).width = 12 // Rate
        newWorksheet.getColumn(maxColumn + 4).width = 10 // Unit
        newWorksheet.getColumn(maxColumn + 5).width = 15 // Total
        newWorksheet.getColumn(maxColumn + 6).width = 12 // Confidence
        newWorksheet.getColumn(maxColumn + 7).width = 15 // Method
        
        // Copy merged cells
        for (const mergeRange of originalWorksheet.model.merges) {
          newWorksheet.mergeCells(mergeRange)
        }
        
        // Copy images if any
        if (originalWorksheet.getImages) {
          const images = originalWorksheet.getImages()
          for (const image of images) {
            const imageId = newWorkbook.addImage({
              buffer: image.buffer,
              extension: image.extension
            })
            newWorksheet.addImage(imageId, image.range)
          }
        }
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
   * Export filtered results from the UI
   */
  async exportFilteredResults(jobId, matchResults, originalFileName = 'filtered_results.xlsx') {
    try {
      console.log(`📤 Exporting ${matchResults.length} filtered results`)
      
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
      worksheet.getCell(`A${summaryRowIndex + 3}`).value = `Average Confidence: ${Math.round(matchResults.reduce((sum, match) => sum + (match.similarity_score || 0), 0) / matchResults.length * 100)}%`
      
      // Save workbook
      await workbook.xlsx.writeFile(outputPath)
      
      console.log(`✅ Filtered export completed: ${outputPath}`)
      return outputPath
      
    } catch (error) {
      console.error(`❌ Error in exportFilteredResults:`, error)
      throw error
    }
  }
} 