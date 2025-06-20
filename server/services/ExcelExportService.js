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
   */
  async exportWithOriginalFormat(originalFilePath, matchResults, jobId, originalFileName) {
    try {
      console.log(`📄 Creating export with original format for: ${originalFileName}`)
      
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
            matchLookup.set(match.row_number, match)
          })
        }
        
        // Find rate column index and last used column
        let rateColumnIndex = -1
        let maxColumn = 1
        let headerRowNum = 1
        
        // First, find the header row and locate rate column
        for (let rowNum = 1; rowNum <= Math.min(10, originalWorksheet.rowCount); rowNum++) {
          const row = originalWorksheet.getRow(rowNum)
          let maxCellsInRow = 0
          
          row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
            maxCellsInRow++
            const cellValue = String(cell.value || '').toLowerCase().trim()
            
            // Look for rate-related headers
            if (cellValue === 'rate' || cellValue === 'price' || cellValue === 'unit rate' || 
                cellValue === 'unit price' || cellValue.includes('rate') || cellValue.includes('price')) {
              rateColumnIndex = colNumber
              headerRowNum = rowNum
              console.log(`   📍 Found rate column at index ${colNumber} in row ${rowNum}`)
            }
            
            if (colNumber > maxColumn) maxColumn = colNumber
          })
          
          // If we found the rate column, stop looking
          if (rateColumnIndex > 0) break
        }
        
        console.log(`   📍 Rate column: ${rateColumnIndex > 0 ? rateColumnIndex : 'not found'}, Max column: ${maxColumn}`)
        console.log(`   📍 Adding matched description at column ${maxColumn + 2}`)
        
        // Copy all rows with original formatting
        originalWorksheet.eachRow({ includeEmpty: true }, (originalRow, rowNumber) => {
          const newRow = newWorksheet.getRow(rowNumber)
          
          // Get the match for this row if it exists
          const match = matchLookup.get(rowNumber)
          
          // Copy each cell with its value and style
          originalRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            const newCell = newRow.getCell(colNumber)
            
            // If this is the rate column and we have a match, use the matched rate
            if (match && rateColumnIndex > 0 && colNumber === rateColumnIndex && rowNumber !== headerRowNum) {
              newCell.value = match.matched_rate || 0
              // Preserve the original cell formatting but highlight it's been updated
              if (cell.style) {
                newCell.style = JSON.parse(JSON.stringify(cell.style))
              }
              // Add a light green background to indicate it's been updated
              newCell.style = {
                ...newCell.style,
                fill: {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: 'E8F5E9' }
                }
              }
              if (cell.numFmt || !newCell.numFmt) {
                newCell.numFmt = cell.numFmt || '#,##0.00'
              }
            } else {
              // Copy value as-is
            newCell.value = cell.value
            
            // Deep copy all cell properties for perfect format preservation
            if (cell.style) {
              newCell.style = JSON.parse(JSON.stringify(cell.style))
              }
            }
            
            // Copy all other cell properties safely
            try {
              if (cell.formula && !cell.sharedFormula) {
                newCell.formula = cell.formula
              } else if (cell.sharedFormula) {
                // Skip shared formulas as they need special handling
                newCell.value = cell.value
              }
              if (cell.hyperlink) newCell.hyperlink = cell.hyperlink
              if (cell.dataValidation) newCell.dataValidation = JSON.parse(JSON.stringify(cell.dataValidation))
              if (cell.comment) newCell.comment = cell.comment
              if (cell.name) newCell.name = cell.name
            } catch (err) {
              // If setting any property fails, just keep the value
              console.warn(`⚠️ Could not copy cell property: ${err.message}`)
            }
          })
          
          // Copy row properties
          newRow.height = originalRow.height
          newRow.hidden = originalRow.hidden
          newRow.outlineLevel = originalRow.outlineLevel
          
          // Add matched description if this row has a match
          if (match) {
            // Leave a gap column
            const gapCol = maxColumn + 1
            
            // Add matched description
            const matchedDescCell = newRow.getCell(maxColumn + 2)
            matchedDescCell.value = match.matched_description || ''
            matchedDescCell.style = {
              fill: {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'E3F2FD' }
              },
              border: {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
              },
              alignment: { wrapText: true }
            }
            
            // Add confidence score
            const confidenceCell = newRow.getCell(maxColumn + 3)
            confidenceCell.value = Math.round(match.similarity_score || 0)
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
              },
              alignment: { horizontal: 'center' }
            }
            
            totalItemsProcessed++
          }
        })
        
        // Add headers for new columns at the header row
        if (originalWorksheet.rowCount > 0) {
          const headerRow = newWorksheet.getRow(headerRowNum)
          
          // Add header for matched description
          const matchedDescHeader = headerRow.getCell(maxColumn + 2)
          matchedDescHeader.value = 'Matched Description'
          matchedDescHeader.style = {
            font: { bold: true, color: { argb: 'FFFFFF' } },
            fill: {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: '1565C0' }
            },
            alignment: { horizontal: 'center', vertical: 'middle' },
            border: {
              top: { style: 'medium' },
              left: { style: 'medium' },
              bottom: { style: 'medium' },
              right: { style: 'medium' }
            }
          }
          
          // Add header for confidence
          const confidenceHeader = headerRow.getCell(maxColumn + 3)
          confidenceHeader.value = 'Confidence'
          confidenceHeader.style = {
            font: { bold: true, color: { argb: 'FFFFFF' } },
            fill: {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: '388E3C' }
            },
            alignment: { horizontal: 'center', vertical: 'middle' },
            border: {
              top: { style: 'medium' },
              left: { style: 'medium' },
              bottom: { style: 'medium' },
              right: { style: 'medium' }
            }
          }
          
          // If no rate column was found, add headers for rate info
          if (rateColumnIndex === -1) {
            const rateHeader = headerRow.getCell(maxColumn + 4)
            rateHeader.value = 'Matched Rate'
            rateHeader.style = {
              font: { bold: true, color: { argb: 'FFFFFF' } },
              fill: {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'D32F2F' }
              },
              alignment: { horizontal: 'center', vertical: 'middle' },
              border: {
                top: { style: 'medium' },
                left: { style: 'medium' },
                bottom: { style: 'medium' },
                right: { style: 'medium' }
              }
            }
            
            const unitHeader = headerRow.getCell(maxColumn + 5)
            unitHeader.value = 'Unit'
            unitHeader.style = {
              font: { bold: true, color: { argb: 'FFFFFF' } },
              fill: {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: '7B1FA2' }
              },
              alignment: { horizontal: 'center', vertical: 'middle' },
              border: {
                top: { style: 'medium' },
                left: { style: 'medium' },
                bottom: { style: 'medium' },
                right: { style: 'medium' }
              }
            }
          }
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
        newWorksheet.getColumn(maxColumn + 2).width = 45 // Matched Description
        newWorksheet.getColumn(maxColumn + 3).width = 12 // Confidence
        
        // If no rate column was found, add columns for rate info
        if (rateColumnIndex === -1) {
          newWorksheet.getColumn(maxColumn + 4).width = 12 // Rate
          newWorksheet.getColumn(maxColumn + 5).width = 10 // Unit
          
          // Add rate and unit data for matches
          originalWorksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            const match = matchLookup.get(rowNumber)
            if (match && rowNumber !== headerRowNum) {
              const newRow = newWorksheet.getRow(rowNumber)
              
              const rateCell = newRow.getCell(maxColumn + 4)
              rateCell.value = match.matched_rate || 0
              rateCell.numFmt = '#,##0.00'
              rateCell.style = {
                fill: {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: 'FFEBEE' }
                },
                border: {
                  top: { style: 'thin' },
                  left: { style: 'thin' },
                  bottom: { style: 'thin' },
                  right: { style: 'thin' }
                }
              }
              
              const unitCell = newRow.getCell(maxColumn + 5)
              unitCell.value = match.unit || ''
              unitCell.style = {
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
            }
          })
        }
        
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