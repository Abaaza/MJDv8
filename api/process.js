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
  
  const items = [];
  
  // Process data rows
  for (let rowIndex = headerInfo.headerRow + 1; rowIndex < jsonData.length; rowIndex++) {
    const row = jsonData[rowIndex];
    if (!row || row.length === 0) continue;
    
    const item = extractItemFromRow(row, headerInfo, rowIndex + 1, sheetName);
    if (item) {
      items.push(item);
    }
  }
  
  return items;
}

// Find headers in Excel data
function findHeaders(jsonData) {
  const commonDescHeaders = ['description', 'desc', 'item', 'work', 'activity', 'task'];
  const commonQtyHeaders = ['quantity', 'qty', 'amount', 'number', 'no'];
  
  for (let rowIndex = 0; rowIndex < Math.min(5, jsonData.length); rowIndex++) {
    const row = jsonData[rowIndex];
    if (!row) continue;
    
    let descriptionCol = -1;
    let quantityCol = -1;
    
    for (let colIndex = 0; colIndex < row.length; colIndex++) {
      const cellValue = String(row[colIndex] || '').toLowerCase().trim();
      
      if (descriptionCol === -1 && commonDescHeaders.some(header => cellValue.includes(header))) {
        descriptionCol = colIndex;
      }
      
      if (quantityCol === -1 && commonQtyHeaders.some(header => cellValue.includes(header))) {
        quantityCol = colIndex;
      }
    }
    
    if (descriptionCol !== -1 && quantityCol !== -1) {
      return {
        found: true,
        headerRow: rowIndex,
        descriptionCol,
        quantityCol,
        rateCol: -1,
        unitCol: -1
      };
    }
  }
  
  return { found: false };
}

// Fallback structure detection
function detectFallbackStructure(jsonData, sheetName) {
  // Assume first column is description, second is quantity
  console.log(`🔍 [PARSE] Using fallback: assuming column 1=description, column 2=quantity`);
  
  return {
    found: true,
    headerRow: 0,
    descriptionCol: 0,
    quantityCol: 1,
    rateCol: -1,
    unitCol: -1
  };
}

// Extract item from row
function extractItemFromRow(row, headerInfo, rowNumber, sheetName) {
  const description = extractDescription(row[headerInfo.descriptionCol]);
  const quantity = extractQuantity(row[headerInfo.quantityCol]);
  
  if (!description || !quantity || quantity <= 0) {
    return null;
  }
  
  return {
    description: description.trim(),
    quantity: quantity,
    row_number: rowNumber,
    sheet_name: sheetName,
    unit: '',
    section_header: null
  };
}

// Extract description from cell
function extractDescription(cellValue) {
  if (!cellValue) return null;
  
  const desc = String(cellValue).trim();
  
  // Filter out obvious non-descriptions
  if (desc.length < 5 || desc.length > 500) return null;
  if (/^[\d\.\,\s]+$/.test(desc)) return null; // Just numbers
  if (/^[A-Z]{1,5}\d+$/.test(desc)) return null; // Just codes like "A123"
  
  return desc;
}

// Extract quantity from cell
function extractQuantity(cellValue) {
  if (!cellValue) return null;
  
  const num = parseFloat(cellValue);
  return isNaN(num) ? null : num;
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