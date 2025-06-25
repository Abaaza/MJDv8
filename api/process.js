// Separate Vercel function for processing jobs
// This runs independently and can take longer

export default async function handler(req, res) {
  const startTime = Date.now();
  console.log(`🔄 [PROCESS] Function invoked at ${new Date().toISOString()}`);
  console.log(`🔄 [PROCESS] Method: ${req.method}`);
  console.log(`🔄 [PROCESS] URL: ${req.url}`);
  console.log(`🔄 [PROCESS] Headers:`, {
    'content-type': req.headers['content-type'],
    'user-agent': req.headers['user-agent'],
    'content-length': req.headers['content-length'],
    'host': req.headers['host'],
    'x-forwarded-for': req.headers['x-forwarded-for'],
    'x-vercel-id': req.headers['x-vercel-id']
  });
  console.log(`🔄 [PROCESS] Query params:`, req.query);
  console.log(`🔄 [PROCESS] Request body type:`, typeof req.body);
  console.log(`🔄 [PROCESS] Request body:`, req.body);
  
  // Handle GET requests for health check - MUST be before other method checks
  if (req.method === 'GET') {
    console.log(`🏓 [PROCESS] Health check - GET request received`);
    return res.status(200).json({ 
      status: 'ok', 
      message: 'Process function is alive',
      timestamp: new Date().toISOString(),
      method: 'GET'
    });
  }
  
  if (req.method !== 'POST') {
    console.log(`❌ [PROCESS] Invalid method: ${req.method}`);
    console.log(`❌ [PROCESS] Expected POST, got: ${req.method}`);
    console.log(`❌ [PROCESS] Request URL: ${req.url}`);
    console.log(`❌ [PROCESS] Full request details:`, {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body
    });
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let jobId = null;
  let supabase = null;
  
  try {
    console.log(`🔄 [PROCESS] Starting imports...`);
    
    // Dynamic imports for better error handling
    const { createClient } = await import('@supabase/supabase-js');
    console.log(`✅ [PROCESS] Supabase client imported`);
    
    const fs = await import('fs-extra');
    console.log(`✅ [PROCESS] fs-extra imported`);
    
    const path = await import('path');
    console.log(`✅ [PROCESS] path imported`);
    
    const XLSX = await import('xlsx');
    console.log(`✅ [PROCESS] xlsx imported`);
    
    const ExcelJS = await import('exceljs');
    console.log(`✅ [PROCESS] exceljs imported`);
    
    const { v4: uuidv4 } = await import('uuid');
    console.log(`✅ [PROCESS] uuid imported`);
    
    const Fuse = await import('fuse.js');
    console.log(`✅ [PROCESS] fuse.js imported`);
    
    console.log(`✅ [PROCESS] All imports completed`);
    
    console.log(`🔄 [PROCESS] Parsing request body...`);
    console.log(`🔄 [PROCESS] Body type: ${typeof req.body}`);
    console.log(`🔄 [PROCESS] Body contents:`, req.body);
    
    // Handle case where body might not be parsed
    if (!req.body || typeof req.body !== 'object') {
      console.error(`❌ [PROCESS] Invalid request body format:`, req.body);
      return res.status(400).json({ error: 'Invalid request body format' });
    }
    
    const { jobId: requestJobId } = req.body;
    jobId = requestJobId;
    
    if (!jobId) {
      console.error(`❌ [PROCESS] No job ID provided in request body:`, req.body);
      return res.status(400).json({ error: 'Job ID is required' });
    }

    console.log(`🔄 [PROCESS] Starting processing for job: ${jobId}`);
    console.log(`🔄 [PROCESS] Environment check:`, {
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasBlobToken: !!process.env.BLOB_READ_WRITE_TOKEN,
      nodeEnv: process.env.NODE_ENV,
      supabaseUrlPreview: process.env.SUPABASE_URL ? process.env.SUPABASE_URL.substring(0, 50) + '...' : 'undefined',
      keyLength: process.env.SUPABASE_SERVICE_ROLE_KEY ? process.env.SUPABASE_SERVICE_ROLE_KEY.length : 0
    });

    // Check required environment variables
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    }

    // Create Supabase client directly
    console.log(`🔄 [PROCESS] Creating Supabase client...`);
    supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    console.log(`✅ [PROCESS] Supabase client created successfully`);
    
    // Test database connection
    console.log(`🔄 [PROCESS] Testing database connection...`);
    const { data: testData, error: testError } = await supabase
      .from('ai_matching_jobs')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.error(`❌ [PROCESS] Database connection test failed:`, testError);
      throw new Error(`Database connection failed: ${testError.message}`);
    }
    
    console.log(`✅ [PROCESS] Database connection test successful`);

    // Get job details
    console.log(`🔄 [PROCESS] Fetching job details from database...`);
    const { data: job, error: jobError } = await supabase
      .from('ai_matching_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError) {
      console.error(`❌ [PROCESS] Database error:`, jobError);
      return res.status(500).json({ error: 'Database error', details: jobError.message });
    }

    if (!job) {
      console.error(`❌ [PROCESS] Job not found: ${jobId}`);
      return res.status(404).json({ error: 'Job not found' });
    }

    console.log(`✅ [PROCESS] Job found:`, {
      id: job.id,
      filename: job.original_filename,
      status: job.status,
      matchingMethod: job.matching_method || 'hybrid'
    });

    // Check if job has input file
    if (!job.input_file_blob_url) {
      console.error(`❌ [PROCESS] No input file URL for job: ${jobId}`);
      return res.status(400).json({ error: 'No input file URL found' });
    }

    // Update job status helper function
    const updateJobStatus = async (status, progress, message, extraData = {}) => {
      console.log(`📊 [PROCESS] Status update: ${status} - ${progress}% - ${message}`);
      const { error: statusError } = await supabase
        .from('ai_matching_jobs')
        .update({
          status,
          progress,
          error_message: message,
          updated_at: new Date().toISOString(),
          ...extraData
        })
        .eq('id', jobId);

      if (statusError) {
        console.error(`❌ [PROCESS] Status update failed:`, statusError);
      }
    };

    // Start processing
    await updateJobStatus('processing', 5, 'Processing function started...');

    // Download file from Vercel Blob
    console.log(`📥 [PROCESS] Downloading file from Vercel Blob...`);
    console.log(`📥 [PROCESS] File URL: ${job.input_file_blob_url.substring(0, 100)}...`);
    
    let fileArrayBuffer;
    try {
      // Use fetch to download the file since it's already a public URL
      const response = await fetch(job.input_file_blob_url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      fileArrayBuffer = await response.arrayBuffer();
      console.log(`✅ [PROCESS] File downloaded, size: ${fileArrayBuffer.byteLength} bytes`);
    } catch (downloadError) {
      console.error(`❌ [PROCESS] File download failed:`, downloadError);
      throw new Error(`File download failed: ${downloadError.message}`);
    }

    // Save file to temp for processing
    const tempFilePath = path.default.join('/tmp', `job-${jobId}-${job.original_filename}`);
    console.log(`💾 [PROCESS] Saving file to: ${tempFilePath}`);
    
    const fileBuffer = Buffer.from(fileArrayBuffer);
    await fs.default.writeFile(tempFilePath, fileBuffer);
    console.log(`✅ [PROCESS] File saved to temp directory`);

    await updateJobStatus('processing', 10, 'File downloaded, parsing Excel...');

    // STEP 1: Parse Excel file
    console.log(`🔍 [PROCESS] Starting Excel parsing...`);
    const extractedItems = await parseExcelFile(tempFilePath, jobId, job.original_filename);
    console.log(`✅ [PROCESS] Extracted ${extractedItems.length} items from Excel`);

    if (extractedItems.length === 0) {
      throw new Error('No items with quantities found in the Excel file. Please check the file format.');
    }

    await updateJobStatus('processing', 15, `Found ${extractedItems.length} items to match`, {
      total_items: extractedItems.length,
      matched_items: 0
    });

    // STEP 2: Load price list from database
    console.log(`💰 [PROCESS] Loading price list from database...`);
    const priceList = await loadPriceListFromDatabase(supabase);
    console.log(`✅ [PROCESS] Loaded ${priceList.length} price items`);

    if (priceList.length === 0) {
      throw new Error('No price items found in database');
    }

    // STEP 3: Match items based on matching method
    console.log(`🔍 [PROCESS] Starting price matching with method: ${job.matching_method || 'hybrid'}`);
    
    let matchingResult;
    const matchingMethod = job.matching_method || 'hybrid';

    if (matchingMethod === 'local') {
      // Local fuzzy matching only
      await updateJobStatus('processing', 20, 'Starting local fuzzy matching...');
      matchingResult = await performLocalMatching(extractedItems, priceList, jobId, job.original_filename, updateJobStatus);
    } else if (matchingMethod === 'ai') {
      // AI matching only (OpenAI + Cohere)
      await updateJobStatus('processing', 20, 'Starting AI matching...');
      matchingResult = await performAIMatching(extractedItems, priceList, jobId, supabase, updateJobStatus);
    } else {
      // Hybrid matching (default)
      await updateJobStatus('processing', 20, 'Starting hybrid matching...');
      matchingResult = await performHybridMatching(extractedItems, priceList, jobId, supabase, updateJobStatus);
    }

    if (!matchingResult || !matchingResult.matches) {
      throw new Error('Matching process failed to return results');
    }

    console.log(`✅ [PROCESS] Matching completed: ${matchingResult.matches.length} matches found`);

    // STEP 4: Save matches to database
    console.log(`💾 [PROCESS] Saving matches to database...`);
    await updateJobStatus('processing', 85, 'Saving matches to database...');
    
    await saveMatchesToDatabase(supabase, matchingResult.matches, jobId, matchingMethod);

    // STEP 5: Generate output Excel file
    console.log(`📄 [PROCESS] Generating output Excel file...`);
    await updateJobStatus('processing', 90, 'Generating output file...');
    
    const outputPath = await generateOutputExcel(matchingResult.matches, jobId, job.original_filename, tempFilePath);
    console.log(`✅ [PROCESS] Output file generated: ${outputPath}`);

    // Update final status
    const avgConfidence = matchingResult.matches.length > 0 
      ? Math.round((matchingResult.matches.reduce((sum, m) => sum + (m.similarity_score || 0), 0) / matchingResult.matches.length) * 100)
      : 0;

    await updateJobStatus('completed', 100, 'Processing completed successfully', {
      matched_items: matchingResult.matches.length,
      total_items: extractedItems.length,
      confidence_score: avgConfidence,
      output_file_path: outputPath
    });

    // Clean up temp file
    try {
      await fs.default.remove(tempFilePath);
      console.log(`🧹 [PROCESS] Cleaned up temp file: ${tempFilePath}`);
    } catch (cleanupError) {
      console.warn(`⚠️ [PROCESS] Failed to clean up temp file:`, cleanupError);
    }

    const completionTime = Date.now();
    const totalTime = completionTime - startTime;
    console.log(`🎉 [PROCESS] Job ${jobId} processing completed in ${totalTime}ms`);
    console.log(`📊 [PROCESS] Final stats: ${matchingResult.matches.length}/${extractedItems.length} items matched (${avgConfidence}% avg confidence)`);
    
    res.json({ 
      success: true, 
      message: 'Processing completed successfully',
      jobId,
      processingTimeMs: totalTime,
      stats: {
        totalItems: extractedItems.length,
        matchedItems: matchingResult.matches.length,
        averageConfidence: avgConfidence,
        outputPath: outputPath
      }
    });

  } catch (error) {
    console.error(`❌ [PROCESS] Error processing job ${jobId}:`, error);
    console.error(`❌ [PROCESS] Error stack:`, error.stack);
    console.error(`❌ [PROCESS] Error name:`, error.name);
    console.error(`❌ [PROCESS] Error constructor:`, error.constructor.name);
    
    // Update job status to failed with better error details
    try {
      if (jobId && supabase) {
        await supabase
          .from('ai_matching_jobs')
          .update({
            status: 'failed',
            progress: 0,
            error_message: error.message,
            updated_at: new Date().toISOString()
          })
          .eq('id', jobId);
        console.log(`✅ [PROCESS] Job status updated to failed`);
      }
    } catch (updateError) {
      console.error(`❌ [PROCESS] Failed to update job status:`, updateError);
    }
    
    res.status(500).json({ 
      error: 'Processing failed',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// ===== HELPER FUNCTIONS =====

// Excel parsing function
async function parseExcelFile(filePath, jobId, originalFileName) {
  const XLSX = await import('xlsx');
  
  console.log(`🔍 [PARSE] Starting Excel parsing for: ${originalFileName}`);
  
  // Load workbook
  const workbook = XLSX.default.readFile(filePath);
  console.log(`📊 [PARSE] Found ${workbook.SheetNames.length} sheets:`, workbook.SheetNames);
  
  let allItems = [];
  
  // Process each sheet
  for (const sheetName of workbook.SheetNames) {
    try {
      console.log(`📋 [PARSE] Processing sheet: ${sheetName}`);
      const sheetItems = await processSheet(workbook, sheetName);
      
      // Filter items to only include those with quantities > 0
      const validItems = sheetItems.filter(item => {
        const hasQty = item.quantity && !isNaN(item.quantity) && parseFloat(item.quantity) > 0;
        const hasDesc = item.description && item.description.trim().length > 0;
        return hasQty && hasDesc;
      });
      
      console.log(`   📌 Valid items with quantities: ${validItems.length}`);
      allItems = allItems.concat(validItems);
      
    } catch (sheetError) {
      console.warn(`⚠️ [PARSE] Error processing sheet ${sheetName}:`, sheetError.message);
    }
  }
  
  console.log(`📈 [PARSE] Total items ready for matching: ${allItems.length}`);
  return allItems;
}

// Process single sheet
async function processSheet(workbook, sheetName) {
  const XLSX = await import('xlsx');
  
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.default.utils.sheet_to_json(worksheet, { header: 1, defval: null });
  
  if (!jsonData || jsonData.length === 0) {
    return [];
  }
  
  // Find header row and columns
  const headerInfo = findHeaders(jsonData);
  if (!headerInfo.found) {
    console.warn(`⚠️ [PARSE] Could not find clear headers in sheet ${sheetName}, trying fallback...`);
    const fallbackInfo = detectFallbackStructure(jsonData, sheetName);
    if (!fallbackInfo.found) {
      console.warn(`⚠️ [PARSE] Could not detect structure in sheet ${sheetName}`);
      return [];
    }
    Object.assign(headerInfo, fallbackInfo);
  }
  
  console.log(`   🎯 [PARSE] Headers found at row ${headerInfo.headerRow + 1}:`);
  console.log(`   - Description column: ${headerInfo.descriptionCol + 1}`);
  console.log(`   - Quantity column: ${headerInfo.quantityCol + 1}`);
  console.log(`   - Rate column: ${headerInfo.rateCol + 1 || 'Not found'}`);
  console.log(`   - Unit column: ${headerInfo.unitCol + 1 || 'Not found'}`);
  
  const items = [];
  let totalRows = 0;
  let skippedEmpty = 0;
  let skippedNoDesc = 0;
  let skippedNoQty = 0;
  let skippedByFilter = 0;
  
  // Process data rows
  for (let rowIndex = headerInfo.headerRow + 1; rowIndex < jsonData.length; rowIndex++) {
    const row = jsonData[rowIndex];
    if (!row || row.length === 0) {
      skippedEmpty++;
      continue;
    }
    
    totalRows++;
    
    const item = extractItemFromRow(row, headerInfo, rowIndex + 1, sheetName);
    
    if (item) {
      // DEBUG: Log first few items to verify we're reading the right data
      if (items.length < 3) {
        console.log(`   📝 [PARSE] Item ${items.length + 1}: "${item.description.substring(0, 50)}..." (Row ${item.row_number})`);
      }
      items.push(item);
    } else {
      // Count why items were skipped for debugging
      const description = extractDescription(row[headerInfo.descriptionCol]);
      const quantity = extractQuantity(row[headerInfo.quantityCol]);
      
      // DEBUG: Log what we're trying to extract
      if (skippedNoDesc < 3 || skippedNoQty < 3) {
        console.log(`   ⚠️ [PARSE] Skipped row ${rowIndex + 1}: desc="${row[headerInfo.descriptionCol]}", qty="${row[headerInfo.quantityCol]}"`);
      }
      
      if (!description) {
        skippedNoDesc++;
      } else if (!quantity || quantity <= 0) {
        skippedNoQty++;
      } else if (shouldSkipItem(description)) {
        skippedByFilter++;
      }
    }
  }
  
  console.log(`   📈 [PARSE] Parsing results for ${sheetName}:`);
  console.log(`      - Total data rows: ${totalRows}`);
  console.log(`      - Items extracted: ${items.length}`);
  console.log(`      - Skipped empty: ${skippedEmpty}`);
  console.log(`      - Skipped no description: ${skippedNoDesc}`);
  console.log(`      - Skipped no quantity: ${skippedNoQty}`);
  console.log(`      - Skipped by filter: ${skippedByFilter}`);
  
  return items;
}

// Find headers in Excel data - FULL LOCAL LOGIC
function findHeaders(jsonData) {
  let headerRow = -1;
  let descriptionCol = -1;
  let quantityCol = -1;
  let rateCol = -1;
  let unitCol = -1;
  
  // Look for headers in first 15 rows
  for (let rowIndex = 0; rowIndex < Math.min(15, jsonData.length); rowIndex++) {
    const row = jsonData[rowIndex];
    if (!row) continue;
    
    // First pass: Look for exact "Description" match (case-insensitive)
    let foundExactDescription = false;
    for (let colIndex = 0; colIndex < row.length; colIndex++) {
      const cellValue = String(row[colIndex] || '').trim();
      
      // Check for exact "Description" match first (highest priority)
      if (cellValue.toLowerCase() === 'description') {
        descriptionCol = colIndex;
        headerRow = rowIndex;
        foundExactDescription = true;
        console.log(`   ✅ [PARSE] Found exact "Description" header at row ${rowIndex + 1}, col ${colIndex + 1}`);
      }
    }
    
    // Second pass: Look for other headers
    for (let colIndex = 0; colIndex < row.length; colIndex++) {
      const cellValue = normalizeHeaderText(row[colIndex]);
      
      // Skip if we already found exact description column
      if (foundExactDescription && colIndex === descriptionCol) continue;
      
      // Description column patterns (only if we haven't found exact match)
      if (!foundExactDescription && isDescriptionHeader(cellValue)) {
        descriptionCol = colIndex;
        headerRow = rowIndex;
      }
      
      // Quantity column patterns
      else if (isQuantityHeader(cellValue)) {
        quantityCol = colIndex;
        if (headerRow === -1) headerRow = rowIndex;
      }
      
      // Rate/Price column patterns
      else if (isRateHeader(cellValue)) {
        rateCol = colIndex;
        if (headerRow === -1) headerRow = rowIndex;
      }
      
      // Unit column patterns
      else if (isUnitHeader(cellValue)) {
        unitCol = colIndex;
        if (headerRow === -1) headerRow = rowIndex;
      }
    }
    
    // If we found description and quantity, that's good enough
    if (descriptionCol >= 0 && quantityCol >= 0) {
      break;
    }
  }
  
  return {
    found: descriptionCol >= 0 && quantityCol >= 0,
    headerRow,
    descriptionCol,
    quantityCol,
    rateCol,
    unitCol
  };
}

// Normalize header text for comparison
function normalizeHeaderText(cellValue) {
  if (!cellValue) return '';
  return String(cellValue).toLowerCase().trim().replace(/[^a-z0-9]/g, '');
}

// Check if a header is a description column
function isDescriptionHeader(normalized) {
  // Exclude patterns that are definitely NOT description columns
  const excludePatterns = ['bill', 'billing', 'flag', 'flags', 'ref', 'reference', 'page', 'section', 'no', 'number', 'serial', 'sr'];
  if (excludePatterns.some(pattern => normalized === pattern || normalized.endsWith(pattern))) {
    return false;
  }
  
  const patterns = [
    'description', 'desc', 'item', 'itemdescription', 'workdescription',
    'particulars', 'work', 'activity', 'specification', 'details',
    'scope', 'scopeofwork', 'operation', 'task', 'descriptionofwork',
    'itemofwork', 'workitem', 'material', 'service', 'component',
    'element', 'descr', 'itemdesc', 'workdesc', 'particular'
  ];
  return patterns.some(pattern => normalized.includes(pattern));
}

// Check if a header is a quantity column
function isQuantityHeader(normalized) {
  const patterns = [
    'quantity', 'qty', 'quan', 'qnty', 'amount', 'volume', 'area',
    'length', 'nos', 'number', 'count', 'units', 'each', 'total',
    'sum', 'net', 'gross', 'quntity', 'qunatity', 'qnty', 'qtty',
    'no', 'num', 'nbr', 'pcs', 'pieces', 'meters', 'sqm', 'cum',
    'm2', 'm3', 'lm', 'kg', 'tons', 'tonnes', 'liters', 'gallons'
  ];
  return patterns.some(pattern => normalized.includes(pattern)) ||
         !!normalized.match(/^(qty|quan|qnty|no|nos|q|num|nbr|m|m2|m3)$/i);
}

// Check if a header is a rate/price column
function isRateHeader(normalized) {
  const patterns = [
    'rate', 'price', 'unitrate', 'unitprice', 'cost', 'unitcost',
    'rateper', 'priceperunit', 'costperunit'
  ];
  return patterns.some(pattern => normalized.includes(pattern));
}

// Check if a header is a unit column
function isUnitHeader(normalized) {
  const patterns = [
    'unit', 'uom', 'unitofmeasure', 'unitofmeasurement', 'measure',
    'measurement', 'units'
  ];
  return patterns.some(pattern => normalized.includes(pattern));
}

// Fallback structure detection - AGGRESSIVE MODE (from local)
function detectFallbackStructure(jsonData, sheetName) {
  console.log(`   🔍 [PARSE] Attempting AGGRESSIVE fallback structure detection for ${sheetName}`);
  
  // Try multiple strategies to find ANY structure
  
  // Strategy 1: Look for any column with meaningful text and any column with numbers
  for (let rowIndex = 0; rowIndex < Math.min(30, jsonData.length); rowIndex++) {
    const row = jsonData[rowIndex];
    if (!row || row.length < 2) continue;
    
    const columnInfo = [];
    
    // Analyze each column
    for (let colIndex = 0; colIndex < Math.min(15, row.length); colIndex++) {
      const cell = row[colIndex];
      if (!cell) continue;
      
      const cellStr = String(cell).trim();
      if (cellStr.length === 0) continue;
      
      // Enhanced text detection - exclude single numbers or very short text
      const hasText = isNaN(cellStr) && cellStr.length > 3 && 
                     !cellStr.match(/^[A-Z]$/) && // Not just single letter
                     !cellStr.match(/^\d+$/); // Not just numbers
      const hasNumber = !isNaN(cellStr) && parseFloat(cellStr) > 0;
      const hasMeaningfulText = hasText && 
                               (cellStr.split(' ').length > 1 || // Multiple words
                                cellStr.length > 10); // Or reasonably long single word
      
      columnInfo.push({
        index: colIndex,
        content: cellStr,
        hasText,
        hasNumber,
        hasMeaningfulText,
        length: cellStr.length
      });
    }
    
    // Find best text column (prefer meaningful text over short text)
    const textColumns = columnInfo.filter(col => col.hasMeaningfulText || (col.hasText && col.length > 5));
    const numberColumns = columnInfo.filter(col => col.hasNumber);
    
    if (textColumns.length > 0 && numberColumns.length > 0) {
      // Prefer columns with meaningful text (multiple words or longer text)
      const bestTextCol = textColumns.sort((a, b) => {
        // Prioritize meaningful text
        if (a.hasMeaningfulText && !b.hasMeaningfulText) return -1;
        if (!a.hasMeaningfulText && b.hasMeaningfulText) return 1;
        // Then by length
        return b.length - a.length;
      })[0];
      
      // For quantity, prefer columns that come after the description column
      const quantityColumns = numberColumns.filter(col => col.index > bestTextCol.index);
      const bestNumberCol = quantityColumns.length > 0 ? quantityColumns[0] : numberColumns[0];
      
      console.log(`   ✅ [PARSE] Aggressive Fallback: Found description at col ${bestTextCol.index + 1} ("${bestTextCol.content.substring(0, 30)}..."), quantity at col ${bestNumberCol.index + 1}`);
      return {
        found: true,
        headerRow: rowIndex > 2 ? rowIndex - 2 : 0,
        descriptionCol: bestTextCol.index,
        quantityCol: bestNumberCol.index,
        rateCol: numberColumns.length > 1 ? numberColumns[1].index : -1,
        unitCol: -1
      };
    }
  }
  
  // Strategy 2: Look for Description header explicitly before using last resort
  for (let rowIndex = 0; rowIndex < Math.min(15, jsonData.length); rowIndex++) {
    const row = jsonData[rowIndex];
    if (!row) continue;
    
    for (let colIndex = 0; colIndex < row.length; colIndex++) {
      const cellValue = String(row[colIndex] || '').trim();
      if (cellValue.toLowerCase() === 'description' || cellValue.toLowerCase() === 'desc') {
        console.log(`   ✅ [PARSE] Found Description header in fallback search at row ${rowIndex + 1}, col ${colIndex + 1}`);
        
        // Look for quantity column after description
        let quantityCol = -1;
        for (let qCol = colIndex + 1; qCol < row.length; qCol++) {
          const qCell = String(row[qCol] || '').trim().toLowerCase();
          if (qCell.includes('qty') || qCell.includes('quantity') || qCell === 'no' || qCell === 'nos') {
            quantityCol = qCol;
            break;
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
          };
        }
      }
    }
  }
  
  // LAST RESORT: Only if we really can't find headers
  if (jsonData.length > 5) {
    console.log(`   ⚠️ [PARSE] Using LAST RESORT fallback - WARNING: This may pick wrong columns!`);
    console.log(`   ⚠️ [PARSE] Please ensure your Excel has a 'Description' header`);
    return {
      found: true,
      headerRow: 0,
      descriptionCol: 0,
      quantityCol: 1,
      rateCol: jsonData[0] && jsonData[0].length > 2 ? 2 : -1,
      unitCol: -1
    };
  }
  
  return { found: false };
}

// Extract item from row - AGGRESSIVE MODE (from local)
function extractItemFromRow(row, headerInfo, rowNumber, sheetName) {
  // DEBUG: Log what we're extracting
  if (rowNumber <= headerInfo.headerRow + 3) {
    console.log(`   🔍 [PARSE] Row ${rowNumber}: Extracting from col ${headerInfo.descriptionCol + 1} = "${row[headerInfo.descriptionCol]}", col ${headerInfo.quantityCol + 1} = "${row[headerInfo.quantityCol]}"`);
  }
  
  const description = extractDescription(row[headerInfo.descriptionCol]);
  const quantity = extractQuantity(row[headerInfo.quantityCol]);
  const rate = headerInfo.rateCol >= 0 ? extractRate(row[headerInfo.rateCol]) : null;
  const unit = headerInfo.unitCol >= 0 ? extractUnit(row[headerInfo.unitCol]) : '';
  
  // AGGRESSIVE: Try to extract from ANY column if main columns fail
  let finalDescription = description;
  let finalQuantity = quantity;
  
  if (!finalDescription && row && row.length > 0) {
    console.log(`   ⚠️ [PARSE] No description found in designated column ${headerInfo.descriptionCol + 1}, searching other columns...`);
    // Look for description in any column with meaningful text
    for (let i = 0; i < row.length; i++) {
      if (i === headerInfo.quantityCol || i === headerInfo.rateCol) continue;
      const cellDesc = extractDescription(row[i]);
      if (cellDesc && cellDesc.length > 0) { // Even more lenient
        console.log(`   ✅ [PARSE] Found description in column ${i + 1}: "${cellDesc.substring(0, 30)}..."`);
        finalDescription = cellDesc;
        break;
      }
    }
  }
  
  if (!finalQuantity && row && row.length > 0) {
    // Look for quantity in any column after description column
    for (let i = headerInfo.descriptionCol + 1; i < row.length; i++) {
      const cellQty = extractQuantity(row[i]);
      if (cellQty && cellQty > 0) {
        finalQuantity = cellQty;
        break;
      }
    }
  }
  
  // MUCH MORE LENIENT: Only skip if absolutely no description or quantity
  if (!finalDescription || finalDescription.length < 1) {
    return null;
  }
  
  if (!finalQuantity || finalQuantity <= 0) {
    return null;
  }
  
  // Skip obvious non-items but be very selective
  if (shouldSkipItem(finalDescription)) {
    return null;
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
  };
  
  return itemData;
}

// Extract description from cell - LOCAL LOGIC
function extractDescription(cellValue) {
  if (!cellValue) return null;
  
  let desc = String(cellValue).trim();
  
  // CRITICAL: Reject pure numbers or very short numeric values
  if (desc.match(/^\d+$/) && desc.length <= 3) {
    console.log(`   ❌ [PARSE] Rejecting numeric-only description: "${desc}"`);
    return null;
  }
  
  // Also reject single letters
  if (desc.match(/^[A-Z]$/i)) {
    console.log(`   ❌ [PARSE] Rejecting single letter description: "${desc}"`);
    return null;
  }
  
  // Only remove very obvious prefixes, keep most content
  desc = desc.replace(/^(item\s*\d+[\.\-\:\s]*)/i, '');
  desc = desc.replace(/^(\d+[\.\-\:\s]+)/i, '');
  
  // Don't remove parentheses content - it might be important specifications
  
  return desc.trim();
}

// Extract quantity from cell - LOCAL LOGIC
function extractQuantity(cellValue) {
  if (!cellValue && cellValue !== 0) return null;
  
  // Handle different quantity formats
  let value = String(cellValue).trim();
  
  // Remove common quantity suffixes
  value = value.replace(/\s*(nos?|pcs?|pieces?|units?|each|ea)\.?$/i, '');
  value = value.replace(/\s*(m|m2|m3|sq\.?m|cu\.?m|lm|km|cm|mm)\.?$/i, '');
  value = value.replace(/\s*(kg|tons?|tonnes?|lbs?)\.?$/i, '');
  value = value.replace(/\s*(liters?|litres?|gallons?|gals?)\.?$/i, '');
  
  // Handle fractions
  if (value.includes('/')) {
    const parts = value.split('/');
    if (parts.length === 2) {
      const numerator = parseFloat(parts[0]);
      const denominator = parseFloat(parts[1]);
      if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
        return numerator / denominator;
      }
    }
  }
  
  // Handle comma as decimal separator
  if (value.includes(',') && !value.includes('.')) {
    value = value.replace(',', '.');
  }
  
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
}

// Extract rate from cell
function extractRate(cellValue) {
  if (!cellValue && cellValue !== 0) return null;
  
  let value = String(cellValue).trim();
  
  // Remove currency symbols
  value = value.replace(/[$£€¥₹₨]/g, '');
  value = value.replace(/[,\s]/g, '');
  
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
}

// Extract unit from cell
function extractUnit(cellValue) {
  if (!cellValue) return '';
  return String(cellValue).trim();
}

// Check if item should be skipped
function shouldSkipItem(description) {
  if (!description) return true;
  
  const desc = description.toLowerCase().trim();
  
  // Skip very obvious non-items
  const skipPatterns = [
    /^(total|sub[\s-]?total|grand[\s-]?total)/,
    /^(page|sheet|section)/,
    /^(note|notes?|remark)/,
    /^(continue|continued)/,
    /^(carried[\s-]?forward|c\/f|b\/f|brought[\s-]?forward)/,
    /^(sum|summary)/,
    /^(\s*[\-\=\_\+]+\s*)$/, // Lines made of symbols
    /^(provisional|contingency|daywork)$/
  ];
  
  return skipPatterns.some(pattern => pattern.test(desc));
}

// Load price list from Supabase
async function loadPriceListFromDatabase(supabase) {
  console.log(`💰 [PRICE] Loading price list from database...`);
  
  const { data: priceItems, error } = await supabase
    .from('price_items')
    .select('*')
    .order('description');
  
  if (error) {
    console.error(`❌ [PRICE] Error loading price list:`, error);
    throw new Error(`Failed to load price list: ${error.message}`);
  }
  
  console.log(`✅ [PRICE] Loaded ${priceItems.length} price items`);
  return priceItems;
}

// Local fuzzy matching
async function performLocalMatching(items, priceList, jobId, originalFileName, updateJobStatus) {
  console.log(`🔍 [LOCAL] Starting local fuzzy matching for ${items.length} items...`);
  
  const Fuse = await import('fuse.js');
  const { v4: uuidv4 } = await import('uuid');
  
  // Create Fuse.js search index
  const fuse = new Fuse.default(priceList, {
    keys: ['description', 'full_context'],
    threshold: 0.6, // Less strict threshold
    includeScore: true,
    minMatchCharLength: 3
  });
  
  const matches = [];
  let matchedCount = 0;
  let totalConfidence = 0;
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    
    // Update progress every 10 items
    if (i % 10 === 0) {
      const progress = 25 + Math.round((i / items.length) * 50); // 25-75%
      await updateJobStatus('processing', progress, `Local matching: ${i}/${items.length} items...`);
    }
    
    // Search for matches
    const searchResults = fuse.search(item.description);
    
    if (searchResults.length > 0) {
      const bestMatch = searchResults[0];
      const confidence = Math.max(0.01, 1 - bestMatch.score); // Convert Fuse score to confidence
      
      const matchResult = {
        id: `match_${jobId}_${i}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        original_description: item.description,
        matched_description: bestMatch.item.description || bestMatch.item.full_context,
        matched_rate: bestMatch.item.rate,
        similarity_score: confidence,
        row_number: item.row_number,
        sheet_name: item.sheet_name,
        quantity: item.quantity,
        unit: bestMatch.item.unit || '',
        total_amount: item.quantity * bestMatch.item.rate,
        matched_price_item_id: bestMatch.item.id,
        match_method: 'local',
        section_header: item.section_header || null
      };
      
      matches.push(matchResult);
      matchedCount++;
      totalConfidence += confidence;
    }
  }
  
  const avgConfidence = matchedCount > 0 ? (totalConfidence / matchedCount) : 0;
  
  console.log(`✅ [LOCAL] Matching complete: ${matchedCount}/${items.length} items matched (${Math.round(avgConfidence * 100)}% avg confidence)`);
  
  return {
    matches,
    method: 'local',
    stats: {
      totalItems: items.length,
      matchedItems: matchedCount,
      averageConfidence: avgConfidence
    }
  };
}

// AI matching (placeholder - would need OpenAI/Cohere API keys)
async function performAIMatching(items, priceList, jobId, supabase, updateJobStatus) {
  console.log(`🤖 [AI] AI matching not implemented in Vercel function yet - falling back to local matching`);
  return await performLocalMatching(items, priceList, jobId, 'ai-fallback', updateJobStatus);
}

// Hybrid matching
async function performHybridMatching(items, priceList, jobId, supabase, updateJobStatus) {
  console.log(`🔀 [HYBRID] Hybrid matching - using local matching for now`);
  return await performLocalMatching(items, priceList, jobId, 'hybrid', updateJobStatus);
}

// Save matches to database
async function saveMatchesToDatabase(supabase, matches, jobId, matchMethod) {
  console.log(`💾 [SAVE] Saving ${matches.length} matches to database...`);
  
  if (matches.length === 0) {
    console.log(`⚠️ [SAVE] No matches to save`);
    return;
  }
  
  // Prepare match data for database
  const matchData = matches.map(match => ({
    job_id: jobId,
    original_description: match.original_description,
    matched_description: match.matched_description,
    matched_rate: match.matched_rate,
    similarity_score: match.similarity_score,
    row_number: match.row_number,
    sheet_name: match.sheet_name,
    quantity: match.quantity,
    unit: match.unit,
    total_amount: match.total_amount,
    matched_price_item_id: match.matched_price_item_id,
    match_method: matchMethod,
    section_header: match.section_header,
    created_at: new Date().toISOString()
  }));
  
  // Insert in batches to avoid timeout
  const batchSize = 100;
  for (let i = 0; i < matchData.length; i += batchSize) {
    const batch = matchData.slice(i, i + batchSize);
    
    const { error } = await supabase
      .from('match_results')
      .insert(batch);
    
    if (error) {
      console.error(`❌ [SAVE] Error saving batch ${i}-${i + batch.length}:`, error);
      throw new Error(`Failed to save matches: ${error.message}`);
    }
    
    console.log(`✅ [SAVE] Saved batch ${i + 1}-${i + batch.length}/${matchData.length}`);
  }
  
  console.log(`✅ [SAVE] All matches saved to database`);
}

// Generate output Excel file
async function generateOutputExcel(matches, jobId, originalFileName, originalFilePath) {
  console.log(`📄 [EXPORT] Generating output Excel file...`);
  
  const ExcelJS = await import('exceljs');
  const path = await import('path');
  
  // Create new workbook
  const workbook = new ExcelJS.default.Workbook();
  const worksheet = workbook.addWorksheet('Matched Results');
  
  // Define headers
  const headers = [
    'Original Description',
    'Matched Description',
    'Rate',
    'Quantity',
    'Unit',
    'Total Amount',
    'Confidence %',
    'Row Number',
    'Sheet Name'
  ];
  
  // Add headers
  const headerRow = worksheet.addRow(headers);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'CCE5FF' }
  };
  
  // Add data rows
  matches.forEach(match => {
    worksheet.addRow([
      match.original_description,
      match.matched_description,
      match.matched_rate,
      match.quantity,
      match.unit,
      match.total_amount,
      Math.round((match.similarity_score || 0) * 100),
      match.row_number,
      match.sheet_name
    ]);
  });
  
  // Auto-size columns
  worksheet.columns.forEach(column => {
    column.width = 20;
  });
  
  // Save to temp file
  const outputFileName = `matched-${jobId}-${originalFileName}`;
  const outputPath = path.default.join('/tmp', outputFileName);
  
  await workbook.xlsx.writeFile(outputPath);
  
  console.log(`✅ [EXPORT] Output file saved: ${outputPath}`);
  return outputPath;
} 