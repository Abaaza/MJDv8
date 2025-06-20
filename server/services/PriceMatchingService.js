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
      
      // Update job status to processing - but don't show progress until matching starts
      console.log(`📊 Updating job status to processing...`)
      await this.updateJobStatus(jobId, 'processing', 0) // No progress shown during parsing
      console.log(`✅ Job status updated to processing`)

      // Step 1: Extract items from Excel (silent parsing - no progress updates)
      console.log(`📊 Extracting items from Excel file...`)
      
      // Store the original input file path in the job record
      console.log(`[PRICE MATCHING DEBUG] Storing original input file path: ${inputFilePath}`)
      const { error: pathUpdateError } = await this.supabase
        .from('ai_matching_jobs')
        .update({
          original_file_path: inputFilePath
        })
        .eq('id', jobId)
      
      if (pathUpdateError) {
        console.error('[PRICE MATCHING DEBUG] Error storing original file path:', pathUpdateError)
      }
      
      const extractedItems = await this.excelParser.parseExcelFile(inputFilePath, jobId, originalFileName)
      console.log(`✅ Extracted ${extractedItems.length} items from Excel`)
      // Skip the parsing complete update - go straight to matching phase
      
      // Start progress updates only when matching begins - ensure total_items is set from the start
      await this.updateJobStatus(jobId, 'processing', 30, `Starting to match ${extractedItems.length} items`, {
        total_items: extractedItems.length,
        matched_items: 0
      })
      
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
      await this.updateJobStatus(jobId, 'processing', 50, `Preparing to match against ${priceList.length} price items`)

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
      
      console.log(`[PRICE MATCHING DEBUG] Received matching result:`, {
        method: matchingMethod,
        totalMatched: matchingResult.totalMatched,
        averageConfidence: matchingResult.averageConfidence,
        matchesLength: matchingResult.matches?.length,
        outputPath: matchingResult.outputPath
      })
      
      console.log(`✅ ${matchingMethod} matching completed: ${matchingResult.totalMatched} matches found`)
      console.log(`[PRICE MATCHING DEBUG] Output path: ${matchingResult.outputPath}`)
      await this.updateJobStatus(jobId, 'processing', 80, `Found ${matchingResult.totalMatched} matches`, {
        matched_items: matchingResult.totalMatched,
        total_items: extractedItems.length
      })

      // Step 4: Save results to database
      console.log(`💾 Saving results to database...`)
      await this.saveMatchesToDatabase(jobId, matchingResult.matches)
      console.log(`✅ Results saved to database`)
      await this.updateJobStatus(jobId, 'processing', 90, 'Saving results...', {
        matched_items: matchingResult.totalMatched,
        total_items: extractedItems.length
      })

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
      console.log(`[PRICE MATCHING DEBUG] Updating job with final stats:`, {
        matched_items: matchingResult.totalMatched,
        total_items: extractedItems.length,
        confidence_score: matchingResult.averageConfidence,
        output_file_path: outputPath
      })
      
      // First try to update with output_file_path
      const { error: updateError } = await this.supabase
        .from('ai_matching_jobs')
        .update({
          matched_items: matchingResult.totalMatched,
          total_items: extractedItems.length,
          confidence_score: matchingResult.averageConfidence,
          output_file_path: outputPath
        })
        .eq('id', jobId)
      
      if (updateError) {
        console.error('[PRICE MATCHING DEBUG] Error updating job with output_file_path:', updateError)
        
        // If it fails (likely due to missing column), update without output_file_path
        console.log('[PRICE MATCHING DEBUG] Retrying update without output_file_path...')
        const { error: fallbackError } = await this.supabase
          .from('ai_matching_jobs')
          .update({
            matched_items: matchingResult.totalMatched,
            total_items: extractedItems.length,
            confidence_score: matchingResult.averageConfidence
          })
          .eq('id', jobId)
        
        if (fallbackError) {
          console.error('[PRICE MATCHING DEBUG] Fallback update also failed:', fallbackError)
        } else {
          console.log('[PRICE MATCHING DEBUG] Successfully updated job stats (without output_file_path)')
        }
      }
      
      // Verify the update worked
      const { data: updatedJob, error: verifyError } = await this.supabase
        .from('ai_matching_jobs')
        .select('matched_items, total_items, confidence_score, output_file_path')
        .eq('id', jobId)
        .single()
      
      if (verifyError) {
        console.error('[PRICE MATCHING DEBUG] Error verifying job update:', verifyError)
      } else {
        console.log('[PRICE MATCHING DEBUG] Job after update:', {
          matched_items: updatedJob.matched_items,
          total_items: updatedJob.total_items,
          confidence_score: updatedJob.confidence_score,
          output_file_path: updatedJob.output_file_path
        })
      }

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
    
    let allPriceItems = []
    let from = 0
    const batchSize = 1000
    let hasMore = true
    
    // Load price items in batches to overcome Supabase limit
    while (hasMore) {
      const { data: batch, error } = await this.supabase
        .from('price_items')
        .select('id, description, rate, full_context, unit')
        .not('rate', 'is', null)
        .not('description', 'is', null)
        .range(from, from + batchSize - 1)
      
      if (error) {
        console.error(`Error loading batch at offset ${from}:`, error)
        throw new Error(`Failed to fetch price items: ${error.message}`)
      }
      
      if (batch && batch.length > 0) {
        allPriceItems = [...allPriceItems, ...batch]
        from += batchSize
        console.log(`Loaded batch: ${allPriceItems.length} items so far...`)
        
        // If we got less than batchSize, we've reached the end
        if (batch.length < batchSize) {
          hasMore = false
        }
      } else {
        hasMore = false
      }
    }

    if (!allPriceItems || allPriceItems.length === 0) {
      throw new Error('No price items found in database')
    }

    console.log(`✅ Loaded total of ${allPriceItems.length} price items from database`)
    return allPriceItems
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
      matched_price_item_id: match.matched_price_item_id,
      section_header: match.section_header || null
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
            console.warn(`⚠️ Empty sheet: ${sheetName}`)
            continue
          }
          
          // Find header row
          let headerRow = -1
          for (let i = 0; i < Math.min(10, jsonData.length); i++) {
            const row = jsonData[i]
            if (row && Array.isArray(row)) {
              const rowStr = row.join(',').toLowerCase()
              if (rowStr.includes('description') || rowStr.includes('best match')) {
                headerRow = i
                break
              }
            }
          }
          
          if (headerRow === -1) {
            console.warn(`⚠️ Could not find headers in sheet ${sheetName}`)
            continue
          }
          
          // Process data rows
          for (let i = headerRow + 1; i < jsonData.length; i++) {
            const row = jsonData[i]
            if (!row || !Array.isArray(row)) continue
            
            // Extract data from row
            const description = row[0]
            const matchedDescription = row[1]
            const confidence = row[2]
            const quantity = row[3]
            const unit = row[4]
            const rate = row[5]
            
            if (description && matchedDescription && confidence) {
              const confidenceScore = parseFloat(String(confidence).replace('%', ''))
              
              matchResults.push({
                job_id: jobId,
                original_description: description,
                matched_description: matchedDescription,
                confidence_score: confidenceScore,
                quantity: quantity || 0,
                unit: unit || '',
                matched_rate: rate || 0,
                row_number: i
              })
              
              if (confidenceScore > 0) {
                totalMatched++
                totalConfidence += confidenceScore
              }
            }
          }
          
        } catch (sheetError) {
          console.error(`❌ Error processing sheet ${sheetName}:`, sheetError)
        }
      }
      
      console.log(`📊 Parsed ${matchResults.length} results, ${totalMatched} matched`)
      
      // Calculate average confidence
      const averageConfidence = totalMatched > 0 ? totalConfidence / totalMatched : 0
      
      // Save results to database
      if (matchResults.length > 0) {
        const { error } = await this.supabase
          .from('match_results')
          .insert(matchResults)
        
        if (error) {
          console.error('❌ Error saving match results:', error)
          throw error
        }
      }
      
      return {
        totalItems: matchResults.length,
        totalMatched,
        averageConfidence: Math.round(averageConfidence)
      }
      
    } catch (error) {
      console.error('❌ Error parsing results:', error)
      throw error
    }
  }

  /**
   * Get job status from database
   */
  async getJobStatus(jobId) {
    try {
      const { data, error } = await this.supabase
        .from('ai_matching_jobs')
        .select('*')
        .eq('id', jobId)
        .single()

      if (error) {
        console.error('Error fetching job status:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in getJobStatus:', error)
      return null
    }
  }

  /**
   * Update job status in database
   */
  async updateJobStatus(jobId, status, progress = null, message = null, extraData = {}) {
    try {
      console.log(`🔄 [UPDATE JOB STATUS] Starting update for job ${jobId}:`, {
        status,
        progress,
        message: message ? message.substring(0, 100) + '...' : null,
        extraData
      })
      
      const updateData = {
        status,
        updated_at: new Date().toISOString()
      }

      // Properly merge extraData
      if (extraData && typeof extraData === 'object') {
        Object.assign(updateData, extraData)
      }

      if (progress !== null) {
        updateData.progress = progress
      }

      if (message !== null) {
        // Ensure message fits within database constraints (e.g., 500 chars)
        // Note: The database column is actually 'error_message', not 'message'
        updateData.error_message = message ? message.substring(0, 500) : null
      }

      console.log(`🔄 [UPDATE JOB STATUS] Updating database with:`, updateData)

      const { error } = await this.supabase
        .from('ai_matching_jobs')
        .update(updateData)
        .eq('id', jobId)

      if (error) {
        console.error(`❌ [UPDATE JOB STATUS] Failed to update job ${jobId}:`, error)
        return false
      }

      console.log(`✅ [UPDATE JOB STATUS] Successfully updated job ${jobId}: status=${status}, progress=${progress}`)
      
      // Verify the update worked by reading it back
      const { data: verifyData, error: verifyError } = await this.supabase
        .from('ai_matching_jobs')
        .select('status, progress, error_message, total_items, matched_items, updated_at')
        .eq('id', jobId)
        .single()
      
      if (verifyError) {
        console.error(`❌ [UPDATE JOB STATUS] Could not verify update for job ${jobId}:`, verifyError)
      } else {
        console.log(`🔍 [UPDATE JOB STATUS] Verified database state for job ${jobId}:`, {
          status: verifyData.status,
          progress: verifyData.progress,
          message: verifyData.error_message?.substring(0, 50) + '...',
          total_items: verifyData.total_items,
          matched_items: verifyData.matched_items,
          updated_at: verifyData.updated_at
        })
      }

      return true

    } catch (error) {
      console.error(`❌ [UPDATE JOB STATUS] Error updating job status for ${jobId}:`, error)
      return false
    }
  }

  /**
   * Clean up temporary files after processing
   */
  async cleanup(filePath) {
    try {
      console.log(`🧹 Cleaning up temporary file: ${filePath}`)
      
      if (!filePath) {
        console.log('No file path provided for cleanup')
        return
      }

      // Check if file exists before trying to delete
      const fs = await import('fs/promises')
      
      try {
        await fs.access(filePath)
        await fs.unlink(filePath)
        console.log(`✅ Successfully deleted temporary file: ${filePath}`)
      } catch (accessError) {
        if (accessError.code === 'ENOENT') {
          console.log(`📁 File already removed or doesn't exist: ${filePath}`)
        } else {
          console.warn(`⚠️ Could not access file for cleanup: ${accessError.message}`)
        }
      }
    } catch (error) {
      console.error(`❌ Error during cleanup: ${error.message}`)
      // Don't throw error - cleanup failure shouldn't break the entire job
    }
  }
}