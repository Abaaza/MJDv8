import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs-extra'
import { fileURLToPath } from 'url'
import ExcelJS from 'exceljs'
import { createClient } from '@supabase/supabase-js'

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
  }

  async processFile(jobId, inputFilePath, originalFileName) {
    try {
      console.log(`🚀 STARTING PROCESSING: job ${jobId} with file: ${originalFileName}`)
      console.log(`📁 Input file path: ${inputFilePath}`)
      console.log(`🔧 Environment check:`, {
        SUPABASE_URL: !!process.env.SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
        COHERE_API_KEY: !!process.env.COHERE_API_KEY
      })
      
      // Verify input file exists
      if (!await fs.pathExists(inputFilePath)) {
        throw new Error(`Input file does not exist: ${inputFilePath}`)
      }
      console.log(`✅ Input file verified: ${inputFilePath}`)
      
      // Update job status to processing
      console.log(`📊 Updating job status to processing...`)
      await this.updateJobStatus(jobId, 'processing', 10)
      console.log(`✅ Job status updated to processing`)

      // Step 1: Create pricelist Excel file from database
      console.log(`📋 Creating pricelist file...`)
      await this.createPricelistFile()
      console.log(`✅ Pricelist file created`)
      await this.updateJobStatus(jobId, 'processing', 20)

      // Step 2: Preserve original Excel formatting
      let originalWorkbook = null
      try {
        console.log(`🎨 Preserving original formatting...`)
        originalWorkbook = await this.loadAndPreserveFormatting(inputFilePath)
        console.log(`✅ Original formatting preserved`)
        await this.updateJobStatus(jobId, 'processing', 30)
      } catch (formatError) {
        console.warn('⚠️ Could not preserve original formatting:', formatError.message)
        await this.updateJobStatus(jobId, 'processing', 30, 'Processing without format preservation...')
      }

      // Step 3: Run Python script for price matching
      console.log(`🐍 Running Python script...`)
      const outputFilePath = path.join(this.outputDir, `processed-${jobId}-${originalFileName}`)
      console.log(`📁 Output file path: ${outputFilePath}`)
      await this.runPythonScript(inputFilePath, outputFilePath, jobId)
      console.log(`✅ Python script completed`)
      await this.updateJobStatus(jobId, 'processing', 85)

      // Step 4: Apply preserved formatting to processed file (optional)
      if (originalWorkbook) {
        try {
          console.log('🎨 Applying preserved formatting to processed file...')
          await this.applyPreservedFormatting(outputFilePath, originalWorkbook)
          console.log(`✅ Formatting applied successfully`)
          await this.updateJobStatus(jobId, 'processing', 90, 'Applied formatting successfully')
        } catch (formatError) {
          console.warn('⚠️ Could not apply formatting, but processing completed:', formatError.message)
          await this.updateJobStatus(jobId, 'processing', 90, 'Processing completed (formatting skipped)')
        }
      } else {
        console.log('📄 Skipping formatting preservation (original format could not be loaded)')
        await this.updateJobStatus(jobId, 'processing', 90, 'Processing completed (no formatting applied)')
      }

      // Step 5: Parse results and save to database
      try {
        console.log(`💾 Saving results to database...`)
        await this.saveResultsToDatabase(jobId, outputFilePath)
        console.log(`✅ Results saved to database`)
        await this.updateJobStatus(jobId, 'completed', 100)
        console.log(`🎉 Job ${jobId} COMPLETED successfully`)
      } catch (dbError) {
        console.warn('⚠️ Could not save results to database, but processing completed:', dbError.message)
        
        // Still mark as completed - the Python script succeeded and Excel file is available
        // The job summary was already updated during Python execution
        await this.updateJobStatus(jobId, 'completed', 100, 'Processing completed successfully - results available for download')
        console.log(`🎉 Job ${jobId} COMPLETED with database warning`)
      }

      // Cleanup temp files
      console.log(`🧹 Cleaning up temp files...`)
      await this.cleanup(inputFilePath)
      console.log(`✅ Cleanup completed`)

      console.log(`✅ Job ${jobId} completed successfully`)
      return outputFilePath

    } catch (error) {
      console.error(`❌ Job ${jobId} FAILED with error:`, error)
      console.error(`❌ Error stack:`, error.stack)
      await this.updateJobStatus(jobId, 'failed', 0, error.message)
      throw error
    }
  }

  async createPricelistFile() {
    console.log('Creating pricelist file from database...')
    
    // Fetch price items from Supabase
    const { data: priceItems, error } = await this.supabase
      .from('price_items')
      .select('description, rate, full_context')
      .not('rate', 'is', null)
      .not('full_context', 'is', null)

    if (error) {
      throw new Error(`Failed to fetch price items: ${error.message}`)
    }

    if (!priceItems || priceItems.length === 0) {
      throw new Error('No price items found in database')
    }

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Pricelist')

    // Add headers
    worksheet.addRow(['Description', 'Rate'])

    // Add data
    priceItems.forEach(item => {
      worksheet.addRow([
        item.full_context || item.description,
        item.rate
      ])
    })

    // Save to temp directory
    await workbook.xlsx.writeFile(this.pricelistPath)
    console.log(`Created pricelist with ${priceItems.length} items`)
  }

  async loadAndPreserveFormatting(filePath) {
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
      const workbook = new ExcelJS.Workbook()
      await workbook.xlsx.readFile(outputFilePath)

      const matchResults = []
      let totalMatched = 0
      let totalConfidence = 0

      workbook.eachSheet((worksheet, sheetId) => {
        try {
          // Find the header row and relevant columns
          let headerRow = null
          let descCol = null
          let rateCol = null
          let simCol = null
          let qtyCol = null

          // Scan first 10 rows for headers
          for (let rowNum = 1; rowNum <= Math.min(10, worksheet.rowCount); rowNum++) {
            const row = worksheet.getRow(rowNum)
            
            row.eachCell((cell, colNumber) => {
              const value = cell.value?.toString()?.toLowerCase() || ''
              
              if (value.includes('description')) {
                descCol = colNumber
                headerRow = rowNum
              } else if (value.includes('matched rate')) {
                rateCol = colNumber
              } else if (value.includes('similarity')) {
                simCol = colNumber
              } else if (value.includes('qty') || value.includes('quantity')) {
                qtyCol = colNumber
              }
            })

            if (descCol && rateCol && simCol) break
          }

          if (!headerRow || !descCol || !rateCol || !simCol) {
            console.warn(`Could not find required columns in sheet ${worksheet.name}`)
            return
          }

          // Process data rows
          for (let rowNum = headerRow + 1; rowNum <= worksheet.rowCount; rowNum++) {
            try {
              const row = worksheet.getRow(rowNum)
              
              const description = row.getCell(descCol).value?.toString()
              const matchedRate = parseFloat(row.getCell(rateCol).value) || 0
              const similarity = parseFloat(row.getCell(simCol).value) || 0
              const quantity = qtyCol ? parseFloat(row.getCell(qtyCol).value) || 0 : 1

              if (description && matchedRate > 0) {
                matchResults.push({
                  job_id: jobId,
                  sheet_name: worksheet.name,
                  row_number: rowNum,
                  original_description: description,
                  matched_rate: matchedRate,
                  similarity_score: similarity,
                  quantity: quantity
                })

                totalMatched++
                totalConfidence += similarity
              }
            } catch (rowError) {
              console.warn(`⚠️ Could not process row ${rowNum} in sheet ${worksheet.name}: ${rowError.message}`)
              // Skip this row and continue with the next one
            }
          }
        } catch (sheetError) {
          console.warn(`⚠️ Could not process sheet ${worksheet.name}: ${sheetError.message}`)
          return
        }
      })

      if (matchResults.length > 0) {
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

        console.log(`✅ Saved ${matchResults.length} match results to database`)
      } else {
        console.warn('⚠️ No results found to save to database')
        throw new Error('No valid results found in processed file')
      }
      
    } catch (error) {
      console.error(`❌ Error in saveResultsToDatabase: ${error.message}`)
      throw new Error(`Failed to parse and save results: ${error.message}`)
    }
  }

  async updateJobStatus(jobId, status, progress = 0, errorMessage = null) {
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
    // Find the processed file for this job
    const files = await fs.readdir(this.outputDir)
    const jobFile = files.find(file => file.includes(`processed-${jobId}-`))
    
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
      }
      if (await fs.pathExists(this.pricelistPath)) {
        await fs.remove(this.pricelistPath)
      }
    } catch (error) {
      console.error('Cleanup error:', error)
    }
  }
} 