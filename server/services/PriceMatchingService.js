import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs-extra'
import { fileURLToPath } from 'url'
import ExcelJS from 'exceljs'
import XLSX from 'xlsx'
import { createClient } from '@supabase/supabase-js'
import { ExcelParsingService } from './ExcelParsingService.js'
import { LocalPriceMatchingService } from './LocalPriceMatchingService.js'
import { CohereMatchingService } from './CohereMatchingService.js'
import { ExcelExportService } from './ExcelExportService.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export class PriceMatchingService {
  constructor() {
    // Use service role key for admin access (bypasses RLS)
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
    
    if (!supabaseKey) {
      throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY in environment')
    }
    
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      supabaseKey
    )
    this.tempDir = path.join(__dirname, '..', 'temp')
    this.outputDir = path.join(__dirname, '..', 'output')
    this.pythonScriptPath = path.join(__dirname, 'cohereexcelparsing.py')
    this.pricelistPath = path.join(__dirname, '..', 'temp', 'pricelist.xlsx')
    
    // Initialize new services
    this.excelParser = new ExcelParsingService()
    this.localMatcher = new LocalPriceMatchingService()
    this.cohereMatcher = new CohereMatchingService()
  }

  async processFile(jobId, inputFilePath, originalFileName, matchingMethod = 'cohere') {
    try {
      console.log(`🚀 STARTING PROCESSING: job ${jobId} with file: ${originalFileName}`)
      console.log(`📁 Input file path: ${inputFilePath}`)
      
      // Verify input file exists
      if (!await fs.pathExists(inputFilePath)) {
        throw new Error(`Input file does not exist: ${inputFilePath}`)
      }
      console.log(`✅ Input file verified: ${inputFilePath}`)
      
      // Update job status to processing
      console.log(`📊 Updating job status to processing...`)
      await this.updateJobStatus(jobId, 'processing', 10)
      console.log(`✅ Job status updated to processing`)

      // Step 1: Parse Excel file to extract items with quantities
      console.log(`📋 Parsing Excel file...`)
      const extractedItems = await this.excelParser.parseExcelFile(inputFilePath, jobId, originalFileName)
      console.log(`✅ Extracted ${extractedItems.length} items with quantities`)
      
      // Log first few items for debugging
      if (extractedItems.length > 0) {
        console.log(`📝 Sample items:`)
        extractedItems.slice(0, 3).forEach((item, idx) => {
          console.log(`   ${idx + 1}. "${item.description}" - Qty: ${item.quantity} - Row: ${item.row_number}`)
        })
      }
      
      await this.updateJobStatus(jobId, 'processing', 30, `Extracted ${extractedItems.length} items`, { total_items: extractedItems.length })

      if (extractedItems.length === 0) {
        // Try to understand why no items were found
        console.log(`⚠️ No items found! Checking file structure...`)
        const debugWorkbook = XLSX.readFile(inputFilePath)
        console.log(`   - Sheets found: ${debugWorkbook.SheetNames.join(', ')}`)
        for (const sheetName of debugWorkbook.SheetNames) {
          const sheet = debugWorkbook.Sheets[sheetName]
          const data = XLSX.utils.sheet_to_json(sheet, { header: 1 })
          console.log(`   - Sheet "${sheetName}" has ${data.length} rows`)
          if (data.length > 0) {
            console.log(`   - First row sample:`, data[0])
          }
        }
        throw new Error('No items with quantities found in the Excel file. Please check the file format.')
      }

      // Step 2: Load price list from database
      console.log(`💰 Loading price list from database...`)
      const priceList = await this.loadPriceList()
      console.log(`✅ Loaded ${priceList.length} price items`)
      await this.updateJobStatus(jobId, 'processing', 40, `Loaded ${priceList.length} price items`)

      if (priceList.length === 0) {
        throw new Error('No price items found in database')
      }

      // Step 3: Match items using selected matching method
      console.log(`🔍 Starting price matching using ${matchingMethod}...`)
      let matchingResult
      
      if (matchingMethod === 'cohere') {
        matchingResult = await this.cohereMatcher.matchItems(extractedItems, priceList, jobId, originalFileName)
      } else if (matchingMethod === 'local') {
        matchingResult = await this.localMatcher.matchItems(extractedItems, priceList, jobId, originalFileName, this.updateJobStatus.bind(this))
      } else {
        throw new Error(`Unknown matching method: ${matchingMethod}`)
      }
      
      console.log(`✅ ${matchingMethod} matching completed: ${matchingResult.totalMatched} matches found`)
      await this.updateJobStatus(jobId, 'processing', 80, `Found ${matchingResult.totalMatched} matches`)

      // Step 4: Save results to database
      console.log(`💾 Saving results to database...`)
      await this.saveMatchesToDatabase(jobId, matchingResult.matches)
      console.log(`✅ Results saved to database`)
      await this.updateJobStatus(jobId, 'processing', 90, 'Saving results...')

      // Step 5: Generate output Excel even if no matches were found
      console.log(`📄 Generating output Excel file...`)
      let outputPath = matchingResult.outputPath
      
      // If no output path (e.g., no matches), create one with ExcelExportService
      if (!outputPath || matchingResult.totalMatched === 0) {
        console.log(`📄 Creating Excel output with original format...`)
        const exportService = new ExcelExportService()
        outputPath = await exportService.exportWithOriginalFormat(
          inputFilePath, 
          matchingResult.matches || [], 
          jobId, 
          originalFileName
        )
        console.log(`✅ Created output file: ${outputPath}`)
      }

      // Step 6: Update job with final statistics
      await this.supabase
        .from('ai_matching_jobs')
        .update({
          matched_items: matchingResult.totalMatched,
          total_items: extractedItems.length,
          confidence_score: matchingResult.averageConfidence,
          output_file_path: outputPath
        })
        .eq('id', jobId)

      await this.updateJobStatus(jobId, 'completed', 100)
      console.log(`🎉 Job ${jobId} COMPLETED successfully`)

      // Cleanup temp files
      console.log(`🧹 Cleaning up temp files...`)
      await this.cleanup(inputFilePath)
      console.log(`✅ Cleanup completed`)

      console.log(`✅ Job ${jobId} completed successfully`)
      return outputPath

    } catch (error) {
      console.error(`❌ Job ${jobId} FAILED with error:`, error)
      console.error(`❌ Error stack:`, error.stack)
      await this.updateJobStatus(jobId, 'failed', 0, error.message)
      throw error
    }
  }

  async loadPriceList() {
    console.log('Loading price list from database...')
    
    // Fetch price items from Supabase - include id for proper mapping
    const { data: priceItems, error } = await this.supabase
      .from('price_items')
      .select('id, description, rate, full_context, unit')
      .not('rate', 'is', null)
      .not('description', 'is', null)

    if (error) {
      throw new Error(`Failed to fetch price items: ${error.message}`)
    }

    if (!priceItems || priceItems.length === 0) {
      throw new Error('No price items found in database')
    }

    console.log(`Loaded ${priceItems.length} price items from database`)
    return priceItems
  }

  async saveMatchesToDatabase(jobId, matches) {
    console.log(`Saving ${matches.length} matches to database...`)
    
    if (matches.length === 0) {
      console.log('No matches to save')
      return
    }

    // Transform matches for database
    const dbMatches = matches.map(match => ({
      job_id: jobId,
      sheet_name: match.sheet_name,
      row_number: match.row_number,
      original_description: match.original_description,
      preprocessed_description: match.original_description.toLowerCase().trim(),
      matched_description: match.matched_description,
      matched_rate: match.matched_rate,
      similarity_score: match.similarity_score,
      quantity: match.quantity,
      matched_price_item_id: match.matched_price_item_id
    }))

    // Save to database
    const { error } = await this.supabase
      .from('match_results')
      .insert(dbMatches)

    if (error) {
      console.error('Error saving match results:', error)
      throw new Error(`Failed to save results: ${error.message}`)
    }

    console.log(`Successfully saved ${matches.length} matches to database`)
  }

  async createPricelistFile() {
    console.log('Creating pricelist file from database...')
    
    // Fetch price items from Supabase - include id for proper mapping
    const { data: priceItems, error } = await this.supabase
      .from('price_items')
      .select('id, description, rate, full_context, unit')
      .not('rate', 'is', null)
      .not('description', 'is', null)

    if (error) {
      throw new Error(`Failed to fetch price items: ${error.message}`)
    }

    if (!priceItems || priceItems.length === 0) {
      throw new Error('No price items found in database')
    }

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Pricelist')

    // Add headers - include id and unit for proper matching and mapping
    worksheet.addRow(['ID', 'Description', 'Rate', 'Unit'])

    // Add data - use full_context for AI matching but include all necessary data
    priceItems.forEach(item => {
      worksheet.addRow([
        item.id, // Include ID for proper mapping
        item.full_context || item.description, // Use full_context for AI matching
        item.rate,
        item.unit || ''
      ])
    })

    // Save to temp directory
    await workbook.xlsx.writeFile(this.pricelistPath)
    console.log(`Created pricelist with ${priceItems.length} items`)
  }

  async loadAndPreservedFormatting(filePath) {
    console.log('Loading and preserving original Excel formatting...')
    
    try {
      const workbook = new ExcelJS.Workbook()
      await workbook.xlsx.readFile(filePath)

      // Store formatting information for each worksheet as an array
      const formattingInfo = []
      
      workbook.eachSheet((worksheet, sheetId) => {
        const sheetFormatting = {
          name: worksheet.name,
          columns: [],
          rows: [],
          properties: {
            defaultRowHeight: worksheet.properties.defaultRowHeight,
            defaultColWidth: worksheet.properties.defaultColWidth
          },
          pageSetup: worksheet.pageSetup
        }

        // Store column formatting
        if (worksheet.columns) {
          worksheet.columns.forEach((column, colIndex) => {
            if (column) {
              sheetFormatting.columns[colIndex] = {
                width: column.width,
                style: column.style
              }
            }
          })
        }

        // Store row formatting and cell styles
        worksheet.eachRow((row, rowNumber) => {
          const rowFormatting = {
            height: row.height,
            cells: []
          }

          try {
            row.eachCell((cell, colNumber) => {
              try {
                rowFormatting.cells[colNumber] = {
                  style: {
                    font: cell.font,
                    alignment: cell.alignment,
                    border: cell.border,
                    fill: cell.fill,
                    numFmt: cell.numFmt
                  }
                }
              } catch (cellError) {
                // Skip problematic cells
                console.warn(`⚠️ Could not preserve formatting for cell at row ${rowNumber}, col ${colNumber}: ${cellError.message}`)
              }
            })
          } catch (rowError) {
            console.warn(`⚠️ Could not iterate cells in row ${rowNumber}: ${rowError.message}`)
          }

          sheetFormatting.rows[rowNumber] = rowFormatting
        })

        formattingInfo[sheetId - 1] = sheetFormatting // Use zero-based index
      })

      console.log(`✅ Preserved formatting for ${formattingInfo.length} worksheets`)
      return formattingInfo
      
    } catch (error) {
      console.error(`❌ Error loading formatting: ${error.message}`)
      throw new Error(`Failed to load original formatting: ${error.message}`)
    }
  }

  async runPythonScript(inputPath, outputPath, jobId) {
    console.log('🐍 Running Python price matching script...')
    
    let apiKey = null
    
    // Try to get Cohere API key from admin settings first
    console.log('🔑 Fetching Cohere API key from admin settings...')
    
    try {
      const { data: settingsData, error: settingsError } = await this.supabase
        .from('app_settings')
        .select('cohere_api_key')
        .limit(1)
        .single()

      if (settingsError) {
        console.error('❌ Error fetching admin settings:', settingsError)
        throw new Error(`Admin settings error: ${settingsError.message}`)
      }

      if (settingsData?.cohere_api_key) {
        apiKey = settingsData.cohere_api_key
        console.log('✅ Successfully retrieved Cohere API key from admin settings')
      } else {
        throw new Error('No API key in admin settings')
      }

    } catch (adminError) {
      console.error('⚠️ Admin settings failed, trying .env fallback...')
      
      // Fallback to environment variable
      const envApiKey = process.env.COHERE_API_KEY
      console.error('🔍 Environment variables check:', {
        COHERE_API_KEY_exists: !!process.env.COHERE_API_KEY,
        COHERE_API_KEY_length: process.env.COHERE_API_KEY ? process.env.COHERE_API_KEY.length : 'undefined',
        COHERE_API_KEY_value: process.env.COHERE_API_KEY ? `${process.env.COHERE_API_KEY.substring(0, 8)}...` : 'undefined'
      })
      
      if (envApiKey) {
        apiKey = envApiKey
        console.log('✅ Using Cohere API key from .env file as fallback')
      } else {
        console.error('❌ No Cohere API key found in admin settings OR .env file')
        await this.updateJobStatus(jobId, 'failed', 0, `
❌ Cohere API Key Missing!

Setup required:
1. Add to Supabase app_settings table, OR
2. Add COHERE_API_KEY to .env file

Admin settings error: ${adminError.message}
        `.trim())
        throw new Error('No Cohere API key available')
      }
    }

    if (!apiKey) {
      throw new Error('Failed to obtain Cohere API key from any source')
    }

    console.log('🔧 Configuring Python script execution...')
    
    // Use python or python3 based on environment
    const pythonExecutable = process.env.PYTHON_EXECUTABLE || 'python'

    return new Promise((resolve, reject) => {
      console.log(`🚀 Starting Python process: ${pythonExecutable}`)
      console.log(`📁 Input file: ${inputPath}`)
      console.log(`📁 Output file: ${outputPath}`)
      
      const pythonProcess = spawn(pythonExecutable, [
        this.pythonScriptPath,
        '--inquiry', inputPath,
        '--pricelist', this.pricelistPath,
        '--output', outputPath,
        '--api-key', apiKey,
        '--verbose'  // Enable verbose logging
      ])

      let stdout = ''
      let stderr = ''

      pythonProcess.stdout.on('data', (data) => {
        const output = data.toString()
        stdout += output
        console.log('🐍 Python stdout:', output.trim())
        
        // Handle progress messages
        if (output.includes('PROGRESS:')) {
          const progressMatch = output.match(/PROGRESS:\s*(\d+\.?\d*)%/)
          if (progressMatch) {
            const progress = parseFloat(progressMatch[1])
            // Convert Python progress (0-100) to Node.js progress (30-80)
            const nodeProgress = 30 + (progress * 0.5)
            this.updateJobStatus(jobId, 'processing', Math.round(nodeProgress), `AI Processing: ${progress}%`)
          }
        }
        
        // Handle progress info messages
        if (output.includes('PROGRESS_INFO:')) {
          const infoMatch = output.match(/PROGRESS_INFO:\s*(.+)/)
          if (infoMatch) {
            console.log(`📊 Processing info: ${infoMatch[1]}`)
            // Update status with the info message
            this.updateJobStatus(jobId, 'processing', null, infoMatch[1])
          }
        }
        
        // Enhanced progress tracking based on Python output
        if (output.includes('Initializing Cohere client')) {
          this.updateJobStatus(jobId, 'processing', 33, 'Connecting to AI service...')
        } else if (output.includes('Loading pricelist')) {
          this.updateJobStatus(jobId, 'processing', 35, 'Loading price database...')
        } else if (output.includes('Generating price embeddings')) {
          this.updateJobStatus(jobId, 'processing', 40, 'Analyzing price descriptions...')
        } else if (output.includes('Loading inquiry workbook')) {
          this.updateJobStatus(jobId, 'processing', 50, 'Reading your Excel file...')
        } else if (output.includes('Generating embeddings for')) {
          this.updateJobStatus(jobId, 'processing', 60, 'Processing your items...')
        } else if (output.includes('Calculating similarity')) {
          this.updateJobStatus(jobId, 'processing', 70, 'Finding best matches...')
        } else if (output.includes('Saving results')) {
          this.updateJobStatus(jobId, 'processing', 75, 'Saving results to Excel...')
        } else if (output.includes('Processing completed')) {
          this.updateJobStatus(jobId, 'processing', 80, 'Finalizing results...')
        }
      })

      pythonProcess.stderr.on('data', (data) => {
        const error = data.toString()
        stderr += error
        console.error('🐍 Python stderr:', error.trim())
      })

      pythonProcess.on('close', async (code) => {
        if (code === 0) {
          console.log('✅ Python script completed successfully')
          
          // Try to extract summary data from stdout
          const summaryMatch = stdout.match(/SUMMARY:\s*({.*?})/)
          let summaryExtracted = false
          
          if (summaryMatch) {
            try {
              const summary = JSON.parse(summaryMatch[1])
              console.log('📊 Python summary:', summary)
              
              // Update job with summary data
              await this.supabase
                .from('ai_matching_jobs')
                .update({
                  matched_items: summary.total_matched,
                  total_items: summary.total_processed,
                  confidence_score: Math.round(summary.match_rate)
                })
                .eq('id', jobId)
              
              console.log('✅ Updated job with Python summary data')
              summaryExtracted = true
              
            } catch (parseError) {
              console.warn('⚠️ Could not parse Python summary:', parseError.message)
            }
          }
          
          // If no structured summary found, try to extract info from logs
          if (!summaryExtracted) {
            console.log('📊 Extracting summary from Python logs...')
            
            // Extract match statistics from log output
            const totalProcessedMatch = stdout.match(/Total items processed:\s*(\d+)/)
            const totalMatchedMatch = stdout.match(/Total items matched:\s*(\d+)/)
            const matchRateMatch = stdout.match(/Match rate:\s*([\d.]+)%/)
            
            if (totalProcessedMatch && totalMatchedMatch && matchRateMatch) {
              const totalProcessed = parseInt(totalProcessedMatch[1])
              const totalMatched = parseInt(totalMatchedMatch[1])
              const matchRate = parseFloat(matchRateMatch[1])
              
              console.log(`📊 Extracted from logs: ${totalMatched}/${totalProcessed} items (${matchRate}%)`)
              
              // Update job with extracted data
              await this.supabase
                .from('ai_matching_jobs')
                .update({
                  matched_items: totalMatched,
                  total_items: totalProcessed,
                  confidence_score: Math.round(matchRate)
                })
                .eq('id', jobId)
              
              console.log('✅ Updated job with extracted summary data')
            } else {
              console.warn('⚠️ Could not extract summary from logs, using default values')
              
              // Still update with basic completion info
              await this.supabase
                .from('ai_matching_jobs')
                .update({
                  matched_items: 0,
                  total_items: 0,
                  confidence_score: 0
                })
                .eq('id', jobId)
            }
          }
          
          resolve(stdout)
        } else {
          console.error(`❌ Python script failed with exit code ${code}`)
          console.error('📄 Full stderr output:', stderr)
          
          // Update job status with detailed error
          this.updateJobStatus(jobId, 'failed', 0, `
Python script failed (exit code: ${code})

Error details:
${stderr || 'No error details available'}

Possible causes:
- Python not installed or not in PATH
- Missing Python packages (cohere, openpyxl, numpy)
- Invalid Cohere API key
- File permission issues
          `.trim())
          
          reject(new Error(`Python script failed: ${stderr || 'Unknown error'}`))
        }
      })

      pythonProcess.on('error', (error) => {
        console.error('❌ Failed to start Python process:', error)
        
        this.updateJobStatus(jobId, 'failed', 0, `
Failed to start Python process

Error: ${error.message}

Possible causes:
- Python not installed
- Python not in system PATH
- Incorrect PYTHON_EXECUTABLE in .env
        `.trim())
        
        reject(new Error(`Failed to start Python process: ${error.message}`))
      })
    })
  }

  async applyPreservedFormatting(processedFilePath, originalFormatting) {
    try {
      console.log('Applying preserved formatting to processed file...')
      
      // Load the processed workbook
      const workbook = new ExcelJS.Workbook()
      await workbook.xlsx.readFile(processedFilePath)

      // Apply formatting to each worksheet
      originalFormatting.forEach((formatting, sheetIndex) => {
        if (!formatting) return

        const worksheet = workbook.worksheets[sheetIndex]
        if (!worksheet) return

        // Apply worksheet properties safely
        try {
          if (formatting.properties) {
            Object.assign(worksheet.properties, formatting.properties)
          }
          if (formatting.pageSetup) {
            Object.assign(worksheet.pageSetup, formatting.pageSetup)
          }
          if (formatting.defaultRowHeight) {
            worksheet.properties.defaultRowHeight = formatting.defaultRowHeight
          }
          if (formatting.defaultColWidth) {
            worksheet.properties.defaultColWidth = formatting.defaultColWidth
          }
        } catch (propError) {
          console.warn(`⚠️ Could not apply worksheet properties: ${propError.message}`)
        }

        // Apply column formatting safely
        if (formatting.columns && Array.isArray(formatting.columns)) {
          formatting.columns.forEach((colFormat, colIndex) => {
            try {
              if (colFormat && worksheet.getColumn(colIndex + 1)) {
                const column = worksheet.getColumn(colIndex + 1)
                if (colFormat.width) column.width = colFormat.width
                if (colFormat.style) column.style = colFormat.style
              }
            } catch (colError) {
              console.warn(`⚠️ Could not apply column ${colIndex + 1} formatting: ${colError.message}`)
            }
          })
        }

        // Apply row and cell formatting safely
        if (formatting.rows && Array.isArray(formatting.rows)) {
          formatting.rows.forEach((rowFormat, rowNumber) => {
            try {
              if (!rowFormat) return

              const row = worksheet.getRow(rowNumber)
              if (rowFormat.height) row.height = rowFormat.height

              // Apply cell formatting
              if (rowFormat.cells && Array.isArray(rowFormat.cells)) {
                rowFormat.cells.forEach((cellFormat, colNumber) => {
                  try {
                    if (!cellFormat) return

                    const cell = row.getCell(colNumber)
                    if (cellFormat.style) {
                      Object.assign(cell, cellFormat.style)
                    }
                  } catch (cellError) {
                    console.warn(`⚠️ Could not apply cell formatting at row ${rowNumber}, col ${colNumber}: ${cellError.message}`)
                  }
                })
              }
            } catch (rowError) {
              console.warn(`⚠️ Could not apply row ${rowNumber} formatting: ${rowError.message}`)
            }
          })
        }
      })

      // Save the formatted file
      await workbook.xlsx.writeFile(processedFilePath)
      console.log('✅ Applied preserved formatting successfully')
      
    } catch (error) {
      console.error(`❌ Error applying formatting: ${error.message}`)
      throw new Error(`Failed to apply formatting: ${error.message}`)
    }
  }

  async saveResultsToDatabase(jobId, outputFilePath) {
    console.log('Parsing results and saving to database...')
    
    try {
      console.log(`📁 Reading Excel file: ${outputFilePath}`)
      
      // Use xlsx library instead of ExcelJS to avoid compatibility issues
      const workbook = XLSX.readFile(outputFilePath)
      console.log(`✅ Excel file loaded successfully with xlsx library`)
      
      const matchResults = []
      let totalMatched = 0
      let totalConfidence = 0
      
      // Process each worksheet
      for (const sheetName of workbook.SheetNames) {
        try {
          console.log(`📊 Processing sheet: ${sheetName}`)
          const worksheet = workbook.Sheets[sheetName]
          
          // Convert worksheet to JSON format for easier processing
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
          
          if (!jsonData || jsonData.length === 0) {
            console.warn(`⚠️ Sheet ${sheetName} is empty, skipping`)
            continue
          }
          
          console.log(`📋 Sheet has ${jsonData.length} rows`)
          
          // Find header row and column indices
          let headerRowIndex = -1
          let descCol = -1
          let matchedDescCol = -1
          let rateCol = -1
          let simCol = -1
          let qtyCol = -1
          let matchedIdCol = -1
          let unitCol = -1
          
          // Look for headers in first 10 rows
          for (let rowIndex = 0; rowIndex < Math.min(10, jsonData.length); rowIndex++) {
            const row = jsonData[rowIndex]
            if (!row) continue
            
            for (let colIndex = 0; colIndex < row.length; colIndex++) {
              const cellValue = String(row[colIndex] || '').toLowerCase().replace(/\s+/g, '')
              const originalCellValue = String(row[colIndex] || '').toLowerCase()
              
              if (cellValue === 'original_description' || cellValue === 'description' || (originalCellValue.includes('description') && !originalCellValue.includes('matched'))) {
                descCol = colIndex
                headerRowIndex = rowIndex
              } else if (cellValue === 'matched_description' || cellValue === 'matcheddescription' || originalCellValue === 'matched description') {
                matchedDescCol = colIndex
              } else if (cellValue === 'matched_rate' || cellValue === 'matchedrate' || originalCellValue === 'matched rate') {
                rateCol = colIndex
              } else if (cellValue === 'similarity_score' || cellValue === 'similarityscore' || originalCellValue === 'similarity score') {
                simCol = colIndex
              } else if (cellValue === 'quantity' || cellValue.includes('qty')) {
                qtyCol = colIndex
              } else if (cellValue === 'matched_price_item_id' || cellValue === 'matched_id' || cellValue === 'matchedid' || originalCellValue === 'matched id') {
                matchedIdCol = colIndex
              } else if (cellValue === 'unit') {
                unitCol = colIndex
              }
            }
            
            if (descCol >= 0 && rateCol >= 0 && simCol >= 0) break
          }
          
          if (headerRowIndex === -1 || descCol === -1 || rateCol === -1 || simCol === -1) {
            console.warn(`Could not find required columns in sheet ${sheetName}. Found: desc=${descCol >= 0}, rate=${rateCol >= 0}, sim=${simCol >= 0}`)
            
            // Debug: Print headers
            if (headerRowIndex >= 0 && jsonData[headerRowIndex]) {
              const headers = jsonData[headerRowIndex].map((h, i) => `${i}: "${h}"`).join(', ')
              console.log(`Available headers in sheet ${sheetName}: ${headers}`)
            }
            continue
          }
          
          console.log(`Processing sheet ${sheetName} - found columns: desc=${descCol}, matchedDesc=${matchedDescCol}, rate=${rateCol}, sim=${simCol}, qty=${qtyCol}, matchedId=${matchedIdCol}, unit=${unitCol}`)
          
          // Debug: Print all found headers
          if (headerRowIndex >= 0 && jsonData[headerRowIndex]) {
            const headers = jsonData[headerRowIndex].map((h, i) => `${i}: "${h}"`).join(', ')
            console.log(`All headers in sheet ${sheetName}: ${headers}`)
          }
          
          // Process data rows
          for (let rowIndex = headerRowIndex + 1; rowIndex < jsonData.length; rowIndex++) {
            try {
              const row = jsonData[rowIndex]
              if (!row) continue
              
              const originalDescription = String(row[descCol] || '').trim()
              const matchedDescription = matchedDescCol >= 0 ? String(row[matchedDescCol] || '').trim() : ''
              const matchedRate = parseFloat(row[rateCol]) || 0
              const similarity = parseFloat(row[simCol]) || 0
              const quantity = qtyCol >= 0 ? parseFloat(row[qtyCol]) || 1 : 1
              const matchedPriceItemId = matchedIdCol >= 0 ? String(row[matchedIdCol] || '') : null
              const unit = unitCol >= 0 ? String(row[unitCol] || '') : ''
              
              if (originalDescription && matchedRate > 0) {
                matchResults.push({
                  job_id: jobId,
                  sheet_name: sheetName,
                  row_number: rowIndex + 1, // Excel row numbers start from 1
                  original_description: originalDescription,
                  preprocessed_description: originalDescription.toLowerCase().trim(),
                  matched_description: matchedDescription,
                  matched_rate: matchedRate,
                  similarity_score: similarity,
                  quantity: quantity,
                  matched_price_item_id: matchedPriceItemId
                  // Removed 'unit' field as it doesn't exist in the database schema
                })
                
                totalMatched++
                totalConfidence += similarity
              }
            } catch (rowError) {
              console.warn(`⚠️ Could not process row ${rowIndex + 1} in sheet ${sheetName}: ${rowError.message}`)
            }
          }
        } catch (sheetError) {
          console.warn(`⚠️ Could not process sheet ${sheetName}: ${sheetError.message}`)
        }
      }
      
      if (matchResults.length > 0) {
        console.log(`💾 Saving ${matchResults.length} actual results to database...`)
        
        // Save to database
        const { error } = await this.supabase
          .from('match_results')
          .insert(matchResults)

        if (error) {
          console.error('Error saving match results:', error)
          throw new Error(`Failed to save results: ${error.message}`)
        }

        const avgConfidence = Math.round((totalConfidence / totalMatched) * 100)

        // Update job with final statistics
        await this.supabase
          .from('ai_matching_jobs')
          .update({
            matched_items: totalMatched,
            total_items: matchResults.length,
            confidence_score: avgConfidence
          })
          .eq('id', jobId)

        console.log(`✅ Saved ${matchResults.length} actual match results to database`)
      } else {
        console.warn('⚠️ No results found to save to database')
        throw new Error('No valid results found in processed file')
      }
      
    } catch (error) {
      console.error(`❌ Error in saveResultsToDatabase: ${error.message}`)
      throw new Error(`Failed to parse and save results: ${error.message}`)
    }
  }

  async updateJobStatus(jobId, status, progress = 0, errorMessage = null, extraData = {}) {
    try {
      console.log(`📊 Updating job ${jobId}: ${status} (${progress}%)${errorMessage ? ` - ${errorMessage.split('\n')[0]}` : ''}`)
      
      const updateData = {
        status,
        progress,
        updated_at: new Date().toISOString()
      }
      
      if (errorMessage) {
        updateData.error_message = errorMessage
      }
      
      const { error } = await this.supabase
        .from('ai_matching_jobs')
        .update(updateData)
        .eq('id', jobId)

      if (error) {
        console.error(`❌ Failed to update job status for ${jobId}:`, error)
      } else {
        console.log(`✅ Job ${jobId} status updated successfully`)
      }
    } catch (error) {
      console.error(`❌ Error updating job status for ${jobId}:`, error)
    }
  }

  async getProcessedFile(jobId) {
    // Try to get output path from job record first
    const { data: job, error } = await this.supabase
      .from('ai_matching_jobs')
      .select('output_file_path')
      .eq('id', jobId)
      .single()

    if (!error && job?.output_file_path) {
      return job.output_file_path
    }

    // Fallback to searching in output directory
    const outputFiles = await fs.readdir(this.outputDir)
    const jobFile = outputFiles.find(file => file.includes(jobId))
    return jobFile ? path.join(this.outputDir, jobFile) : null
  }

  async getJobStatus(jobId) {
    try {
      const { data, error } = await this.supabase
        .from('ai_matching_jobs')
        .select('*')
        .eq('id', jobId)
        .single()

      if (error) {
        console.error(`Error fetching job status for ${jobId}:`, error)
        
        // If job not found, return a default pending status
        if (error.code === 'PGRST116' || error.message.includes('No rows returned')) {
          console.log(`Job ${jobId} not found, returning default pending status`)
          return {
            id: jobId,
            status: 'pending',
            progress: 0,
            matched_items: 0,
            confidence_score: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            error_message: null
          }
        }
        
        throw new Error(`Failed to get job status: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error(`Exception in getJobStatus for ${jobId}:`, error)
      throw error
    }
  }

  async cleanup(filePath) {
    try {
      if (await fs.pathExists(filePath)) {
        await fs.remove(filePath)
        console.log(`Cleaned up temp file: ${filePath}`)
      }
    } catch (error) {
      console.warn(`Could not clean up temp file ${filePath}:`, error.message)
    }
  }

  async exportFilteredResults(jobId, matchResults) {
    console.log(`🚀 STARTING EXPORT: job ${jobId} with ${matchResults.length} filtered results`)
    
    try {
      // Get job details
      const { data: job, error: jobError } = await this.supabase
        .from('ai_matching_jobs')
        .select('project_name, original_filename')
        .eq('id', jobId)
        .single()

      if (jobError) {
        throw new Error(`Failed to get job details: ${jobError.message}`)
      }

      // Create Excel workbook
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Match Results')

      // Define headers with better layout for direct rate filling
      const headers = [
        'Row', 'Sheet', 'Original Description', 'Matched Description', 
        'Quantity', 'Unit', 'Rate', 'Total Amount', 'Confidence %'
      ]
      
      // Add headers with styling
      const headerRow = worksheet.addRow(headers)
      headerRow.font = { bold: true, color: { argb: 'FFFFFF' } }
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '366092' }
      }

      // Set column widths
      worksheet.columns = [
        { width: 8 },   // Row
        { width: 12 },  // Sheet
        { width: 40 },  // Original Description
        { width: 40 },  // Matched Description
        { width: 10 },  // Quantity
        { width: 10 },  // Unit
        { width: 12 },  // Rate
        { width: 15 },  // Total Amount
        { width: 12 }   // Confidence
      ]

      // Add data rows
      let grandTotal = 0
      matchResults.forEach((result, index) => {
        const total = (result.quantity || 0) * (result.matched_rate || 0)
        grandTotal += total

        const dataRow = worksheet.addRow([
          result.row_number || (index + 1),
          result.sheet_name || 'Sheet1',
          result.original_description || '',
          result.matched_description || '',
          result.quantity || 0,
          result.unit || '',
          result.matched_rate || 0,
          total,
          Math.round((result.similarity_score || 0) * 100)
        ])

        // Format numerical columns
        dataRow.getCell(5).numFmt = '0.00'  // Quantity
        dataRow.getCell(7).numFmt = '"$"#,##0.00'  // Rate
        dataRow.getCell(8).numFmt = '"$"#,##0.00'  // Total Amount
        dataRow.getCell(9).numFmt = '0"%"'  // Confidence

        // Add borders
        dataRow.eachCell((cell, colNumber) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          }
        })
      })

      // Add grand total row
      const totalRow = worksheet.addRow([
        '', '', '', 'GRAND TOTAL:', '', '', '', grandTotal, ''
      ])
      totalRow.font = { bold: true }
      totalRow.getCell(8).numFmt = '"$"#,##0.00'
      totalRow.getCell(4).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFCC' }
      }
      totalRow.getCell(8).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFCC' }
      }

      // Add borders to total row
      totalRow.eachCell((cell, colNumber) => {
        cell.border = {
          top: { style: 'thick' },
          left: { style: 'thin' },
          bottom: { style: 'thick' },
          right: { style: 'thin' }
        }
      })

      // Add summary information at the top
      worksheet.insertRow(1, ['Export Summary'])
      worksheet.insertRow(2, ['Project:', job.project_name])
      worksheet.insertRow(3, ['Original File:', job.original_filename])
      worksheet.insertRow(4, ['Export Date:', new Date().toLocaleString()])
      worksheet.insertRow(5, ['Total Items:', matchResults.length])
      worksheet.insertRow(6, []) // Empty row

      // Style summary rows
      for (let i = 1; i <= 5; i++) {
        const row = worksheet.getRow(i)
        row.font = { bold: true }
        row.getCell(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'E8F4F8' }
        }
      }

      // Save the workbook
      const outputFilePath = path.join(this.outputDir, `filtered-export-${jobId}-${job.project_name}_Results.xlsx`)
      await workbook.xlsx.writeFile(outputFilePath)
      
      console.log(`✅ Export file created: ${outputFilePath}`)
      return outputFilePath

    } catch (error) {
      console.error(`❌ Export failed for job ${jobId}:`, error)
      throw error
    }
  }
} 