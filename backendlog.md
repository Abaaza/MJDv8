🔄 [COHERE] Updating progress: batch 42/44 = 95% of embedding phase
📊 [COHERE WRAPPER] 95% → 49% | Cohere: Computing embeddings batch 42/44 (4032/4145 items)
🔄 [DATABASE] ENTERING updateJobStatus for job b89982fc-38d6-4df9-8ea3-597bf408631b: status=processing, progress=49
🔄 [DATABASE] Message: Cohere: Cohere: Computing embeddings batch 42/44 (4032/4145 items)
🔄 [DATABASE] Current job status before update: {
  status: 'processing',
  progress: 49,
  updated_at: '2025-06-27T23:25:27.279014+00:00'
}
🔄 [DATABASE] *** COHERE PROGRESS UPDATE *** 49%: Cohere: Cohere: Computing embeddings batch 42/44 (4032/4145 items)
🔄 [DATABASE] Attempting to update job b89982fc-38d6-4df9-8ea3-597bf408631b with data: {
  "status": "processing",
  "updated_at": "2025-06-27T23:25:28.308Z",
  "progress": 49,
  "error_message": "Cohere: Cohere: Computing embeddings batch 42/44 (4032/4145 items)"
}
✅ [DATABASE] Successfully updated job b89982fc-38d6-4df9-8ea3-597bf408631b: processing 49% - "Cohere: Cohere: Computing embeddings batch 42/44 (4032/4145 items)"
✅ [DATABASE] Progress message saved: Cohere: Cohere: Computing embeddings batch 42/44 (4032/4145 items)
❌ [COHERE EMBEDDING] Failed to update progress for batch 42/44
📊 [COHERE] Progress: 95% (4032/4145 items)
🔄 [COHERE] Processing embedding batch 43/44 (96 items)
✅ [COHERE] Got embeddings for batch 43, storing...
🔄 [COHERE] Updating progress: batch 43/44 = 98% of embedding phase
📊 [COHERE WRAPPER] 98% → 50% | Cohere: Computing embeddings batch 43/44 (4128/4145 items)
🔄 [DATABASE] ENTERING updateJobStatus for job b89982fc-38d6-4df9-8ea3-597bf408631b: status=processing, progress=50
🔄 [DATABASE] Message: Cohere: Cohere: Computing embeddings batch 43/44 (4128/4145 items)
🔄 [DATABASE] Current job status before update: {
  status: 'processing',
  progress: 49,
  updated_at: '2025-06-27T23:25:29.17182+00:00'
}
🔄 [DATABASE] *** COHERE PROGRESS UPDATE *** 50%: Cohere: Cohere: Computing embeddings batch 43/44 (4128/4145 items)
🔄 [DATABASE] Attempting to update job b89982fc-38d6-4df9-8ea3-597bf408631b with data: {
  "status": "processing",
  "updated_at": "2025-06-27T23:25:30.096Z",
  "progress": 50,
  "error_message": "Cohere: Cohere: Computing embeddings batch 43/44 (4128/4145 items)"
}
✅ [DATABASE] Successfully updated job b89982fc-38d6-4df9-8ea3-597bf408631b: processing 50% - "Cohere: Cohere: Computing embeddings batch 43/44 (4128/4145 items)"
✅ [DATABASE] Progress message saved: Cohere: Cohere: Computing embeddings batch 43/44 (4128/4145 items)
❌ [COHERE EMBEDDING] Failed to update progress for batch 43/44
📊 [COHERE] Progress: 98% (4128/4145 items)
🔄 [COHERE] Processing embedding batch 44/44 (17 items)
✅ [COHERE] Got embeddings for batch 44, storing...
🔄 [COHERE] Updating progress: batch 44/44 = 100% of embedding phase
📊 [COHERE WRAPPER] 100% → 50% | Cohere: Computing embeddings batch 44/44 (4145/4145 items)
🔄 [DATABASE] ENTERING updateJobStatus for job b89982fc-38d6-4df9-8ea3-597bf408631b: status=processing, progress=50
🔄 [DATABASE] Message: Cohere: Cohere: Computing embeddings batch 44/44 (4145/4145 items)
🔄 [DATABASE] Current job status before update: {
  status: 'processing',
  progress: 50,
  updated_at: '2025-06-27T23:25:30.97307+00:00'
}
🔄 [DATABASE] *** COHERE PROGRESS UPDATE *** 50%: Cohere: Cohere: Computing embeddings batch 44/44 (4145/4145 items)
🔄 [DATABASE] Attempting to update job b89982fc-38d6-4df9-8ea3-597bf408631b with data: {
  "status": "processing",
  "updated_at": "2025-06-27T23:25:31.195Z",
  "progress": 50,
  "error_message": "Cohere: Cohere: Computing embeddings batch 44/44 (4145/4145 items)"
}
✅ [DATABASE] Successfully updated job b89982fc-38d6-4df9-8ea3-597bf408631b: processing 50% - "Cohere: Cohere: Computing embeddings batch 44/44 (4145/4145 items)"
✅ [DATABASE] Progress message saved: Cohere: Cohere: Computing embeddings batch 44/44 (4145/4145 items)
❌ [COHERE EMBEDDING] Failed to update progress for batch 44/44
📊 [COHERE] Progress: 100% (4145/4145 items)
✅ [COHERE] Pre-computed 4145 embeddings in 86.7s
📊 [COHERE] Final stats: 4145 embeddings, 67 categories
✅ Cohere embeddings completed in 86.8s
🛡️ [PROGRESS] Blocking backward progress: 50% <= 50%
🔄 [DATABASE] ENTERING updateJobStatus for job b89982fc-38d6-4df9-8ea3-597bf408631b: status=processing, progress=55
🔄 [DATABASE] Message: AI embeddings ready, starting matching...
🔄 [DATABASE] Current job status before update: {
  status: 'processing',
  progress: 50,
  updated_at: '2025-06-27T23:25:32.056234+00:00'
}
🔄 [DATABASE] Attempting to update job b89982fc-38d6-4df9-8ea3-597bf408631b with data: {
  "status": "processing",
  "updated_at": "2025-06-27T23:25:31.918Z",
  "progress": 55,
  "error_message": "AI embeddings ready, starting matching..."
}
✅ [DATABASE] Successfully updated job b89982fc-38d6-4df9-8ea3-597bf408631b: processing 55% - "AI embeddings ready, starting matching..."
🔄 Running parallel AI matching...
🤖 [OPENAI] Starting embedding-based matching for 523 items
🚀 Starting Ultra-Fast Cohere Embedding Matching
   - Items to match: 523
   - Price list items: 4145
⚡ [COHERE] Pre-computing embeddings for 4145 price items...
[COHERE DEBUG] First 3 price items: [
  {
    id: 'ad6858fe-1425-4dea-b150-3bbf46d93f5c',
    description: 'CORDLESS CIRCULAR SAW...',
    rate: 3.67,
    category: 'Dayworks'
  },
  {
    id: '16596f6f-184a-4840-8aae-f84de431c2ea',
    description: 'EO twin wall for joints in panel; both faces; comp...',
    rate: 10.5,
    category: 'Concrete'
  },
  {
    id: '7b73d46a-f562-4dc9-b576-50d066e946ba',
    description: 'Steproc retaining wall; mm thk...',
    rate: 0,
    category: 'External Works'
  }
]
✅ [COHERE] Client initialized successfully
📊 [COHERE] Will process 44 batches of 96 items each
🔄 [COHERE] Processing embedding batch 1/44 (96 items)
✅ [COHERE] Got embeddings for batch 1, storing...
🔄 [COHERE] Updating progress: batch 1/44 = 2% of embedding phase
❌ [COHERE EMBEDDING] Failed to update progress for batch 1/44
📊 [COHERE] Progress: 2% (96/4145 items)
🔄 [COHERE] Processing embedding batch 2/44 (96 items)
❌ [OPENAI] Error generating embeddings: Error: OpenAI API error: You exceeded your current quota, please check your plan and billing details. For more information on this error, read the docs: https://platform.openai.com/docs/guides/error-codes/api-errors.
    at OpenAIEmbeddingService.generateEmbeddings (file:///C:/Users/abaza/OneDrive/Desktop/MJDv8/server/services/OpenAIEmbeddingService.js:37:15)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async OpenAIEmbeddingService.matchItems (file:///C:/Users/abaza/OneDrive/Desktop/MJDv8/server/services/OpenAIEmbeddingService.js:137:31)
    at async Promise.all (index 1)
    at async PriceMatchingService.performHybridAIMatching (file:///C:/Users/abaza/OneDrive/Desktop/MJDv8/server/services/PriceMatchingService.js:1027:42)
    at async PriceMatchingService.processFile (file:///C:/Users/abaza/OneDrive/Desktop/MJDv8/server/services/PriceMatchingService.js:354:30)
    at async file:///C:/Users/abaza/OneDrive/Desktop/MJDv8/server/routes/priceMatching.js:312:22
❌ [OPENAI] Error processing batch: Error: OpenAI API error: You exceeded your current quota, please check your plan and billing details. For more information on this error, read the docs: https://platform.openai.com/docs/guides/error-codes/api-errors.
    at OpenAIEmbeddingService.generateEmbeddings (file:///C:/Users/abaza/OneDrive/Desktop/MJDv8/server/services/OpenAIEmbeddingService.js:37:15)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async OpenAIEmbeddingService.matchItems (file:///C:/Users/abaza/OneDrive/Desktop/MJDv8/server/services/OpenAIEmbeddingService.js:137:31)
    at async Promise.all (index 1)
    at async PriceMatchingService.performHybridAIMatching (file:///C:/Users/abaza/OneDrive/Desktop/MJDv8/server/services/PriceMatchingService.js:1027:42)
    at async PriceMatchingService.processFile (file:///C:/Users/abaza/OneDrive/Desktop/MJDv8/server/services/PriceMatchingService.js:354:30)
    at async file:///C:/Users/abaza/OneDrive/Desktop/MJDv8/server/routes/priceMatching.js:312:22
✅ [COHERE] Got embeddings for batch 2, storing...
🔄 [COHERE] Updating progress: batch 2/44 = 5% of embedding phase
🔄 [DATABASE] ENTERING updateJobStatus for job b89982fc-38d6-4df9-8ea3-597bf408631b: status=processing, progress=56
🔄 [DATABASE] Message: Matching items... (0 matches found)
❌ [OPENAI] Error generating embeddings: Error: OpenAI API error: You exceeded your current quota, please check your plan and billing details. For more information on this error, read the docs: https://platform.openai.com/docs/guides/error-codes/api-errors.
    at OpenAIEmbeddingService.generateEmbeddings (file:///C:/Users/abaza/OneDrive/Desktop/MJDv8/server/services/OpenAIEmbeddingService.js:37:15)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async OpenAIEmbeddingService.matchItems (file:///C:/Users/abaza/OneDrive/Desktop/MJDv8/server/services/OpenAIEmbeddingService.js:137:31)
    at async Promise.all (index 1)
    at async PriceMatchingService.performHybridAIMatching (file:///C:/Users/abaza/OneDrive/Desktop/MJDv8/server/services/PriceMatchingService.js:1027:42)
    at async PriceMatchingService.processFile (file:///C:/Users/abaza/OneDrive/Desktop/MJDv8/server/services/PriceMatchingService.js:354:30)
    at async file:///C:/Users/abaza/OneDrive/Desktop/MJDv8/server/routes/priceMatching.js:312:22
❌ [OPENAI] Error processing batch: Error: OpenAI API error: You exceeded your current quota, please check your plan and billing details. For more information on this error, read the docs: https://platform.openai.com/docs/guides/error-codes/api-errors.
    at OpenAIEmbeddingService.generateEmbeddings (file:///C:/Users/abaza/OneDrive/Desktop/MJDv8/server/services/OpenAIEmbeddingService.js:37:15)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async OpenAIEmbeddingService.matchItems (file:///C:/Users/abaza/OneDrive/Desktop/MJDv8/server/services/OpenAIEmbeddingService.js:137:31)
    at async Promise.all (index 1)
    at async PriceMatchingService.performHybridAIMatching (file:///C:/Users/abaza/OneDrive/Desktop/MJDv8/server/services/PriceMatchingService.js:1027:42)
    at async PriceMatchingService.processFile (file:///C:/Users/abaza/OneDrive/Desktop/MJDv8/server/services/PriceMatchingService.js:354:30)
    at async file:///C:/Users/abaza/OneDrive/Desktop/MJDv8/server/routes/priceMatching.js:312:22
✅ [OPENAI] Matching completed in 3349ms
📊 [OPENAI] Results: 0/523 matched (0.0% avg confidence)
🔄 [DATABASE] Current job status before update: {
  status: 'processing',
  progress: 55,
  updated_at: '2025-06-27T23:25:32.779691+00:00'
}
🔄 [DATABASE] Attempting to update job b89982fc-38d6-4df9-8ea3-597bf408631b with data: {
  "status": "processing",
  "updated_at": "2025-06-27T23:25:35.686Z",
  "progress": 56,
  "error_message": "Matching items... (0 matches found)",
  "matched_items": 0,
  "total_items": 0
}
✅ [DATABASE] Successfully updated job b89982fc-38d6-4df9-8ea3-597bf408631b: processing 56% - "Matching items... (0 matches found)"
❌ [COHERE EMBEDDING] Failed to update progress for batch 2/44
📊 [COHERE] Progress: 5% (192/4145 items)
🔄 [COHERE] Processing embedding batch 3/44 (96 items)
✅ [COHERE] Got embeddings for batch 3, storing...
🔄 [COHERE] Updating progress: batch 3/44 = 7% of embedding phase
❌ [COHERE EMBEDDING] Failed to update progress for batch 3/44
📊 [COHERE] Progress: 7% (288/4145 items)
🔄 [COHERE] Processing embedding batch 4/44 (96 items)
✅ [COHERE] Got embeddings for batch 4, storing...
🔄 [COHERE] Updating progress: batch 4/44 = 9% of embedding phase
❌ [COHERE EMBEDDING] Failed to update progress for batch 4/44
📊 [COHERE] Progress: 9% (384/4145 items)
🔄 [COHERE] Processing embedding batch 5/44 (96 items)
✅ [COHERE] Got embeddings for batch 5, storing...
🔄 [COHERE] Updating progress: batch 5/44 = 11% of embedding phase
🔄 [DATABASE] ENTERING updateJobStatus for job b89982fc-38d6-4df9-8ea3-597bf408631b: status=processing, progress=57
🔄 [DATABASE] Message: Matching items... (0 matches found)
🔄 [DATABASE] Current job status before update: {
  status: 'processing',
  progress: 56,
  updated_at: '2025-06-27T23:25:36.54613+00:00'
}
🔄 [DATABASE] Attempting to update job b89982fc-38d6-4df9-8ea3-597bf408631b with data: {
  "status": "processing",
  "updated_at": "2025-06-27T23:25:40.068Z",
  "progress": 57,
  "error_message": "Matching items... (0 matches found)",
  "matched_items": 0,
  "total_items": 0
}
✅ [DATABASE] Successfully updated job b89982fc-38d6-4df9-8ea3-597bf408631b: processing 57% - "Matching items... (0 matches found)"
❌ [COHERE EMBEDDING] Failed to update progress for batch 5/44
📊 [COHERE] Progress: 11% (480/4145 items)
🔄 [COHERE] Processing embedding batch 6/44 (96 items)
✅ [COHERE] Got embeddings for batch 6, storing...
🔄 [COHERE] Updating progress: batch 6/44 = 14% of embedding phase
❌ [COHERE EMBEDDING] Failed to update progress for batch 6/44
📊 [COHERE] Progress: 14% (576/4145 items)
🔄 [COHERE] Processing embedding batch 7/44 (96 items)
✅ [COHERE] Got embeddings for batch 7, storing...
🔄 [COHERE] Updating progress: batch 7/44 = 16% of embedding phase
❌ [COHERE EMBEDDING] Failed to update progress for batch 7/44
📊 [COHERE] Progress: 16% (672/4145 items)
🔄 [COHERE] Processing embedding batch 8/44 (96 items)
✅ [COHERE] Got embeddings for batch 8, storing...
🔄 [COHERE] Updating progress: batch 8/44 = 18% of embedding phase
🔄 [DATABASE] ENTERING updateJobStatus for job b89982fc-38d6-4df9-8ea3-597bf408631b: status=processing, progress=58
🔄 [DATABASE] Message: Matching items... (0 matches found)
🔄 [DATABASE] Current job status before update: {
  status: 'processing',
  progress: 57,
  updated_at: '2025-06-27T23:25:40.926038+00:00'
}
🔄 [DATABASE] Attempting to update job b89982fc-38d6-4df9-8ea3-597bf408631b with data: {
  "status": "processing",
  "updated_at": "2025-06-27T23:25:44.609Z",
  "progress": 58,
  "error_message": "Matching items... (0 matches found)",
  "matched_items": 0,
  "total_items": 0
}
✅ [DATABASE] Successfully updated job b89982fc-38d6-4df9-8ea3-597bf408631b: processing 58% - "Matching items... (0 matches found)"
❌ [COHERE EMBEDDING] Failed to update progress for batch 8/44
📊 [COHERE] Progress: 18% (768/4145 items)
🔄 [COHERE] Processing embedding batch 9/44 (96 items)
✅ [COHERE] Got embeddings for batch 9, storing...
🔄 [COHERE] Updating progress: batch 9/44 = 20% of embedding phase
❌ [COHERE EMBEDDING] Failed to update progress for batch 9/44
📊 [COHERE] Progress: 20% (864/4145 items)
🔄 [COHERE] Processing embedding batch 10/44 (96 items)
✅ [COHERE] Got embeddings for batch 10, storing...
🔄 [COHERE] Updating progress: batch 10/44 = 23% of embedding phase
❌ [COHERE EMBEDDING] Failed to update progress for batch 10/44
📊 [COHERE] Progress: 23% (960/4145 items)
🔄 [COHERE] Processing embedding batch 11/44 (96 items)
✅ [COHERE] Got embeddings for batch 11, storing...
🔄 [COHERE] Updating progress: batch 11/44 = 25% of embedding phase
🔄 [DATABASE] ENTERING updateJobStatus for job b89982fc-38d6-4df9-8ea3-597bf408631b: status=processing, progress=59
🔄 [DATABASE] Message: Matching items... (0 matches found)
🔄 [DATABASE] Current job status before update: {
  status: 'processing',
  progress: 58,
  updated_at: '2025-06-27T23:25:45.467846+00:00'
}
🔄 [DATABASE] Attempting to update job b89982fc-38d6-4df9-8ea3-597bf408631b with data: {
  "status": "processing",
  "updated_at": "2025-06-27T23:25:49.077Z",
  "progress": 59,
  "error_message": "Matching items... (0 matches found)",
  "matched_items": 0,
  "total_items": 0
}
✅ [DATABASE] Successfully updated job b89982fc-38d6-4df9-8ea3-597bf408631b: processing 59% - "Matching items... (0 matches found)"
❌ [COHERE EMBEDDING] Failed to update progress for batch 11/44
📊 [COHERE] Progress: 25% (1056/4145 items)
🔄 [COHERE] Processing embedding batch 12/44 (96 items)
✅ [COHERE] Got embeddings for batch 12, storing...
🔄 [COHERE] Updating progress: batch 12/44 = 27% of embedding phase
❌ [COHERE EMBEDDING] Failed to update progress for batch 12/44
📊 [COHERE] Progress: 27% (1152/4145 items)
🔄 [COHERE] Processing embedding batch 13/44 (96 items)
✅ [COHERE] Got embeddings for batch 13, storing...
🔄 [COHERE] Updating progress: batch 13/44 = 30% of embedding phase
🔄 [DATABASE] ENTERING updateJobStatus for job b89982fc-38d6-4df9-8ea3-597bf408631b: status=processing, progress=60
🔄 [DATABASE] Message: Matching items... (0 matches found)
🔄 [DATABASE] Current job status before update: {
  status: 'processing',
  progress: 59,
  updated_at: '2025-06-27T23:25:49.93961+00:00'
}
🔄 [DATABASE] Attempting to update job b89982fc-38d6-4df9-8ea3-597bf408631b with data: {
  "status": "processing",
  "updated_at": "2025-06-27T23:25:52.232Z",
  "progress": 60,
  "error_message": "Matching items... (0 matches found)",
  "matched_items": 0,
  "total_items": 0
}
✅ [DATABASE] Successfully updated job b89982fc-38d6-4df9-8ea3-597bf408631b: processing 60% - "Matching items... (0 matches found)"
❌ [COHERE EMBEDDING] Failed to update progress for batch 13/44
📊 [COHERE] Progress: 30% (1248/4145 items)
🔄 [COHERE] Processing embedding batch 14/44 (96 items)
✅ [COHERE] Got embeddings for batch 14, storing...
🔄 [COHERE] Updating progress: batch 14/44 = 32% of embedding phase
❌ [COHERE EMBEDDING] Failed to update progress for batch 14/44
📊 [COHERE] Progress: 32% (1344/4145 items)
🔄 [COHERE] Processing embedding batch 15/44 (96 items)
✅ [COHERE] Got embeddings for batch 15, storing...
🔄 [COHERE] Updating progress: batch 15/44 = 34% of embedding phase
❌ [COHERE EMBEDDING] Failed to update progress for batch 15/44
📊 [COHERE] Progress: 34% (1440/4145 items)
🔄 [COHERE] Processing embedding batch 16/44 (96 items)
✅ [COHERE] Got embeddings for batch 16, storing...
🔄 [COHERE] Updating progress: batch 16/44 = 36% of embedding phase
❌ [COHERE EMBEDDING] Failed to update progress for batch 16/44
📊 [COHERE] Progress: 36% (1536/4145 items)
🔄 [COHERE] Processing embedding batch 17/44 (96 items)
✅ [COHERE] Got embeddings for batch 17, storing...
🔄 [COHERE] Updating progress: batch 17/44 = 39% of embedding phase
🔄 [DATABASE] ENTERING updateJobStatus for job b89982fc-38d6-4df9-8ea3-597bf408631b: status=processing, progress=61
🔄 [DATABASE] Message: Matching items... (0 matches found)
🔄 [DATABASE] Current job status before update: {
  status: 'processing',
  progress: 60,
  updated_at: '2025-06-27T23:25:53.122221+00:00'
}
🔄 [DATABASE] Attempting to update job b89982fc-38d6-4df9-8ea3-597bf408631b with data: {
  "status": "processing",
  "updated_at": "2025-06-27T23:25:58.345Z",
  "progress": 61,
  "error_message": "Matching items... (0 matches found)",
  "matched_items": 0,
  "total_items": 0
}
✅ [DATABASE] Successfully updated job b89982fc-38d6-4df9-8ea3-597bf408631b: processing 61% - "Matching items... (0 matches found)"
❌ [COHERE EMBEDDING] Failed to update progress for batch 17/44
📊 [COHERE] Progress: 39% (1632/4145 items)
🔄 [COHERE] Processing embedding batch 18/44 (96 items)
✅ [COHERE] Got embeddings for batch 18, storing...
🔄 [COHERE] Updating progress: batch 18/44 = 41% of embedding phase
❌ [COHERE EMBEDDING] Failed to update progress for batch 18/44
📊 [COHERE] Progress: 41% (1728/4145 items)
🔄 [COHERE] Processing embedding batch 19/44 (96 items)
✅ [COHERE] Got embeddings for batch 19, storing...
🔄 [COHERE] Updating progress: batch 19/44 = 43% of embedding phase
❌ [COHERE EMBEDDING] Failed to update progress for batch 19/44
📊 [COHERE] Progress: 43% (1824/4145 items)
🔄 [COHERE] Processing embedding batch 20/44 (96 items)
✅ [COHERE] Got embeddings for batch 20, storing...
🔄 [COHERE] Updating progress: batch 20/44 = 45% of embedding phase
🔄 [DATABASE] ENTERING updateJobStatus for job b89982fc-38d6-4df9-8ea3-597bf408631b: status=processing, progress=62
🔄 [DATABASE] Message: Matching items... (0 matches found)
🔄 [DATABASE] Current job status before update: {
  status: 'processing',
  progress: 61,
  updated_at: '2025-06-27T23:25:59.206219+00:00'
}
🔄 [DATABASE] Attempting to update job b89982fc-38d6-4df9-8ea3-597bf408631b with data: {
  "status": "processing",
  "updated_at": "2025-06-27T23:26:02.818Z",
  "progress": 62,
  "error_message": "Matching items... (0 matches found)",
  "matched_items": 0,
  "total_items": 0
}
✅ [DATABASE] Successfully updated job b89982fc-38d6-4df9-8ea3-597bf408631b: processing 62% - "Matching items... (0 matches found)"
❌ [COHERE EMBEDDING] Failed to update progress for batch 20/44
📊 [COHERE] Progress: 45% (1920/4145 items)
🔄 [COHERE] Processing embedding batch 21/44 (96 items)
✅ [COHERE] Got embeddings for batch 21, storing...
🔄 [COHERE] Updating progress: batch 21/44 = 48% of embedding phase
❌ [COHERE EMBEDDING] Failed to update progress for batch 21/44
📊 [COHERE] Progress: 48% (2016/4145 items)
🔄 [COHERE] Processing embedding batch 22/44 (96 items)
✅ [COHERE] Got embeddings for batch 22, storing...
🔄 [COHERE] Updating progress: batch 22/44 = 50% of embedding phase
🔄 [DATABASE] ENTERING updateJobStatus for job b89982fc-38d6-4df9-8ea3-597bf408631b: status=processing, progress=63
🔄 [DATABASE] Message: Matching items... (0 matches found)
🔄 [DATABASE] Current job status before update: {
  status: 'processing',
  progress: 62,
  updated_at: '2025-06-27T23:26:03.686155+00:00'
}
🔄 [DATABASE] Attempting to update job b89982fc-38d6-4df9-8ea3-597bf408631b with data: {
  "status": "processing",
  "updated_at": "2025-06-27T23:26:06.050Z",
  "progress": 63,
  "error_message": "Matching items... (0 matches found)",
  "matched_items": 0,
  "total_items": 0
}
✅ [DATABASE] Successfully updated job b89982fc-38d6-4df9-8ea3-597bf408631b: processing 63% - "Matching items... (0 matches found)"
❌ [COHERE EMBEDDING] Failed to update progress for batch 22/44
📊 [COHERE] Progress: 50% (2112/4145 items)
🔄 [COHERE] Processing embedding batch 23/44 (96 items)
✅ [COHERE] Got embeddings for batch 23, storing...
🔄 [COHERE] Updating progress: batch 23/44 = 52% of embedding phase
❌ [COHERE EMBEDDING] Failed to update progress for batch 23/44
📊 [COHERE] Progress: 52% (2208/4145 items)
🔄 [COHERE] Processing embedding batch 24/44 (96 items)
✅ [COHERE] Got embeddings for batch 24, storing...
🔄 [COHERE] Updating progress: batch 24/44 = 55% of embedding phase
❌ [COHERE EMBEDDING] Failed to update progress for batch 24/44
📊 [COHERE] Progress: 55% (2304/4145 items)
🔄 [COHERE] Processing embedding batch 25/44 (96 items)
✅ [COHERE] Got embeddings for batch 25, storing...
🔄 [COHERE] Updating progress: batch 25/44 = 57% of embedding phase
🔄 [DATABASE] ENTERING updateJobStatus for job b89982fc-38d6-4df9-8ea3-597bf408631b: status=processing, progress=64
🔄 [DATABASE] Message: Matching items... (0 matches found)
🔄 [DATABASE] Current job status before update: {
  status: 'processing',
  progress: 63,
  updated_at: '2025-06-27T23:26:06.910091+00:00'
}
🔄 [DATABASE] Attempting to update job b89982fc-38d6-4df9-8ea3-597bf408631b with data: {
  "status": "processing",
  "updated_at": "2025-06-27T23:26:10.551Z",
  "progress": 64,
  "error_message": "Matching items... (0 matches found)",
  "matched_items": 0,
  "total_items": 0
}
✅ [DATABASE] Successfully updated job b89982fc-38d6-4df9-8ea3-597bf408631b: processing 64% - "Matching items... (0 matches found)"
❌ [COHERE EMBEDDING] Failed to update progress for batch 25/44
📊 [COHERE] Progress: 57% (2400/4145 items)
🔄 [COHERE] Processing embedding batch 26/44 (96 items)
✅ [COHERE] Got embeddings for batch 26, storing...
🔄 [COHERE] Updating progress: batch 26/44 = 59% of embedding phase
❌ [COHERE EMBEDDING] Failed to update progress for batch 26/44
📊 [COHERE] Progress: 59% (2496/4145 items)
🔄 [COHERE] Processing embedding batch 27/44 (96 items)
✅ [COHERE] Got embeddings for batch 27, storing...
🔄 [COHERE] Updating progress: batch 27/44 = 61% of embedding phase
❌ [COHERE EMBEDDING] Failed to update progress for batch 27/44
📊 [COHERE] Progress: 61% (2592/4145 items)
🔄 [COHERE] Processing embedding batch 28/44 (96 items)
✅ [COHERE] Got embeddings for batch 28, storing...
🔄 [COHERE] Updating progress: batch 28/44 = 64% of embedding phase
🔄 [DATABASE] ENTERING updateJobStatus for job b89982fc-38d6-4df9-8ea3-597bf408631b: status=processing, progress=65
🔄 [DATABASE] Message: Matching items... (0 matches found)
🔄 [DATABASE] Current job status before update: {
  status: 'processing',
  progress: 64,
  updated_at: '2025-06-27T23:26:11.410435+00:00'
}
🔄 [DATABASE] Attempting to update job b89982fc-38d6-4df9-8ea3-597bf408631b with data: {
  "status": "processing",
  "updated_at": "2025-06-27T23:26:15.349Z",
  "progress": 65,
  "error_message": "Matching items... (0 matches found)",
  "matched_items": 0,
  "total_items": 0
}
✅ [DATABASE] Successfully updated job b89982fc-38d6-4df9-8ea3-597bf408631b: processing 65% - "Matching items... (0 matches found)"
❌ [COHERE EMBEDDING] Failed to update progress for batch 28/44
📊 [COHERE] Progress: 64% (2688/4145 items)
🔄 [COHERE] Processing embedding batch 29/44 (96 items)
✅ [COHERE] Got embeddings for batch 29, storing...
🔄 [COHERE] Updating progress: batch 29/44 = 66% of embedding phase
❌ [COHERE EMBEDDING] Failed to update progress for batch 29/44
📊 [COHERE] Progress: 66% (2784/4145 items)
🔄 [COHERE] Processing embedding batch 30/44 (96 items)
✅ [COHERE] Got embeddings for batch 30, storing...
🔄 [COHERE] Updating progress: batch 30/44 = 68% of embedding phase
❌ [COHERE EMBEDDING] Failed to update progress for batch 30/44
📊 [COHERE] Progress: 68% (2880/4145 items)
🔄 [COHERE] Processing embedding batch 31/44 (96 items)
✅ [COHERE] Got embeddings for batch 31, storing...
🔄 [COHERE] Updating progress: batch 31/44 = 70% of embedding phase
🔄 [DATABASE] ENTERING updateJobStatus for job b89982fc-38d6-4df9-8ea3-597bf408631b: status=processing, progress=66
🔄 [DATABASE] Message: Matching items... (0 matches found)
🔄 [DATABASE] Current job status before update: {
  status: 'processing',
  progress: 65,
  updated_at: '2025-06-27T23:26:16.210639+00:00'
}
🔄 [DATABASE] Attempting to update job b89982fc-38d6-4df9-8ea3-597bf408631b with data: {
  "status": "processing",
  "updated_at": "2025-06-27T23:26:20.216Z",
  "progress": 66,
  "error_message": "Matching items... (0 matches found)",
  "matched_items": 0,
  "total_items": 0
}
✅ [DATABASE] Successfully updated job b89982fc-38d6-4df9-8ea3-597bf408631b: processing 66% - "Matching items... (0 matches found)"
❌ [COHERE EMBEDDING] Failed to update progress for batch 31/44
📊 [COHERE] Progress: 70% (2976/4145 items)
🔄 [COHERE] Processing embedding batch 32/44 (96 items)
✅ [COHERE] Got embeddings for batch 32, storing...
🔄 [COHERE] Updating progress: batch 32/44 = 73% of embedding phase
❌ [COHERE EMBEDDING] Failed to update progress for batch 32/44
📊 [COHERE] Progress: 73% (3072/4145 items)
🔄 [COHERE] Processing embedding batch 33/44 (96 items)
✅ [COHERE] Got embeddings for batch 33, storing...
🔄 [COHERE] Updating progress: batch 33/44 = 75% of embedding phase
❌ [COHERE EMBEDDING] Failed to update progress for batch 33/44
📊 [COHERE] Progress: 75% (3168/4145 items)
🔄 [COHERE] Processing embedding batch 34/44 (96 items)
✅ [COHERE] Got embeddings for batch 34, storing...
🔄 [COHERE] Updating progress: batch 34/44 = 77% of embedding phase
🔄 [DATABASE] ENTERING updateJobStatus for job b89982fc-38d6-4df9-8ea3-597bf408631b: status=processing, progress=67
🔄 [DATABASE] Message: Matching items... (0 matches found)
🔄 [DATABASE] Current job status before update: {
  status: 'processing',
  progress: 66,
  updated_at: '2025-06-27T23:26:21.082809+00:00'
}
🔄 [DATABASE] Attempting to update job b89982fc-38d6-4df9-8ea3-597bf408631b with data: {
  "status": "processing",
  "updated_at": "2025-06-27T23:26:25.040Z",
  "progress": 67,
  "error_message": "Matching items... (0 matches found)",
  "matched_items": 0,
  "total_items": 0
}
✅ [DATABASE] Successfully updated job b89982fc-38d6-4df9-8ea3-597bf408631b: processing 67% - "Matching items... (0 matches found)"
❌ [COHERE EMBEDDING] Failed to update progress for batch 34/44
📊 [COHERE] Progress: 77% (3264/4145 items)
🔄 [COHERE] Processing embedding batch 35/44 (96 items)
✅ [COHERE] Got embeddings for batch 35, storing...
🔄 [COHERE] Updating progress: batch 35/44 = 80% of embedding phase
❌ [COHERE EMBEDDING] Failed to update progress for batch 35/44
📊 [COHERE] Progress: 80% (3360/4145 items)
🔄 [COHERE] Processing embedding batch 36/44 (96 items)
✅ [COHERE] Got embeddings for batch 36, storing...
🔄 [COHERE] Updating progress: batch 36/44 = 82% of embedding phase
❌ [COHERE EMBEDDING] Failed to update progress for batch 36/44
📊 [COHERE] Progress: 82% (3456/4145 items)
🔄 [COHERE] Processing embedding batch 37/44 (96 items)
✅ [COHERE] Got embeddings for batch 37, storing...
🔄 [COHERE] Updating progress: batch 37/44 = 84% of embedding phase
🔄 [DATABASE] ENTERING updateJobStatus for job b89982fc-38d6-4df9-8ea3-597bf408631b: status=processing, progress=68
🔄 [DATABASE] Message: Matching items... (0 matches found)
🔄 [DATABASE] Current job status before update: {
  status: 'processing',
  progress: 67,
  updated_at: '2025-06-27T23:26:25.901701+00:00'
}
🔄 [DATABASE] Attempting to update job b89982fc-38d6-4df9-8ea3-597bf408631b with data: {
  "status": "processing",
  "updated_at": "2025-06-27T23:26:29.905Z",
  "progress": 68,
  "error_message": "Matching items... (0 matches found)",
  "matched_items": 0,
  "total_items": 0
}
✅ [DATABASE] Successfully updated job b89982fc-38d6-4df9-8ea3-597bf408631b: processing 68% - "Matching items... (0 matches found)"
❌ [COHERE EMBEDDING] Failed to update progress for batch 37/44
📊 [COHERE] Progress: 84% (3552/4145 items)
🔄 [COHERE] Processing embedding batch 38/44 (96 items)
✅ [COHERE] Got embeddings for batch 38, storing...
🔄 [COHERE] Updating progress: batch 38/44 = 86% of embedding phase
❌ [COHERE EMBEDDING] Failed to update progress for batch 38/44
📊 [COHERE] Progress: 86% (3648/4145 items)
🔄 [COHERE] Processing embedding batch 39/44 (96 items)
✅ [COHERE] Got embeddings for batch 39, storing...
🔄 [COHERE] Updating progress: batch 39/44 = 89% of embedding phase
❌ [COHERE EMBEDDING] Failed to update progress for batch 39/44
📊 [COHERE] Progress: 89% (3744/4145 items)
🔄 [COHERE] Processing embedding batch 40/44 (96 items)
✅ [COHERE] Got embeddings for batch 40, storing...
🔄 [COHERE] Updating progress: batch 40/44 = 91% of embedding phase
🔄 [DATABASE] ENTERING updateJobStatus for job b89982fc-38d6-4df9-8ea3-597bf408631b: status=processing, progress=69
🔄 [DATABASE] Message: Matching items... (0 matches found)
🔄 [DATABASE] Current job status before update: {
  status: 'processing',
  progress: 68,
  updated_at: '2025-06-27T23:26:30.77351+00:00'
}
🔄 [DATABASE] Attempting to update job b89982fc-38d6-4df9-8ea3-597bf408631b with data: {
  "status": "processing",
  "updated_at": "2025-06-27T23:26:34.728Z",
  "progress": 69,
  "error_message": "Matching items... (0 matches found)",
  "matched_items": 0,
  "total_items": 0
}
✅ [DATABASE] Successfully updated job b89982fc-38d6-4df9-8ea3-597bf408631b: processing 69% - "Matching items... (0 matches found)"
❌ [COHERE EMBEDDING] Failed to update progress for batch 40/44
📊 [COHERE] Progress: 91% (3840/4145 items)
🔄 [COHERE] Processing embedding batch 41/44 (96 items)
✅ [COHERE] Got embeddings for batch 41, storing...
🔄 [COHERE] Updating progress: batch 41/44 = 93% of embedding phase
❌ [COHERE EMBEDDING] Failed to update progress for batch 41/44
📊 [COHERE] Progress: 93% (3936/4145 items)
🔄 [COHERE] Processing embedding batch 42/44 (96 items)
✅ [COHERE] Got embeddings for batch 42, storing...
🔄 [COHERE] Updating progress: batch 42/44 = 95% of embedding phase
❌ [COHERE EMBEDDING] Failed to update progress for batch 42/44
📊 [COHERE] Progress: 95% (4032/4145 items)
🔄 [COHERE] Processing embedding batch 43/44 (96 items)
✅ [COHERE] Got embeddings for batch 43, storing...
🔄 [COHERE] Updating progress: batch 43/44 = 98% of embedding phase
🔄 [DATABASE] ENTERING updateJobStatus for job b89982fc-38d6-4df9-8ea3-597bf408631b: status=processing, progress=70
🔄 [DATABASE] Message: Matching items... (0 matches found)
🔄 [DATABASE] Current job status before update: {
  status: 'processing',
  progress: 69,
  updated_at: '2025-06-27T23:26:35.587427+00:00'
}
🔄 [DATABASE] Attempting to update job b89982fc-38d6-4df9-8ea3-597bf408631b with data: {
  "status": "processing",
  "updated_at": "2025-06-27T23:26:39.756Z",
  "progress": 70,
  "error_message": "Matching items... (0 matches found)",
  "matched_items": 0,
  "total_items": 0
}
✅ [DATABASE] Successfully updated job b89982fc-38d6-4df9-8ea3-597bf408631b: processing 70% - "Matching items... (0 matches found)"
❌ [COHERE EMBEDDING] Failed to update progress for batch 43/44
📊 [COHERE] Progress: 98% (4128/4145 items)
🔄 [COHERE] Processing embedding batch 44/44 (17 items)
✅ [COHERE] Got embeddings for batch 44, storing...
🔄 [COHERE] Updating progress: batch 44/44 = 100% of embedding phase
❌ [COHERE EMBEDDING] Failed to update progress for batch 44/44
📊 [COHERE] Progress: 100% (4145/4145 items)
✅ [COHERE] Pre-computed 4145 embeddings in 68.9s
📊 [COHERE] Final stats: 4145 embeddings, 67 categories
   🚀 Processing batch 1/6 (96 items)
[COHERE] Using enhanced description: "Page Total 2000/1/2: Surface water..."
[COHERE] Using enhanced description: "D30 Cast in place concrete piling

Cutting off tops of pil..."
[COHERE] Using enhanced description: "D30 Cast in place concrete piling

Cutting off tops of pil..."
[COHERE] Using enhanced description: "Page Total 2000/2/2: Surface water..."
[COHERE] Using enhanced description: "D30 Cast in place concrete piling

Cutting off tops of pil..."
[COHERE] Using enhanced description: "Extra over excavation irrespective of depth for excavating: ..."
[COHERE] Using enhanced description: "Page Total 2000/3/4: Ground water..."
[COHERE] Using enhanced description: "Page Total 2000/3/4: Surface water..."
[COHERE] Using enhanced description: "Page Total 2000/3/4: Off site..."
[COHERE] Using enhanced description: "Page Total 2000/3/4: On site spoil heaps..."
[COHERE] Using enhanced description: "Page Total 2000/3/6: Generally..."
📂 [COHERE] Item 1: Category = none (confidence: 0)
[COHERE DEBUG] Item 1: bestMatch = { confidence: 58, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 1, Total confidence: 58.185502147299154
✅ Match (58%): "25 m maximum depth from Existi..."
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating)
📂 [COHERE] Item 2: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating)
[COHERE DEBUG] Item 2: bestMatch = { confidence: 49, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 2, Total confidence: 107.43512677633262
⚠️  Low confidence (49%): "Below ground water level; (PRI..."
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating)
📂 [COHERE] Item 3: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating)
[COHERE DEBUG] Item 3: bestMatch = { confidence: 49, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 3, Total confidence: 156.42507460053451
⚠️  Low confidence (49%): "Toxic/hazardous material; (PRI..."
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating)
📂 [COHERE] Item 4: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating)
[COHERE DEBUG] Item 4: bestMatch = { confidence: 49, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 4, Total confidence: 205.79432516955987
⚠️  Low confidence (49%): "Brickwork blockwork or stonewo..."
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating)
📂 [COHERE] Item 5: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating)
[COHERE DEBUG] Item 5: bestMatch = { confidence: 50, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 5, Total confidence: 255.57586155767055
⚠️  Low confidence (50%): "Concrete in foundations; (NOTE..."
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating)
📂 [COHERE] Item 6: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating)
[COHERE DEBUG] Item 6: bestMatch = { confidence: 52, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 6, Total confidence: 307.68492821637136
✅ Match (52%): "00 m maximum depth; distance b..."
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating > Page Total 2000/1/2)
📂 [COHERE] Item 7: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating > Page Total 2000/1/2)
[COHERE DEBUG] Item 7: bestMatch = { confidence: 52, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 7, Total confidence: 359.4038380671409
✅ Match (52%): "Ground water; (PRICING POINT -..."
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating > Page Total 2000/1/2)
📂 [COHERE] Item 8: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating > Page Total 2000/1/2)
[COHERE DEBUG] Item 8: bestMatch = { confidence: 50, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 8, Total confidence: 408.9072692291603
⚠️  Low confidence (50%): "Surface water..."
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating > Page Total 2000/1/2)
📂 [COHERE] Item 9: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating > Page Total 2000/1/2)
[COHERE DEBUG] Item 9: bestMatch = { confidence: 65, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 9, Total confidence: 473.7934917991734
✅ Match (65%): "Off site; (Reduce excavations ..."
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating > Page Total 2000/1/2)
📂 [COHERE] Item 10: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating > Page Total 2000/1/2)
[COHERE DEBUG] Item 10: bestMatch = { confidence: 54, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 10, Total confidence: 528.0960253659496
✅ Match (54%): "Off site; toxic/hazardous mate..."
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating > Page Total 2000/1/2 > Hardcore; imported 6f2; NO Spec; BCA assumed

Filling to; make up levels)
📂 [COHERE] Item 11: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating > Page Total 2000/1/2 > Hardcore; imported 6f2; NO Spec; BCA assumed

Filling to; make up levels)
[COHERE DEBUG] Item 11: bestMatch = { confidence: 60, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 11, Total confidence: 588.5384539730615
✅ Match (60%): "Over 250 average thick; obtain..."
📂 [COHERE] Category from header: excavation (Page Total 2000/1/2 > Hardcore; imported 6f2; NO Spec; BCA assumed

Filling to; make up levels > Hardcore; on-site 6f2; NO Spec; BCA assumed

Filling to; make up levels)
📂 [COHERE] Item 12: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 2000/1/2 > Hardcore; imported 6f2; NO Spec; BCA assumed

Filling to; make up levels > Hardcore; on-site 6f2; NO Spec; BCA assumed

Filling to; make up levels)
[COHERE DEBUG] Item 12: bestMatch = { confidence: 60, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 12, Total confidence: 649.0041111774499
✅ Match (60%): "Over 250 average thick; obtain..."
📂 [COHERE] Category from header: excavation (Page Total 2000/1/2 > Hardcore; imported 6f2; NO Spec; BCA assumed

Filling to; make up levels > Hardcore; on-site 6f2; NO Spec; BCA assumed

Filling to; make up levels)
📂 [COHERE] Item 13: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 2000/1/2 > Hardcore; imported 6f2; NO Spec; BCA assumed

Filling to; make up levels > Hardcore; on-site 6f2; NO Spec; BCA assumed

Filling to; make up levels)
[COHERE DEBUG] Item 13: bestMatch = { confidence: 64, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 13, Total confidence: 712.7953674181007
✅ Match (64%): "Compacting; bottoms of excavat..."
📂 [COHERE] Category from header: excavation (Page Total 2000/1/2 > Hardcore; imported 6f2; NO Spec; BCA assumed

Filling to; make up levels > Hardcore; on-site 6f2; NO Spec; BCA assumed

Filling to; make up levels)
📂 [COHERE] Item 14: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 2000/1/2 > Hardcore; imported 6f2; NO Spec; BCA assumed

Filling to; make up levels > Hardcore; on-site 6f2; NO Spec; BCA assumed

Filling to; make up levels)
[COHERE DEBUG] Item 14: bestMatch = { confidence: 63, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 14, Total confidence: 775.6256171870867
✅ Match (63%): "Compacting; filling; with vibr..."
📂 [COHERE] Category from header: excavation (Hardcore; imported 6f2; NO Spec; BCA assumed

Filling to; make up levels > Hardcore; on-site 6f2; NO Spec; BCA assumed

Filling to; make up levels > D30 Cast in place concrete piling

Cutting off tops of piles 450mm diameter)
📂 [COHERE] Item 15: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Hardcore; imported 6f2; NO Spec; BCA assumed

Filling to; make up levels > Hardcore; on-site 6f2; NO Spec; BCA assumed

Filling to; make up levels > D30 Cast in place concrete piling

Cutting off tops of piles 450mm diameter)
[COHERE DEBUG] Item 15: bestMatch = { confidence: 55, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 15, Total confidence: 830.3866198488121
✅ Match (55%): "Total length; (100 Nr); piles..."
📂 [COHERE] Category from header: excavation (Hardcore; imported 6f2; NO Spec; BCA assumed

Filling to; make up levels > Hardcore; on-site 6f2; NO Spec; BCA assumed

Filling to; make up levels > D30 Cast in place concrete piling

Cutting off tops of piles 450mm diameter)
📂 [COHERE] Item 16: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Hardcore; imported 6f2; NO Spec; BCA assumed

Filling to; make up levels > Hardcore; on-site 6f2; NO Spec; BCA assumed

Filling to; make up levels > D30 Cast in place concrete piling

Cutting off tops of piles 450mm diameter)
[COHERE DEBUG] Item 16: bestMatch = { confidence: 55, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 16, Total confidence: 885.372127408099
✅ Match (55%): "Off-site..."
📂 [COHERE] Category from header: excavation (Hardcore; on-site 6f2; NO Spec; BCA assumed

Filling to; make up levels > D30 Cast in place concrete piling

Cutting off tops of piles 450mm diameter > Page Total 2000/1/3)
📂 [COHERE] Item 17: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Hardcore; on-site 6f2; NO Spec; BCA assumed

Filling to; make up levels > D30 Cast in place concrete piling

Cutting off tops of piles 450mm diameter > Page Total 2000/1/3)
[COHERE DEBUG] Item 17: bestMatch = { confidence: 58, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 17, Total confidence: 943.1296808049173
✅ Match (58%): "Off site; toxic/hazardous mate..."
📂 [COHERE] Item 18: Category = none (confidence: 0)
[COHERE DEBUG] Item 18: bestMatch = { confidence: 59, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 18, Total confidence: 1002.1546314384793
✅ Match (59%): "At individual 450mm diameter p..."
📂 [COHERE] Item 19: Category = none (confidence: 0)
[COHERE DEBUG] Item 19: bestMatch = { confidence: 57, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 19, Total confidence: 1059.207154660487
✅ Match (57%): "0 m maximum depth from Demolit..."
📂 [COHERE] Category from header: excavation (Items extra over piling

Breaking through obstructions > Page Total 2000/1/6 > Extra over excavation irrespective of depth for excavating)
📂 [COHERE] Item 20: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Items extra over piling

Breaking through obstructions > Page Total 2000/1/6 > Extra over excavation irrespective of depth for excavating)
[COHERE DEBUG] Item 20: bestMatch = { confidence: 52, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 20, Total confidence: 1110.7827045257307
✅ Match (52%): "Below ground water level; (PRI..."
📂 [COHERE] Category from header: excavation (Items extra over piling

Breaking through obstructions > Page Total 2000/1/6 > Extra over excavation irrespective of depth for excavating)
📂 [COHERE] Item 21: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Items extra over piling

Breaking through obstructions > Page Total 2000/1/6 > Extra over excavation irrespective of depth for excavating)
[COHERE DEBUG] Item 21: bestMatch = { confidence: 51, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 21, Total confidence: 1161.5530141913475
✅ Match (51%): "Toxic/hazardous material; (PRI..."
📂 [COHERE] Category from header: excavation (Items extra over piling

Breaking through obstructions > Page Total 2000/1/6 > Extra over excavation irrespective of depth for excavating)
📂 [COHERE] Item 22: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Items extra over piling

Breaking through obstructions > Page Total 2000/1/6 > Extra over excavation irrespective of depth for excavating)
[COHERE DEBUG] Item 22: bestMatch = { confidence: 50, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 22, Total confidence: 1211.4666587566915
⚠️  Low confidence (50%): "Brickwork blockwork or stonewo..."
📂 [COHERE] Category from header: excavation (Items extra over piling

Breaking through obstructions > Page Total 2000/1/6 > Extra over excavation irrespective of depth for excavating)
📂 [COHERE] Item 23: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Items extra over piling

Breaking through obstructions > Page Total 2000/1/6 > Extra over excavation irrespective of depth for excavating)
[COHERE DEBUG] Item 23: bestMatch = { confidence: 52, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 23, Total confidence: 1263.9216939823896
✅ Match (52%): "Concrete in foundations; (NOTE..."
📂 [COHERE] Category from header: excavation (Items extra over piling

Breaking through obstructions > Page Total 2000/1/6 > Extra over excavation irrespective of depth for excavating)
📂 [COHERE] Item 24: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Items extra over piling

Breaking through obstructions > Page Total 2000/1/6 > Extra over excavation irrespective of depth for excavating)
[COHERE DEBUG] Item 24: bestMatch = { confidence: 52, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 24, Total confidence: 1316.3071784279282
✅ Match (52%): "Ground water; (PRICING POINT -..."
📂 [COHERE] Category from header: excavation (Page Total 2000/1/6 > Extra over excavation irrespective of depth for excavating > Page Total 2000/2/2)
📂 [COHERE] Item 25: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 2000/1/6 > Extra over excavation irrespective of depth for excavating > Page Total 2000/2/2)
[COHERE DEBUG] Item 25: bestMatch = { confidence: 49, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 25, Total confidence: 1365.374079323676
⚠️  Low confidence (49%): "Surface water..."
📂 [COHERE] Category from header: excavation (Page Total 2000/1/6 > Extra over excavation irrespective of depth for excavating > Page Total 2000/2/2)
📂 [COHERE] Item 26: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 2000/1/6 > Extra over excavation irrespective of depth for excavating > Page Total 2000/2/2)
[COHERE DEBUG] Item 26: bestMatch = { confidence: 61, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 26, Total confidence: 1426.047890337312
✅ Match (61%): "Off site; (Reduce excavations ..."
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating > Page Total 2000/2/2 > Hardcore; imported 6f2; NO Spec; BCA assumed

Filling to; make up levels)
📂 [COHERE] Item 27: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating > Page Total 2000/2/2 > Hardcore; imported 6f2; NO Spec; BCA assumed

Filling to; make up levels)
[COHERE DEBUG] Item 27: bestMatch = { confidence: 61, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 27, Total confidence: 1486.6872913822203
✅ Match (61%): "Over 250 average thick; obtain..."
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating > Page Total 2000/2/2 > Hardcore; imported 6f2; NO Spec; BCA assumed

Filling to; make up levels)
📂 [COHERE] Item 28: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating > Page Total 2000/2/2 > Hardcore; imported 6f2; NO Spec; BCA assumed

Filling to; make up levels)
[COHERE DEBUG] Item 28: bestMatch = { confidence: 61, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 28, Total confidence: 1547.6397593416555
✅ Match (61%): "Compacting; bottoms of excavat..."
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating > Page Total 2000/2/2 > Hardcore; imported 6f2; NO Spec; BCA assumed

Filling to; make up levels)
📂 [COHERE] Item 29: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating > Page Total 2000/2/2 > Hardcore; imported 6f2; NO Spec; BCA assumed

Filling to; make up levels)
[COHERE DEBUG] Item 29: bestMatch = { confidence: 61, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 29, Total confidence: 1608.5758432674418
✅ Match (61%): "Compacting; filling; with vibr..."
📂 [COHERE] Category from header: excavation (Page Total 2000/2/2 > Hardcore; imported 6f2; NO Spec; BCA assumed

Filling to; make up levels > D30 Cast in place concrete piling

Cutting off tops of piles 450mm diameter)
📂 [COHERE] Item 30: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 2000/2/2 > Hardcore; imported 6f2; NO Spec; BCA assumed

Filling to; make up levels > D30 Cast in place concrete piling

Cutting off tops of piles 450mm diameter)
[COHERE DEBUG] Item 30: bestMatch = { confidence: 56, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 30, Total confidence: 1664.452961607491
✅ Match (56%): "Total length; (22 Nr); piles..."
📂 [COHERE] Category from header: excavation (Page Total 2000/2/2 > Hardcore; imported 6f2; NO Spec; BCA assumed

Filling to; make up levels > D30 Cast in place concrete piling

Cutting off tops of piles 450mm diameter)
📂 [COHERE] Item 31: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 2000/2/2 > Hardcore; imported 6f2; NO Spec; BCA assumed

Filling to; make up levels > D30 Cast in place concrete piling

Cutting off tops of piles 450mm diameter)
[COHERE DEBUG] Item 31: bestMatch = { confidence: 58, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 31, Total confidence: 1722.0105014528622
✅ Match (58%): "Off-site; BCA assumed pile len..."
📂 [COHERE] Category from header: excavation (Page Total 2000/2/2 > Hardcore; imported 6f2; NO Spec; BCA assumed

Filling to; make up levels > D30 Cast in place concrete piling

Cutting off tops of piles 450mm diameter)
📂 [COHERE] Item 32: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 2000/2/2 > Hardcore; imported 6f2; NO Spec; BCA assumed

Filling to; make up levels > D30 Cast in place concrete piling

Cutting off tops of piles 450mm diameter)
[COHERE DEBUG] Item 32: bestMatch = { confidence: 58, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 32, Total confidence: 1779.8345516316442
✅ Match (58%): "Off site; toxic/hazardous mate..."
📂 [COHERE] Category from header: excavation (Hardcore; imported 6f2; NO Spec; BCA assumed

Filling to; make up levels > D30 Cast in place concrete piling

Cutting off tops of piles 450mm diameter > Page Total 2000/2/3)
📂 [COHERE] Item 33: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Hardcore; imported 6f2; NO Spec; BCA assumed

Filling to; make up levels > D30 Cast in place concrete piling

Cutting off tops of piles 450mm diameter > Page Total 2000/2/3)
[COHERE DEBUG] Item 33: bestMatch = { confidence: 60, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 33, Total confidence: 1840.1889089499255
✅ Match (60%): "25 m maximum depth; commencing..."
📂 [COHERE] Category from header: excavation (Hardcore; imported 6f2; NO Spec; BCA assumed

Filling to; make up levels > D30 Cast in place concrete piling

Cutting off tops of piles 450mm diameter > Page Total 2000/2/3)
📂 [COHERE] Item 34: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Hardcore; imported 6f2; NO Spec; BCA assumed

Filling to; make up levels > D30 Cast in place concrete piling

Cutting off tops of piles 450mm diameter > Page Total 2000/2/3)
[COHERE DEBUG] Item 34: bestMatch = { confidence: 61, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 34, Total confidence: 1901.5593404839085
✅ Match (61%): "25 m maximum depth; commencing..."
📂 [COHERE] Category from header: excavation (Hardcore; imported 6f2; NO Spec; BCA assumed

Filling to; make up levels > D30 Cast in place concrete piling

Cutting off tops of piles 450mm diameter > Page Total 2000/2/3)
📂 [COHERE] Item 35: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Hardcore; imported 6f2; NO Spec; BCA assumed

Filling to; make up levels > D30 Cast in place concrete piling

Cutting off tops of piles 450mm diameter > Page Total 2000/2/3)
[COHERE DEBUG] Item 35: bestMatch = { confidence: 58, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 35, Total confidence: 1959.840105940809
✅ Match (58%): "00 m maximum depth; commencing..."
📂 [COHERE] Category from header: excavation (Hardcore; imported 6f2; NO Spec; BCA assumed

Filling to; make up levels > D30 Cast in place concrete piling

Cutting off tops of piles 450mm diameter > Page Total 2000/2/3)
📂 [COHERE] Item 36: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Hardcore; imported 6f2; NO Spec; BCA assumed

Filling to; make up levels > D30 Cast in place concrete piling

Cutting off tops of piles 450mm diameter > Page Total 2000/2/3)
[COHERE DEBUG] Item 36: bestMatch = { confidence: 55, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 36, Total confidence: 2015.0254167294663
✅ Match (55%): "00 m maximum depth; commencing..."
📂 [COHERE] Category from header: excavation (Hardcore; imported 6f2; NO Spec; BCA assumed

Filling to; make up levels > D30 Cast in place concrete piling

Cutting off tops of piles 450mm diameter > Page Total 2000/2/3)
📂 [COHERE] Item 37: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Hardcore; imported 6f2; NO Spec; BCA assumed

Filling to; make up levels > D30 Cast in place concrete piling

Cutting off tops of piles 450mm diameter > Page Total 2000/2/3)
[COHERE DEBUG] Item 37: bestMatch = { confidence: 54, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 37, Total confidence: 2069.4778103214803
✅ Match (54%): "00 m maximum depth; commencing..."
📂 [COHERE] Category from header: excavation (Hardcore; imported 6f2; NO Spec; BCA assumed

Filling to; make up levels > D30 Cast in place concrete piling

Cutting off tops of piles 450mm diameter > Page Total 2000/2/3)
📂 [COHERE] Item 38: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Hardcore; imported 6f2; NO Spec; BCA assumed

Filling to; make up levels > D30 Cast in place concrete piling

Cutting off tops of piles 450mm diameter > Page Total 2000/2/3)
[COHERE DEBUG] Item 38: bestMatch = { confidence: 58, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 38, Total confidence: 2127.6755209310013
✅ Match (58%): "0 m maximum depth; commencing ..."
📂 [COHERE] Category from header: excavation (Hardcore; imported 6f2; NO Spec; BCA assumed

Filling to; make up levels > D30 Cast in place concrete piling

Cutting off tops of piles 450mm diameter > Page Total 2000/2/3)
📂 [COHERE] Item 39: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Hardcore; imported 6f2; NO Spec; BCA assumed

Filling to; make up levels > D30 Cast in place concrete piling

Cutting off tops of piles 450mm diameter > Page Total 2000/2/3)
[COHERE DEBUG] Item 39: bestMatch = { confidence: 55, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 39, Total confidence: 2182.806352511904
✅ Match (55%): "00 m maximum depth; commencing..."
📂 [COHERE] Category from header: excavation (D30 Cast in place concrete piling

Cutting off tops of piles 450mm diameter > Page Total 2000/2/3 > Page Total 2000/3/2)
📂 [COHERE] Item 40: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (D30 Cast in place concrete piling

Cutting off tops of piles 450mm diameter > Page Total 2000/2/3 > Page Total 2000/3/2)
[COHERE DEBUG] Item 40: bestMatch = { confidence: 51, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 40, Total confidence: 2233.8492040974447
✅ Match (51%): "00 m maximum depth; commencing..."
📂 [COHERE] Category from header: excavation (D30 Cast in place concrete piling

Cutting off tops of piles 450mm diameter > Page Total 2000/2/3 > Page Total 2000/3/2)
📂 [COHERE] Item 41: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (D30 Cast in place concrete piling

Cutting off tops of piles 450mm diameter > Page Total 2000/2/3 > Page Total 2000/3/2)
[COHERE DEBUG] Item 41: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 41, Total confidence: 2287.005168465437
✅ Match (53%): "00 m maximum depth; commencing..."
📂 [COHERE] Category from header: excavation (D30 Cast in place concrete piling

Cutting off tops of piles 450mm diameter > Page Total 2000/2/3 > Page Total 2000/3/2)
📂 [COHERE] Item 42: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (D30 Cast in place concrete piling

Cutting off tops of piles 450mm diameter > Page Total 2000/2/3 > Page Total 2000/3/2)
[COHERE DEBUG] Item 42: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 42, Total confidence: 2340.0183159639596
✅ Match (53%): "00 m maximum depth; commencing..."
📂 [COHERE] Category from header: excavation (D30 Cast in place concrete piling

Cutting off tops of piles 450mm diameter > Page Total 2000/2/3 > Page Total 2000/3/2)
📂 [COHERE] Item 43: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (D30 Cast in place concrete piling

Cutting off tops of piles 450mm diameter > Page Total 2000/2/3 > Page Total 2000/3/2)
[COHERE DEBUG] Item 43: bestMatch = { confidence: 52, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 43, Total confidence: 2392.267607469878
✅ Match (52%): "00 m maximum depth; commencing..."
📂 [COHERE] Category from header: excavation (D30 Cast in place concrete piling

Cutting off tops of piles 450mm diameter > Page Total 2000/2/3 > Page Total 2000/3/2)
📂 [COHERE] Item 44: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (D30 Cast in place concrete piling

Cutting off tops of piles 450mm diameter > Page Total 2000/2/3 > Page Total 2000/3/2)
[COHERE DEBUG] Item 44: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 44, Total confidence: 2445.4792818510728
✅ Match (53%): "00 m maximum depth; commencing..."
📂 [COHERE] Category from header: excavation (D30 Cast in place concrete piling

Cutting off tops of piles 450mm diameter > Page Total 2000/2/3 > Page Total 2000/3/2)
📂 [COHERE] Item 45: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (D30 Cast in place concrete piling

Cutting off tops of piles 450mm diameter > Page Total 2000/2/3 > Page Total 2000/3/2)
[COHERE DEBUG] Item 45: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 45, Total confidence: 2498.5089768395583
✅ Match (53%): "00 m maximum depth; commencing..."
📂 [COHERE] Category from header: excavation (D30 Cast in place concrete piling

Cutting off tops of piles 450mm diameter > Page Total 2000/2/3 > Page Total 2000/3/2)
📂 [COHERE] Item 46: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (D30 Cast in place concrete piling

Cutting off tops of piles 450mm diameter > Page Total 2000/2/3 > Page Total 2000/3/2)
[COHERE DEBUG] Item 46: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 46, Total confidence: 2551.620974095747
✅ Match (53%): "00 m maximum depth; commencing..."
📂 [COHERE] Category from header: excavation (D30 Cast in place concrete piling

Cutting off tops of piles 450mm diameter > Page Total 2000/2/3 > Page Total 2000/3/2)
📂 [COHERE] Item 47: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (D30 Cast in place concrete piling

Cutting off tops of piles 450mm diameter > Page Total 2000/2/3 > Page Total 2000/3/2)
[COHERE DEBUG] Item 47: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 47, Total confidence: 2604.560739234759
✅ Match (53%): "00 m maximum depth; commencing..."
📂 [COHERE] Category from header: excavation (D30 Cast in place concrete piling

Cutting off tops of piles 450mm diameter > Page Total 2000/2/3 > Page Total 2000/3/2)
📂 [COHERE] Item 48: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (D30 Cast in place concrete piling

Cutting off tops of piles 450mm diameter > Page Total 2000/2/3 > Page Total 2000/3/2)
[COHERE DEBUG] Item 48: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 48, Total confidence: 2657.08193992048
✅ Match (53%): "00 m maximum depth; commencing..."
📂 [COHERE] Category from header: excavation (D30 Cast in place concrete piling

Cutting off tops of piles 450mm diameter > Page Total 2000/2/3 > Page Total 2000/3/2)
📂 [COHERE] Item 49: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (D30 Cast in place concrete piling

Cutting off tops of piles 450mm diameter > Page Total 2000/2/3 > Page Total 2000/3/2)
[COHERE DEBUG] Item 49: bestMatch = { confidence: 55, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 49, Total confidence: 2711.680899281729
✅ Match (55%): "00 m maximum depth; commencing..."
📂 [COHERE] Category from header: excavation (D30 Cast in place concrete piling

Cutting off tops of piles 450mm diameter > Page Total 2000/2/3 > Page Total 2000/3/2)
📂 [COHERE] Item 50: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (D30 Cast in place concrete piling

Cutting off tops of piles 450mm diameter > Page Total 2000/2/3 > Page Total 2000/3/2)
[COHERE DEBUG] Item 50: bestMatch = { confidence: 54, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 50, Total confidence: 2766.0487795510294
✅ Match (54%): "00 m maximum depth; commencing..."
📂 [COHERE] Category from header: excavation (D30 Cast in place concrete piling

Cutting off tops of piles 450mm diameter > Page Total 2000/2/3 > Page Total 2000/3/2)
📂 [COHERE] Item 51: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (D30 Cast in place concrete piling

Cutting off tops of piles 450mm diameter > Page Total 2000/2/3 > Page Total 2000/3/2)
[COHERE DEBUG] Item 51: bestMatch = { confidence: 52, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 51, Total confidence: 2818.103350478683
✅ Match (52%): "00 m maximum depth; commencing..."
📂 [COHERE] Item 52: Category = none (confidence: 0)
[COHERE DEBUG] Item 52: bestMatch = { confidence: 47, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 52, Total confidence: 2865.074313938488
⚠️  Low confidence (47%): "Depth unknown; commencing at L..."
📂 [COHERE] Category from header: excavation (Page Total 2000/3/2 > Page Total 2000/3/3 > Extra over excavation irrespective of depth for excavating)
📂 [COHERE] Item 53: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 2000/3/2 > Page Total 2000/3/3 > Extra over excavation irrespective of depth for excavating)
[COHERE DEBUG] Item 53: bestMatch = { confidence: 52, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 53, Total confidence: 2916.9417374325326
✅ Match (52%): "Below ground water level - RIS..."
📂 [COHERE] Category from header: excavation (Page Total 2000/3/2 > Page Total 2000/3/3 > Extra over excavation irrespective of depth for excavating)
📂 [COHERE] Item 54: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 2000/3/2 > Page Total 2000/3/3 > Extra over excavation irrespective of depth for excavating)
[COHERE DEBUG] Item 54: bestMatch = { confidence: 50, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 54, Total confidence: 2966.8923443972603
⚠️  Low confidence (50%): "Toxic/hazardous material; as N..."
📂 [COHERE] Category from header: excavation (Page Total 2000/3/2 > Page Total 2000/3/3 > Extra over excavation irrespective of depth for excavating)
📂 [COHERE] Item 55: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 2000/3/2 > Page Total 2000/3/3 > Extra over excavation irrespective of depth for excavating)
[COHERE DEBUG] Item 55: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 55, Total confidence: 3020.3793430481182
✅ Match (53%): "Pits; (Isolated Pile Caps)..."
📂 [COHERE] Category from header: excavation (Page Total 2000/3/2 > Page Total 2000/3/3 > Extra over excavation irrespective of depth for excavating)
📂 [COHERE] Item 56: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 2000/3/2 > Page Total 2000/3/3 > Extra over excavation irrespective of depth for excavating)
[COHERE DEBUG] Item 56: bestMatch = { confidence: 55, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 56, Total confidence: 3075.2552210028043
✅ Match (55%): "Reduce levels basements and th..."
📂 [COHERE] Category from header: excavation (Page Total 2000/3/2 > Page Total 2000/3/3 > Extra over excavation irrespective of depth for excavating)
📂 [COHERE] Item 57: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 2000/3/2 > Page Total 2000/3/3 > Extra over excavation irrespective of depth for excavating)
[COHERE DEBUG] Item 57: bestMatch = { confidence: 61, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 57, Total confidence: 3135.9495565723155
✅ Match (61%): "Pile caps and ground beams bet..."
📂 [COHERE] Category from header: excavation (Page Total 2000/3/2 > Page Total 2000/3/3 > Extra over excavation irrespective of depth for excavating)
📂 [COHERE] Item 58: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 2000/3/2 > Page Total 2000/3/3 > Extra over excavation irrespective of depth for excavating)
[COHERE DEBUG] Item 58: bestMatch = { confidence: 49, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 58, Total confidence: 3184.556960178058
⚠️  Low confidence (49%): "pits; (Crane Base - NOT SHOWN ..."
📂 [COHERE] Category from header: excavation (Page Total 2000/3/2 > Page Total 2000/3/3 > Extra over excavation irrespective of depth for excavating)
📂 [COHERE] Item 59: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 2000/3/2 > Page Total 2000/3/3 > Extra over excavation irrespective of depth for excavating)
[COHERE DEBUG] Item 59: bestMatch = { confidence: 52, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 59, Total confidence: 3236.3442155053986
✅ Match (52%): "00 m maximum depth; distance b..."
📂 [COHERE] Category from header: excavation (Page Total 2000/3/2 > Page Total 2000/3/3 > Extra over excavation irrespective of depth for excavating)
📂 [COHERE] Item 60: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 2000/3/2 > Page Total 2000/3/3 > Extra over excavation irrespective of depth for excavating)
[COHERE DEBUG] Item 60: bestMatch = { confidence: 51, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 60, Total confidence: 3286.9005070685644
✅ Match (51%): "00 m maximum depth; distance b..."
📂 [COHERE] Category from header: excavation (Page Total 2000/3/2 > Page Total 2000/3/3 > Extra over excavation irrespective of depth for excavating)
📂 [COHERE] Item 61: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 2000/3/2 > Page Total 2000/3/3 > Extra over excavation irrespective of depth for excavating)
[COHERE DEBUG] Item 61: bestMatch = { confidence: 56, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 61, Total confidence: 3343.3991466704583
✅ Match (56%): "00 m maximum depth; distance b..."
📂 [COHERE] Category from header: excavation (Page Total 2000/3/2 > Page Total 2000/3/3 > Extra over excavation irrespective of depth for excavating)
📂 [COHERE] Item 62: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 2000/3/2 > Page Total 2000/3/3 > Extra over excavation irrespective of depth for excavating)
[COHERE DEBUG] Item 62: bestMatch = { confidence: 52, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 62, Total confidence: 3395.697393941365
✅ Match (52%): "00 m maximum depth; distance b..."
📂 [COHERE] Category from header: excavation (Page Total 2000/3/2 > Page Total 2000/3/3 > Extra over excavation irrespective of depth for excavating)
📂 [COHERE] Item 63: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 2000/3/2 > Page Total 2000/3/3 > Extra over excavation irrespective of depth for excavating)
[COHERE DEBUG] Item 63: bestMatch = { confidence: 50, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 63, Total confidence: 3445.811033077868
✅ Match (50%): "00 m maximum depth; distance b..."
📂 [COHERE] Category from header: excavation (Page Total 2000/3/3 > Extra over excavation irrespective of depth for excavating > Page Total 2000/3/4)
📂 [COHERE] Item 64: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 2000/3/3 > Extra over excavation irrespective of depth for excavating > Page Total 2000/3/4)
[COHERE DEBUG] Item 64: bestMatch = { confidence: 51, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 64, Total confidence: 3496.830250985627
✅ Match (51%): "00 m maximum depth; distance b..."
📂 [COHERE] Category from header: excavation (Page Total 2000/3/3 > Extra over excavation irrespective of depth for excavating > Page Total 2000/3/4)
📂 [COHERE] Item 65: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 2000/3/3 > Extra over excavation irrespective of depth for excavating > Page Total 2000/3/4)
[COHERE DEBUG] Item 65: bestMatch = { confidence: 51, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 65, Total confidence: 3547.627461156071
✅ Match (51%): "00 m maximum depth; distance b..."
📂 [COHERE] Category from header: excavation (Page Total 2000/3/3 > Extra over excavation irrespective of depth for excavating > Page Total 2000/3/4)
📂 [COHERE] Item 66: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 2000/3/3 > Extra over excavation irrespective of depth for excavating > Page Total 2000/3/4)
[COHERE DEBUG] Item 66: bestMatch = { confidence: 52, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 66, Total confidence: 3599.697702454521
✅ Match (52%): "Ground water..."
📂 [COHERE] Category from header: excavation (Page Total 2000/3/3 > Extra over excavation irrespective of depth for excavating > Page Total 2000/3/4)
📂 [COHERE] Item 67: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 2000/3/3 > Extra over excavation irrespective of depth for excavating > Page Total 2000/3/4)
[COHERE DEBUG] Item 67: bestMatch = { confidence: 49, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 67, Total confidence: 3648.8297176340475
⚠️  Low confidence (49%): "Surface water..."
📂 [COHERE] Category from header: excavation (Page Total 2000/3/3 > Extra over excavation irrespective of depth for excavating > Page Total 2000/3/4)
📂 [COHERE] Item 68: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 2000/3/3 > Extra over excavation irrespective of depth for excavating > Page Total 2000/3/4)
[COHERE DEBUG] Item 68: bestMatch = { confidence: 48, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 68, Total confidence: 3696.836102239783
⚠️  Low confidence (48%): "Off site..."
📂 [COHERE] Category from header: excavation (Page Total 2000/3/3 > Extra over excavation irrespective of depth for excavating > Page Total 2000/3/4)
📂 [COHERE] Item 69: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 2000/3/3 > Extra over excavation irrespective of depth for excavating > Page Total 2000/3/4)
[COHERE DEBUG] Item 69: bestMatch = { confidence: 48, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 69, Total confidence: 3744.6221274306154
⚠️  Low confidence (48%): "On site spoil heaps..."
📂 [COHERE] Category from header: excavation (Page Total 2000/3/3 > Extra over excavation irrespective of depth for excavating > Page Total 2000/3/4)
📂 [COHERE] Item 70: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 2000/3/3 > Extra over excavation irrespective of depth for excavating > Page Total 2000/3/4)
[COHERE DEBUG] Item 70: bestMatch = { confidence: 54, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 70, Total confidence: 3798.4614038829827
✅ Match (54%): "Off site; toxic/hazardous mate..."
📂 [COHERE] Category from header: excavation (Page Total 2000/3/3 > Extra over excavation irrespective of depth for excavating > Page Total 2000/3/4)
📂 [COHERE] Item 71: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 2000/3/3 > Extra over excavation irrespective of depth for excavating > Page Total 2000/3/4)
[COHERE DEBUG] Item 71: bestMatch = { confidence: 51, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 71, Total confidence: 3849.0635181105085
✅ Match (51%): "Over 250 thick; (Side of Upsta..."
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating > Page Total 2000/3/4 > Filling to; make up levels)
📂 [COHERE] Item 72: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating > Page Total 2000/3/4 > Filling to; make up levels)
[COHERE DEBUG] Item 72: bestMatch = { confidence: 54, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 72, Total confidence: 3902.9324343065423
✅ Match (54%): "Not exceeding 250 thick; (Belo..."
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating > Page Total 2000/3/4 > Filling to; make up levels)
📂 [COHERE] Item 73: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating > Page Total 2000/3/4 > Filling to; make up levels)
[COHERE DEBUG] Item 73: bestMatch = { confidence: 57, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 73, Total confidence: 3959.9798677952563
✅ Match (57%): "Not exceeding 250 average thic..."
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating > Page Total 2000/3/4 > Filling to; make up levels)
📂 [COHERE] Item 74: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating > Page Total 2000/3/4 > Filling to; make up levels)
[COHERE DEBUG] Item 74: bestMatch = { confidence: 54, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 74, Total confidence: 4014.341563611229
✅ Match (54%): "Compacting; bottoms of excavat..."
📂 [COHERE] Category from header: excavation (Page Total 2000/3/4 > Filling to; make up levels > Page Total 2000/3/5)
📂 [COHERE] Item 75: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 2000/3/4 > Filling to; make up levels > Page Total 2000/3/5)
[COHERE DEBUG] Item 75: bestMatch = { confidence: 55, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 75, Total confidence: 4069.834043441559
✅ Match (55%): "Compacting; bottoms of excavat..."
📂 [COHERE] Category from header: excavation (Page Total 2000/3/4 > Filling to; make up levels > Page Total 2000/3/5)
📂 [COHERE] Item 76: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 2000/3/4 > Filling to; make up levels > Page Total 2000/3/5)
[COHERE DEBUG] Item 76: bestMatch = { confidence: 58, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 76, Total confidence: 4127.803005385013
✅ Match (58%): "Compacting; bottoms of excavat..."
📂 [COHERE] Category from header: excavation (Page Total 2000/3/4 > Filling to; make up levels > Page Total 2000/3/5)
📂 [COHERE] Item 77: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 2000/3/4 > Filling to; make up levels > Page Total 2000/3/5)
[COHERE DEBUG] Item 77: bestMatch = { confidence: 56, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 77, Total confidence: 4183.33904015481
✅ Match (56%): "Compacting; bottoms of excavat..."
📂 [COHERE] Category from header: excavation (Page Total 2000/3/4 > Filling to; make up levels > Page Total 2000/3/5)
📂 [COHERE] Item 78: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 2000/3/4 > Filling to; make up levels > Page Total 2000/3/5)
[COHERE DEBUG] Item 78: bestMatch = { confidence: 56, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 78, Total confidence: 4239.377216732895
✅ Match (56%): "Compacting; bottoms of excavat..."
📂 [COHERE] Category from header: excavation (Page Total 2000/3/4 > Filling to; make up levels > Page Total 2000/3/5)
📂 [COHERE] Item 79: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 2000/3/4 > Filling to; make up levels > Page Total 2000/3/5)
[COHERE DEBUG] Item 79: bestMatch = { confidence: 55, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 79, Total confidence: 4294.83136046672
✅ Match (55%): "Compacting; bottoms of excavat..."
📂 [COHERE] Category from header: excavation (Page Total 2000/3/4 > Filling to; make up levels > Page Total 2000/3/5)
📂 [COHERE] Item 80: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 2000/3/4 > Filling to; make up levels > Page Total 2000/3/5)
[COHERE DEBUG] Item 80: bestMatch = { confidence: 57, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 80, Total confidence: 4351.710435068742
✅ Match (57%): "Compacting; bottoms of excavat..."
📂 [COHERE] Category from header: excavation (Page Total 2000/3/4 > Filling to; make up levels > Page Total 2000/3/5)
📂 [COHERE] Item 81: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 2000/3/4 > Filling to; make up levels > Page Total 2000/3/5)
[COHERE DEBUG] Item 81: bestMatch = { confidence: 56, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 81, Total confidence: 4408.01412426596
✅ Match (56%): "Compacting; surface of filling..."
📂 [COHERE] Category from header: excavation (Filling to; make up levels > Page Total 2000/3/5 > Page Total 2000/3/6)
📂 [COHERE] Item 82: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Filling to; make up levels > Page Total 2000/3/5 > Page Total 2000/3/6)
[COHERE DEBUG] Item 82: bestMatch = { confidence: 49, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 82, Total confidence: 4456.965883688174
⚠️  Low confidence (49%): "Not exceeding 150 thick; (Mud ..."
📂 [COHERE] Category from header: excavation (Filling to; make up levels > Page Total 2000/3/5 > Page Total 2000/3/6)
📂 [COHERE] Item 83: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Filling to; make up levels > Page Total 2000/3/5 > Page Total 2000/3/6)
[COHERE DEBUG] Item 83: bestMatch = { confidence: 54, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 83, Total confidence: 4511.176303053117
✅ Match (54%): "Not exceeding 150 thick; (Mud ..."
📂 [COHERE] Category from header: excavation (Filling to; make up levels > Page Total 2000/3/5 > Page Total 2000/3/6)
📂 [COHERE] Item 84: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Filling to; make up levels > Page Total 2000/3/5 > Page Total 2000/3/6)
[COHERE DEBUG] Item 84: bestMatch = { confidence: 50, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 84, Total confidence: 4561.0147203897195
⚠️  Low confidence (50%): "Not exceeding 150 thick; (Mud ..."
📂 [COHERE] Category from header: excavation (Filling to; make up levels > Page Total 2000/3/5 > Page Total 2000/3/6)
📂 [COHERE] Item 85: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Filling to; make up levels > Page Total 2000/3/5 > Page Total 2000/3/6)
[COHERE DEBUG] Item 85: bestMatch = { confidence: 52, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 85, Total confidence: 4612.529360549594
✅ Match (52%): "Not exceeding 150 thick; (Mud ..."
📂 [COHERE] Category from header: excavation (Filling to; make up levels > Page Total 2000/3/5 > Page Total 2000/3/6)
📂 [COHERE] Item 86: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Filling to; make up levels > Page Total 2000/3/5 > Page Total 2000/3/6)
[COHERE DEBUG] Item 86: bestMatch = { confidence: 49, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 86, Total confidence: 4661.984182644565
⚠️  Low confidence (49%): "Not exceeding 150 thick; (Mud ..."
📂 [COHERE] Category from header: excavation (Filling to; make up levels > Page Total 2000/3/5 > Page Total 2000/3/6)
📂 [COHERE] Item 87: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Filling to; make up levels > Page Total 2000/3/5 > Page Total 2000/3/6)
[COHERE DEBUG] Item 87: bestMatch = { confidence: 43, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 87, Total confidence: 4705.1418859249325
⚠️  Low confidence (43%): "Generally..."
📂 [COHERE] Category from header: excavation (Filling to; make up levels > Page Total 2000/3/5 > Page Total 2000/3/6)
📂 [COHERE] Item 88: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Filling to; make up levels > Page Total 2000/3/5 > Page Total 2000/3/6)
[COHERE DEBUG] Item 88: bestMatch = { confidence: 51, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 88, Total confidence: 4755.829859670897
✅ Match (51%): "Generally; (Pile Caps and the ..."
📂 [COHERE] Category from header: excavation (Filling to; make up levels > Page Total 2000/3/5 > Page Total 2000/3/6)
📂 [COHERE] Item 89: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Filling to; make up levels > Page Total 2000/3/5 > Page Total 2000/3/6)
[COHERE DEBUG] Item 89: bestMatch = { confidence: 54, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 89, Total confidence: 4810.173938169739
✅ Match (54%): "Generally; (Pile Cap for Crane..."
📂 [COHERE] Category from header: excavation (Filling to; make up levels > Page Total 2000/3/5 > Page Total 2000/3/6)
📂 [COHERE] Item 90: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Filling to; make up levels > Page Total 2000/3/5 > Page Total 2000/3/6)
[COHERE DEBUG] Item 90: bestMatch = { confidence: 51, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 90, Total confidence: 4861.470696988845
✅ Match (51%): "to 450 thick; (200 thick Main ..."
📂 [COHERE] Category from header: excavation (Filling to; make up levels > Page Total 2000/3/5 > Page Total 2000/3/6)
📂 [COHERE] Item 91: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Filling to; make up levels > Page Total 2000/3/5 > Page Total 2000/3/6)
[COHERE DEBUG] Item 91: bestMatch = { confidence: 51, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 91, Total confidence: 4912.222731770312
✅ Match (51%): "to 450 thick; (200 thick Main ..."
📂 [COHERE] Category from description: structural (score: 0.55)
📂 [COHERE] Item 92: Category = structural (confidence: 0.55)
📂 [COHERE] Category from description: structural (score: 0.55)
[COHERE DEBUG] Item 92: bestMatch = { confidence: 51, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 92, Total confidence: 4963.530759470259
✅ Match (51%): "to 450 thick; (200 thick Link ..."
📂 [COHERE] Category from description: structural (score: 0.55)
📂 [COHERE] Item 93: Category = structural (confidence: 0.55)
📂 [COHERE] Category from description: structural (score: 0.55)
[COHERE DEBUG] Item 93: bestMatch = { confidence: 54, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 93, Total confidence: 5017.491047052368
✅ Match (54%): "to 450 thick; (300 thick Main ..."
📂 [COHERE] Item 94: Category = none (confidence: 0)
[COHERE DEBUG] Item 94: bestMatch = { confidence: 48, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 94, Total confidence: 5065.710792808653
⚠️  Low confidence (48%): "Generally; (250 thick x 357 hi..."
📂 [COHERE] Category from description: masonry (score: 0.56)
📂 [COHERE] Item 95: Category = masonry (confidence: 0.56)
📂 [COHERE] Category from description: masonry (score: 0.56)
[COHERE DEBUG] Item 95: bestMatch = { confidence: 52, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 95, Total confidence: 5117.824340195863
✅ Match (52%): "to 450 thick; (200 thick fomin..."
📂 [COHERE] Item 96: Category = none (confidence: 0)
[COHERE DEBUG] Item 96: bestMatch = { confidence: 58, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 96, Total confidence: 5176.2859770371315
✅ Match (58%): "to 450 thick; (200 thick fming..."
❌ [COHERE MATCH] Failed to update progress for batch 1/6
   🚀 Processing batch 2/6 (96 items)
[COHERE] Using enhanced description: "Page Total 2000/3/9: Rectangular..."
[COHERE] Using enhanced description: "Page Total 2000/3/11: External angles..."
[COHERE] Using enhanced description: "Page Total 2000/3/11: Internal angles..."
[COHERE] Using enhanced description: "Page Total 2000/3/11: External angles..."
[COHERE] Using enhanced description: "Page Total 2000/3/11: Internal angles..."
[COHERE] Using enhanced description: "Page Total 2000/3/11: Intersections..."
[COHERE] Using enhanced description: "Page Total 2000/3/11: External angles..."
[COHERE] Using enhanced description: "Page Total 2000/3/11: Internal angles..."
[COHERE] Using enhanced description: "Page Total 2000/3/11: Intersections..."
[COHERE] Using enhanced description: "Page Total 2000/3/11: External angles..."
[COHERE] Using enhanced description: "Page Total 2000/3/11: Internal angles..."
[COHERE] Using enhanced description: "Page Total 2000/3/11: Intersections..."
[COHERE] Using enhanced description: "Page Total 2000/3/11: External angles..."
[COHERE] Using enhanced description: "Page Total 2000/3/11: Internal angles..."
[COHERE] Using enhanced description: "E41 Worked finishes/Cutting to in situ concrete

Worked fi..."
📂 [COHERE] Category from description: masonry (score: 0.56)
📂 [COHERE] Item 97: Category = masonry (confidence: 0.56)
📂 [COHERE] Category from description: masonry (score: 0.56)
[COHERE DEBUG] Item 97: bestMatch = { confidence: 50, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 97, Total confidence: 5226.194606908868
⚠️  Low confidence (50%): "to 450 thick; (275 thick - Cli..."
📂 [COHERE] Category from description: excavation (score: 0.5428571428571428)
📂 [COHERE] Item 98: Category = excavation (confidence: 0.5428571428571428)
📂 [COHERE] Category from description: excavation (score: 0.5428571428571428)
[COHERE DEBUG] Item 98: bestMatch = { confidence: 55, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 98, Total confidence: 5281.629957831298
✅ Match (55%): "to 450 thick; (200 thick - W1 ..."
📂 [COHERE] Category from description: excavation (score: 0.5428571428571428)
📂 [COHERE] Item 99: Category = excavation (confidence: 0.5428571428571428)
📂 [COHERE] Category from description: excavation (score: 0.5428571428571428)
[COHERE DEBUG] Item 99: bestMatch = { confidence: 56, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 99, Total confidence: 5337.916116252394
✅ Match (56%): "to 450 thick; (250 thick - W2 ..."
📂 [COHERE] Category from description: excavation (score: 0.5428571428571428)
📂 [COHERE] Item 100: Category = excavation (confidence: 0.5428571428571428)
📂 [COHERE] Category from description: excavation (score: 0.5428571428571428)
[COHERE DEBUG] Item 100: bestMatch = { confidence: 56, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 100, Total confidence: 5393.434605593482
✅ Match (56%): "to 450 thick; (300 thick - W3 ..."
📂 [COHERE] Category from description: masonry (score: 0.56)
📂 [COHERE] Item 101: Category = masonry (confidence: 0.56)
📂 [COHERE] Category from description: masonry (score: 0.56)
[COHERE DEBUG] Item 101: bestMatch = { confidence: 47, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 101, Total confidence: 5440.5451775295705
⚠️  Low confidence (47%): "to 450 thick; (Projections to ..."
📂 [COHERE] Item 102: Category = none (confidence: 0)
[COHERE DEBUG] Item 102: bestMatch = { confidence: 43, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 102, Total confidence: 5483.865305281218
⚠️  Low confidence (43%): "Generally; (150 thick x 350 hi..."
📂 [COHERE] Item 103: Category = none (confidence: 0)
[COHERE DEBUG] Item 103: bestMatch = { confidence: 46, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 103, Total confidence: 5529.7594131768055
⚠️  Low confidence (46%): "Generally; (250 thick x 150 hi..."
📂 [COHERE] Item 104: Category = none (confidence: 0)
[COHERE DEBUG] Item 104: bestMatch = { confidence: 45, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 104, Total confidence: 5574.291906242147
⚠️  Low confidence (45%): "Generally; (250 thick x 350 hi..."
📂 [COHERE] Item 105: Category = none (confidence: 0)
[COHERE DEBUG] Item 105: bestMatch = { confidence: 47, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 105, Total confidence: 5621.747890322159
⚠️  Low confidence (47%): "Generally; (250 thick x 357 hi..."
📂 [COHERE] Item 106: Category = none (confidence: 0)
[COHERE DEBUG] Item 106: bestMatch = { confidence: 46, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 106, Total confidence: 5667.648290151705
⚠️  Low confidence (46%): "Generally; (300 thick x 350 hi..."
📂 [COHERE] Item 107: Category = none (confidence: 0)
[COHERE DEBUG] Item 107: bestMatch = { confidence: 35, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 107, Total confidence: 5702.521700791028
⚠️  Low confidence (35%): "Generally; (Projections to Ups..."
📂 [COHERE] Category from header: concrete (Page Total 2000/3/7 > Page Total 2000/3/8 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations)
📂 [COHERE] Item 108: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/3/7 > Page Total 2000/3/8 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations)
[COHERE DEBUG] Item 108: bestMatch = { confidence: 52, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 108, Total confidence: 5754.714029282784
✅ Match (52%): "to 1m high; (Isolated Pile Cap..."
📂 [COHERE] Category from header: concrete (Page Total 2000/3/7 > Page Total 2000/3/8 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations)
📂 [COHERE] Item 109: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/3/7 > Page Total 2000/3/8 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations)
[COHERE DEBUG] Item 109: bestMatch = { confidence: 55, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 109, Total confidence: 5809.654330351909
✅ Match (55%): "Over 1m high; (Pile Cap at CRA..."
📂 [COHERE] Category from header: concrete (Page Total 2000/3/7 > Page Total 2000/3/8 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations)
📂 [COHERE] Item 110: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/3/7 > Page Total 2000/3/8 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations)
[COHERE DEBUG] Item 110: bestMatch = { confidence: 56, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 110, Total confidence: 5865.26869465988
✅ Match (56%): "Not exceeding 250 high; (Edge ..."
📂 [COHERE] Category from header: concrete (Page Total 2000/3/7 > Page Total 2000/3/8 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations)
📂 [COHERE] Item 111: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/3/7 > Page Total 2000/3/8 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations)
[COHERE DEBUG] Item 111: bestMatch = { confidence: 54, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 111, Total confidence: 5919.048558853467
✅ Match (54%): "Not exceeding 250 high; (Edge ..."
📂 [COHERE] Category from header: concrete (Page Total 2000/3/7 > Page Total 2000/3/8 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations)
📂 [COHERE] Item 112: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/3/7 > Page Total 2000/3/8 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations)
[COHERE DEBUG] Item 112: bestMatch = { confidence: 56, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 112, Total confidence: 5975.157617169886
✅ Match (56%): "to 500 high; (Edge of 275 thic..."
📂 [COHERE] Category from header: concrete (Page Total 2000/3/7 > Page Total 2000/3/8 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations)
📂 [COHERE] Item 113: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/3/7 > Page Total 2000/3/8 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations)
[COHERE DEBUG] Item 113: bestMatch = { confidence: 56, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 113, Total confidence: 6031.145882840493
✅ Match (56%): "Not exceeding 250 high; (Edge ..."
📂 [COHERE] Category from header: concrete (Page Total 2000/3/7 > Page Total 2000/3/8 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations)
📂 [COHERE] Item 114: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/3/7 > Page Total 2000/3/8 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations)
[COHERE DEBUG] Item 114: bestMatch = { confidence: 58, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 114, Total confidence: 6088.824847456873
✅ Match (58%): "to 500 high; (Edge of 300 thic..."
📂 [COHERE] Category from header: concrete (Page Total 2000/3/7 > Page Total 2000/3/8 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations)
📂 [COHERE] Item 115: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/3/7 > Page Total 2000/3/8 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations)
[COHERE DEBUG] Item 115: bestMatch = { confidence: 55, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 115, Total confidence: 6143.703628381127
✅ Match (55%): "to 500 high;(Edge of 300 thick..."
📂 [COHERE] Category from header: concrete (Page Total 2000/3/7 > Page Total 2000/3/8 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations)
📂 [COHERE] Item 116: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/3/7 > Page Total 2000/3/8 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations)
[COHERE DEBUG] Item 116: bestMatch = { confidence: 56, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 116, Total confidence: 6199.948537162342
✅ Match (56%): "to 1 m high; (Sides of Ground ..."
📂 [COHERE] Category from header: concrete (Page Total 2000/3/7 > Page Total 2000/3/8 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations)
📂 [COHERE] Item 117: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/3/7 > Page Total 2000/3/8 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations)
[COHERE DEBUG] Item 117: bestMatch = { confidence: 57, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 117, Total confidence: 6256.6775330139435
✅ Match (57%): "Not exceeding 250 high; (250 x..."
📂 [COHERE] Category from header: concrete (Page Total 2000/3/8 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations > Page Total 2000/3/9)
📂 [COHERE] Item 118: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/3/8 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations > Page Total 2000/3/9)
[COHERE DEBUG] Item 118: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 118, Total confidence: 6309.8366009064575
✅ Match (53%): "Not exceeding 250 igh; (150 hi..."
📂 [COHERE] Category from header: concrete (Page Total 2000/3/8 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations > Page Total 2000/3/9)
📂 [COHERE] Item 119: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/3/8 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations > Page Total 2000/3/9)
[COHERE DEBUG] Item 119: bestMatch = { confidence: 59, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 119, Total confidence: 6368.903187115268
✅ Match (59%): "to 500 high; (250 thick x 357 ..."
📂 [COHERE] Category from header: concrete (Page Total 2000/3/8 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations > Page Total 2000/3/9)
📂 [COHERE] Item 120: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/3/8 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations > Page Total 2000/3/9)
[COHERE DEBUG] Item 120: bestMatch = { confidence: 63, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 120, Total confidence: 6432.126082998813
✅ Match (63%): "to 500 high; (250 x 357 high -..."
📂 [COHERE] Category from header: concrete (Page Total 2000/3/8 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations > Page Total 2000/3/9)
📂 [COHERE] Item 121: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/3/8 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations > Page Total 2000/3/9)
[COHERE DEBUG] Item 121: bestMatch = { confidence: 55, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 121, Total confidence: 6487.459450973401
✅ Match (55%): "to 500 high; (357 high forming..."
📂 [COHERE] Category from header: concrete (Page Total 2000/3/8 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations > Page Total 2000/3/9)
📂 [COHERE] Item 122: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/3/8 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations > Page Total 2000/3/9)
[COHERE DEBUG] Item 122: bestMatch = { confidence: 55, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 122, Total confidence: 6542.431918457656
✅ Match (55%): "to 500 high; (150 x 350 high -..."
📂 [COHERE] Category from header: concrete (Page Total 2000/3/8 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations > Page Total 2000/3/9)
📂 [COHERE] Item 123: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/3/8 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations > Page Total 2000/3/9)
[COHERE DEBUG] Item 123: bestMatch = { confidence: 62, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 123, Total confidence: 6603.968922417067
✅ Match (62%): "to 500 high; (250 x 350 high -..."
📂 [COHERE] Category from header: concrete (Page Total 2000/3/8 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations > Page Total 2000/3/9)
📂 [COHERE] Item 124: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/3/8 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations > Page Total 2000/3/9)
[COHERE DEBUG] Item 124: bestMatch = { confidence: 59, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 124, Total confidence: 6663.2348345992805
✅ Match (59%): "to 500 high; (300 x 350 high -..."
📂 [COHERE] Category from header: concrete (Page Total 2000/3/8 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations > Page Total 2000/3/9)
📂 [COHERE] Item 125: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/3/8 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations > Page Total 2000/3/9)
[COHERE DEBUG] Item 125: bestMatch = { confidence: 56, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 125, Total confidence: 6719.164320083587
✅ Match (56%): "to 500 high; (350 high forming..."
📂 [COHERE] Category from header: concrete (Page Total 2000/3/8 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations > Page Total 2000/3/9)
📂 [COHERE] Item 126: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/3/8 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations > Page Total 2000/3/9)
[COHERE DEBUG] Item 126: bestMatch = { confidence: 52, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 126, Total confidence: 6771.178853546682
✅ Match (52%): "Vertical; to both sides; (both..."
📂 [COHERE] Category from header: concrete (Page Total 2000/3/8 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations > Page Total 2000/3/9)
📂 [COHERE] Item 127: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/3/8 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations > Page Total 2000/3/9)
[COHERE DEBUG] Item 127: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 127, Total confidence: 6824.052934542859
✅ Match (53%): "Vertical; to both sides; (both..."
📂 [COHERE] Category from header: concrete (Page Total 2000/3/8 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations > Page Total 2000/3/9)
📂 [COHERE] Item 128: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/3/8 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations > Page Total 2000/3/9)
[COHERE DEBUG] Item 128: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 128, Total confidence: 6876.824283064056
✅ Match (53%): "Vertical; to both sides; (both..."
📂 [COHERE] Category from header: concrete (Page Total 2000/3/8 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations > Page Total 2000/3/9)
📂 [COHERE] Item 129: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/3/8 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations > Page Total 2000/3/9)
[COHERE DEBUG] Item 129: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 129, Total confidence: 6929.490198107879
✅ Match (53%): "Rectangular..."
📂 [COHERE] Category from header: concrete (Page Total 2000/3/8 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations > Page Total 2000/3/9)
📂 [COHERE] Item 130: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/3/8 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations > Page Total 2000/3/9)
[COHERE DEBUG] Item 130: bestMatch = { confidence: 52, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 130, Total confidence: 6981.5328705639795
✅ Match (52%): "Suspended both sides; 150 high..."
📂 [COHERE] Category from header: concrete (Page Total 2000/3/8 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations > Page Total 2000/3/9)
📂 [COHERE] Item 131: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/3/8 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations > Page Total 2000/3/9)
[COHERE DEBUG] Item 131: bestMatch = { confidence: 54, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 131, Total confidence: 7035.236083602742
✅ Match (54%): "Suspended one side; 150 high -..."
📂 [COHERE] Category from header: concrete (Page Total 2000/3/8 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations > Page Total 2000/3/9)
📂 [COHERE] Item 132: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/3/8 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations > Page Total 2000/3/9)
[COHERE DEBUG] Item 132: bestMatch = { confidence: 55, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 132, Total confidence: 7089.9624060999695
✅ Match (55%): "Suspended both sides; 150 high..."
📂 [COHERE] Category from header: concrete (Page Total 2000/3/8 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations > Page Total 2000/3/9)
📂 [COHERE] Item 133: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/3/8 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations > Page Total 2000/3/9)
[COHERE DEBUG] Item 133: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 133, Total confidence: 7143.047255895455
✅ Match (53%): "Suspended both sides; 150 high..."
📂 [COHERE] Category from header: concrete (Page Total 2000/3/9 > Page Total 2000/3/10 > E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars)
📂 [COHERE] Item 134: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/3/9 > Page Total 2000/3/10 > E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars)
[COHERE DEBUG] Item 134: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 134, Total confidence: 7195.867119454616
✅ Match (53%): "Variable nominal size; straigh..."
📂 [COHERE] Category from header: concrete (Page Total 2000/3/9 > Page Total 2000/3/10 > E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars)
📂 [COHERE] Item 135: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/3/9 > Page Total 2000/3/10 > E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars)
[COHERE DEBUG] Item 135: bestMatch = { confidence: 56, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 135, Total confidence: 7251.540508211014
✅ Match (56%): "Variable nominal size; straigh..."
📂 [COHERE] Category from header: concrete (Page Total 2000/3/9 > Page Total 2000/3/10 > E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars)
📂 [COHERE] Item 136: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/3/9 > Page Total 2000/3/10 > E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars)
[COHERE DEBUG] Item 136: bestMatch = { confidence: 56, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 136, Total confidence: 7307.763860547671
✅ Match (56%): "Variable nominal size; straigh..."
📂 [COHERE] Category from header: concrete (Page Total 2000/3/9 > Page Total 2000/3/10 > E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars)
📂 [COHERE] Item 137: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/3/9 > Page Total 2000/3/10 > E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars)
[COHERE DEBUG] Item 137: bestMatch = { confidence: 56, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 137, Total confidence: 7364.17871638129
✅ Match (56%): "Variable nominal size; straigh..."
📂 [COHERE] Category from header: concrete (Page Total 2000/3/9 > Page Total 2000/3/10 > E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars)
📂 [COHERE] Item 138: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/3/9 > Page Total 2000/3/10 > E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars)
[COHERE DEBUG] Item 138: bestMatch = { confidence: 52, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 138, Total confidence: 7415.7545368880965
✅ Match (52%): "Variable nominal size; straigh..."
📂 [COHERE] Category from header: concrete (Page Total 2000/3/9 > Page Total 2000/3/10 > E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars)
📂 [COHERE] Item 139: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/3/9 > Page Total 2000/3/10 > E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars)
[COHERE DEBUG] Item 139: bestMatch = { confidence: 52, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 139, Total confidence: 7467.549161266916
✅ Match (52%): "Variable nominal size; straigh..."
📂 [COHERE] Category from header: concrete (Page Total 2000/3/9 > Page Total 2000/3/10 > E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars)
📂 [COHERE] Item 140: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/3/9 > Page Total 2000/3/10 > E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars)
[COHERE DEBUG] Item 140: bestMatch = { confidence: 54, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 140, Total confidence: 7521.864249635864
✅ Match (54%): "Variable nominal size; straigh..."
📂 [COHERE] Category from header: concrete (Page Total 2000/3/9 > Page Total 2000/3/10 > E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars)
📂 [COHERE] Item 141: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/3/9 > Page Total 2000/3/10 > E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars)
[COHERE DEBUG] Item 141: bestMatch = { confidence: 50, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 141, Total confidence: 7571.826051120986
⚠️  Low confidence (50%): "Variable nominal size; straigh..."
📂 [COHERE] Category from header: concrete (Page Total 2000/3/10 > E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars > E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain)
📂 [COHERE] Item 142: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/3/10 > E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars > E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain)
[COHERE DEBUG] Item 142: bestMatch = { confidence: 58, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 142, Total confidence: 7629.327857063317
✅ Match (58%): "300 wide; (200 thick slab) - P..."
📂 [COHERE] Category from header: concrete (Page Total 2000/3/10 > E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars > E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain)
📂 [COHERE] Item 143: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/3/10 > E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars > E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain)
[COHERE DEBUG] Item 143: bestMatch = { confidence: 57, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 143, Total confidence: 7685.900943064829
✅ Match (57%): "400 wide; (300 thick slab) - P..."
📂 [COHERE] Category from header: concrete (Page Total 2000/3/10 > E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars > E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain)
📂 [COHERE] Item 144: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/3/10 > E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars > E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain)
[COHERE DEBUG] Item 144: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 144, Total confidence: 7739.2072700969275
✅ Match (53%): "to 300 wide; horizontal; (200 ..."
📂 [COHERE] Category from header: concrete (E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars > E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain > Page Total 2000/3/11)
📂 [COHERE] Item 145: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars > E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain > Page Total 2000/3/11)
[COHERE DEBUG] Item 145: bestMatch = { confidence: 50, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 145, Total confidence: 7789.655725764829
✅ Match (50%): "External angles..."
📂 [COHERE] Category from header: concrete (E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars > E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain > Page Total 2000/3/11)
📂 [COHERE] Item 146: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars > E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain > Page Total 2000/3/11)
[COHERE DEBUG] Item 146: bestMatch = { confidence: 49, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 146, Total confidence: 7838.967205414985
⚠️  Low confidence (49%): "Internal angles..."
📂 [COHERE] Category from header: concrete (E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars > E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain > Page Total 2000/3/11)
📂 [COHERE] Item 147: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars > E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain > Page Total 2000/3/11)
[COHERE DEBUG] Item 147: bestMatch = { confidence: 54, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 147, Total confidence: 7892.4818282866845
✅ Match (54%): "to 300 wide; horizontal; (250 ..."
📂 [COHERE] Category from header: concrete (E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars > E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain > Page Total 2000/3/11)
📂 [COHERE] Item 148: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars > E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain > Page Total 2000/3/11)
[COHERE DEBUG] Item 148: bestMatch = { confidence: 50, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 148, Total confidence: 7942.930283954586
✅ Match (50%): "External angles..."
📂 [COHERE] Category from header: concrete (E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars > E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain > Page Total 2000/3/11)
📂 [COHERE] Item 149: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars > E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain > Page Total 2000/3/11)
[COHERE DEBUG] Item 149: bestMatch = { confidence: 49, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 149, Total confidence: 7992.241763604742
⚠️  Low confidence (49%): "Internal angles..."
📂 [COHERE] Category from header: concrete (E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars > E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain > Page Total 2000/3/11)
📂 [COHERE] Item 150: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars > E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain > Page Total 2000/3/11)
[COHERE DEBUG] Item 150: bestMatch = { confidence: 51, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 150, Total confidence: 8043.05411452696
✅ Match (51%): "Intersections..."
📂 [COHERE] Category from header: concrete (E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars > E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain > Page Total 2000/3/11)
📂 [COHERE] Item 151: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars > E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain > Page Total 2000/3/11)
[COHERE DEBUG] Item 151: bestMatch = { confidence: 54, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 151, Total confidence: 8097.281513216238
✅ Match (54%): "to 300 wide; horizontal; (250 ..."
📂 [COHERE] Category from header: concrete (E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars > E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain > Page Total 2000/3/11)
📂 [COHERE] Item 152: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars > E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain > Page Total 2000/3/11)
[COHERE DEBUG] Item 152: bestMatch = { confidence: 50, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 152, Total confidence: 8147.729968884139
✅ Match (50%): "External angles..."
📂 [COHERE] Category from header: concrete (E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars > E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain > Page Total 2000/3/11)
📂 [COHERE] Item 153: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars > E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain > Page Total 2000/3/11)
[COHERE DEBUG] Item 153: bestMatch = { confidence: 49, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 153, Total confidence: 8197.041448534295
⚠️  Low confidence (49%): "Internal angles..."
📂 [COHERE] Category from header: concrete (E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars > E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain > Page Total 2000/3/11)
📂 [COHERE] Item 154: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars > E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain > Page Total 2000/3/11)
[COHERE DEBUG] Item 154: bestMatch = { confidence: 51, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 154, Total confidence: 8247.853799456512
✅ Match (51%): "Intersections..."
📂 [COHERE] Category from header: concrete (E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars > E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain > Page Total 2000/3/11)
📂 [COHERE] Item 155: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars > E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain > Page Total 2000/3/11)
[COHERE DEBUG] Item 155: bestMatch = { confidence: 54, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 155, Total confidence: 8301.956253030829
✅ Match (54%): "to 300 wide; horizontal; (300 ..."
📂 [COHERE] Category from header: concrete (E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars > E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain > Page Total 2000/3/11)
📂 [COHERE] Item 156: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars > E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain > Page Total 2000/3/11)
[COHERE DEBUG] Item 156: bestMatch = { confidence: 50, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 156, Total confidence: 8352.40470869873
✅ Match (50%): "External angles..."
📂 [COHERE] Category from header: concrete (E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars > E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain > Page Total 2000/3/11)
📂 [COHERE] Item 157: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars > E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain > Page Total 2000/3/11)
[COHERE DEBUG] Item 157: bestMatch = { confidence: 49, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 157, Total confidence: 8401.716188348886
⚠️  Low confidence (49%): "Internal angles..."
📂 [COHERE] Category from header: concrete (E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars > E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain > Page Total 2000/3/11)
📂 [COHERE] Item 158: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars > E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain > Page Total 2000/3/11)
[COHERE DEBUG] Item 158: bestMatch = { confidence: 51, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 158, Total confidence: 8452.528539271103
✅ Match (51%): "Intersections..."
📂 [COHERE] Category from header: concrete (E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars > E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain > Page Total 2000/3/11)
📂 [COHERE] Item 159: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars > E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain > Page Total 2000/3/11)
[COHERE DEBUG] Item 159: bestMatch = { confidence: 56, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 159, Total confidence: 8508.905279202074
✅ Match (56%): "to 300 wide; horizontal; (300 ..."
📂 [COHERE] Category from header: concrete (E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars > E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain > Page Total 2000/3/11)
📂 [COHERE] Item 160: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars > E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain > Page Total 2000/3/11)
[COHERE DEBUG] Item 160: bestMatch = { confidence: 50, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 160, Total confidence: 8559.353734869976
✅ Match (50%): "External angles..."
📂 [COHERE] Category from header: concrete (E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars > E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain > Page Total 2000/3/11)
📂 [COHERE] Item 161: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars > E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain > Page Total 2000/3/11)
[COHERE DEBUG] Item 161: bestMatch = { confidence: 49, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 161, Total confidence: 8608.665214520131
⚠️  Low confidence (49%): "Internal angles..."
📂 [COHERE] Category from header: excavation (E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain > Page Total 2000/3/11 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
📂 [COHERE] Item 162: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain > Page Total 2000/3/11 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
[COHERE DEBUG] Item 162: bestMatch = { confidence: 51, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 162, Total confidence: 8659.439405116153
✅ Match (51%): "Generally; (Mud mat - below Ma..."
📂 [COHERE] Category from header: excavation (E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain > Page Total 2000/3/11 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
📂 [COHERE] Item 163: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain > Page Total 2000/3/11 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
[COHERE DEBUG] Item 163: bestMatch = { confidence: 50, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 163, Total confidence: 8709.599730922633
✅ Match (50%): "Generally; (Mud mat - below Is..."
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/3/12 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
📂 [COHERE] Item 164: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/3/12 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
[COHERE DEBUG] Item 164: bestMatch = { confidence: 50, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 164, Total confidence: 8759.112200980286
⚠️  Low confidence (50%): "Generally; (Mud mat - below Gr..."
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/3/12 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
📂 [COHERE] Item 165: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/3/12 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
[COHERE DEBUG] Item 165: bestMatch = { confidence: 48, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 165, Total confidence: 8807.606084119498
⚠️  Low confidence (48%): "Generally; (Mud mat - below Se..."
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/3/12 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
📂 [COHERE] Item 166: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/3/12 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
[COHERE DEBUG] Item 166: bestMatch = { confidence: 47, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 166, Total confidence: 8854.170433829291
⚠️  Low confidence (47%): "Generally; (Mud mat - below Cr..."
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/3/12 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
📂 [COHERE] Item 167: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/3/12 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
[COHERE DEBUG] Item 167: bestMatch = { confidence: 47, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 167, Total confidence: 8900.843651138819
⚠️  Low confidence (47%): "Generally; (Top of 200 thick M..."
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/3/12 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
📂 [COHERE] Item 168: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/3/12 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
[COHERE DEBUG] Item 168: bestMatch = { confidence: 49, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 168, Total confidence: 8949.498219874664
⚠️  Low confidence (49%): "Generally; (Top of 200 thick S..."
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/3/12 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
📂 [COHERE] Item 169: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/3/12 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
[COHERE DEBUG] Item 169: bestMatch = { confidence: 46, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 169, Total confidence: 8995.792714170415
⚠️  Low confidence (46%): "Generally; (Top of 300 thick M..."
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/3/12 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
📂 [COHERE] Item 170: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/3/12 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
[COHERE DEBUG] Item 170: bestMatch = { confidence: 48, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 170, Total confidence: 9043.380568614375
⚠️  Low confidence (48%): "Generally; (Top of Isolated Pi..."
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/3/12 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
📂 [COHERE] Item 171: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/3/12 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
[COHERE DEBUG] Item 171: bestMatch = { confidence: 50, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 171, Total confidence: 9092.964417402769
⚠️  Low confidence (50%): "Generally; (Top of Ground Beam..."
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/3/12 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
📂 [COHERE] Item 172: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/3/12 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
[COHERE DEBUG] Item 172: bestMatch = { confidence: 51, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 172, Total confidence: 9144.355696509067
✅ Match (51%): "Generally; (Top of Upstands)..."
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/3/12 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
📂 [COHERE] Item 173: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/3/12 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
[COHERE DEBUG] Item 173: bestMatch = { confidence: 49, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 173, Total confidence: 9192.901861292417
⚠️  Low confidence (49%): "Generally; (Top of 250 & 300 w..."
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/3/12 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
📂 [COHERE] Item 174: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/3/12 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
[COHERE DEBUG] Item 174: bestMatch = { confidence: 46, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 174, Total confidence: 9239.001609950972
⚠️  Low confidence (46%): "Generally; (Top of Crane Base)..."
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/3/12 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
📂 [COHERE] Item 175: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/3/12 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
[COHERE DEBUG] Item 175: bestMatch = { confidence: 49, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 175, Total confidence: 9288.013219400676
⚠️  Low confidence (49%): "Generally; (Top of 200 thick M..."
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/3/12 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
📂 [COHERE] Item 176: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/3/12 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
[COHERE DEBUG] Item 176: bestMatch = { confidence: 49, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 176, Total confidence: 9336.513814378906
⚠️  Low confidence (49%): "Generally; (Top of 300 thick M..."
📂 [COHERE] Category from header: excavation (Page Total 2000/3/12 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/3/13)
📂 [COHERE] Item 177: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 2000/3/12 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/3/13)
[COHERE DEBUG] Item 177: bestMatch = { confidence: 51, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 177, Total confidence: 9387.616328787668
✅ Match (51%): "Not exceeding 150 thick; (Thic..."
📂 [COHERE] Category from header: excavation (Page Total 2000/3/12 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/3/13)
📂 [COHERE] Item 178: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 2000/3/12 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/3/13)
[COHERE DEBUG] Item 178: bestMatch = { confidence: 51, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 178, Total confidence: 9438.614837673373
✅ Match (51%): "Not exceeding 150 thick; (Thic..."
📂 [COHERE] Category from header: excavation (Page Total 2000/3/12 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/3/13)
📂 [COHERE] Item 179: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 2000/3/12 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/3/13)
[COHERE DEBUG] Item 179: bestMatch = { confidence: 51, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 179, Total confidence: 9489.617419982209
✅ Match (51%): "Not exceeding 150 thick; (Thic..."
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/3/13 > E20 Formwork for in situ concrete

Formwork; Basic finish at the discretion of contractor

Sides of ground beams and edges of beds)
📂 [COHERE] Item 180: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/3/13 > E20 Formwork for in situ concrete

Formwork; Basic finish at the discretion of contractor

Sides of ground beams and edges of beds)
[COHERE DEBUG] Item 180: bestMatch = { confidence: 61, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 180, Total confidence: 9550.278843301265
✅ Match (61%): "Not exceeding 250 high; (Assum..."
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/3/13 > E20 Formwork for in situ concrete

Formwork; Basic finish at the discretion of contractor

Sides of ground beams and edges of beds)
📂 [COHERE] Item 181: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/3/13 > E20 Formwork for in situ concrete

Formwork; Basic finish at the discretion of contractor

Sides of ground beams and edges of beds)
[COHERE DEBUG] Item 181: bestMatch = { confidence: 62, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 181, Total confidence: 9612.757593578088
✅ Match (62%): "Not exceeding 250 high; (Assum..."
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/3/13 > E20 Formwork for in situ concrete

Formwork; Basic finish at the discretion of contractor

Sides of ground beams and edges of beds)
📂 [COHERE] Item 182: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/3/13 > E20 Formwork for in situ concrete

Formwork; Basic finish at the discretion of contractor

Sides of ground beams and edges of beds)
[COHERE DEBUG] Item 182: bestMatch = { confidence: 62, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 182, Total confidence: 9675.179119938617
✅ Match (62%): "Not exceeding 250 high; (Assum..."
📂 [COHERE] Category from header: excavation (Page Total 2000/3/13 > E20 Formwork for in situ concrete

Formwork; Basic finish at the discretion of contractor

Sides of ground beams and edges of beds > E41 Worked finishes/Cutting to in situ concrete

Worked finishes; as Spec E41

Trowelling)
📂 [COHERE] Item 183: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 2000/3/13 > E20 Formwork for in situ concrete

Formwork; Basic finish at the discretion of contractor

Sides of ground beams and edges of beds > E41 Worked finishes/Cutting to in situ concrete

Worked finishes; as Spec E41

Trowelling)
[COHERE DEBUG] Item 183: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 183, Total confidence: 9727.763844102577
✅ Match (53%): "Generally; (Top of high streng..."
📂 [COHERE] Category from header: excavation (Page Total 2000/3/13 > E20 Formwork for in situ concrete

Formwork; Basic finish at the discretion of contractor

Sides of ground beams and edges of beds > E41 Worked finishes/Cutting to in situ concrete

Worked finishes; as Spec E41

Trowelling)
📂 [COHERE] Item 184: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 2000/3/13 > E20 Formwork for in situ concrete

Formwork; Basic finish at the discretion of contractor

Sides of ground beams and edges of beds > E41 Worked finishes/Cutting to in situ concrete

Worked finishes; as Spec E41

Trowelling)
[COHERE DEBUG] Item 184: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 184, Total confidence: 9781.145114881516
✅ Match (53%): "Generally; (Top of high streng..."
📂 [COHERE] Category from header: excavation (Page Total 2000/3/13 > E20 Formwork for in situ concrete

Formwork; Basic finish at the discretion of contractor

Sides of ground beams and edges of beds > E41 Worked finishes/Cutting to in situ concrete

Worked finishes; as Spec E41

Trowelling)
📂 [COHERE] Item 185: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 2000/3/13 > E20 Formwork for in situ concrete

Formwork; Basic finish at the discretion of contractor

Sides of ground beams and edges of beds > E41 Worked finishes/Cutting to in situ concrete

Worked finishes; as Spec E41

Trowelling)
[COHERE DEBUG] Item 185: bestMatch = { confidence: 54, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 185, Total confidence: 9834.95050912766
✅ Match (54%): "Generally; (Top of high streng..."
📂 [COHERE] Category from header: excavation (E20 Formwork for in situ concrete

Formwork; Basic finish at the discretion of contractor

Sides of ground beams and edges of beds > E41 Worked finishes/Cutting to in situ concrete

Worked finishes; as Spec E41

Trowelling > Page Total 2000/3/16)
📂 [COHERE] Item 186: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E20 Formwork for in situ concrete

Formwork; Basic finish at the discretion of contractor

Sides of ground beams and edges of beds > E41 Worked finishes/Cutting to in situ concrete

Worked finishes; as Spec E41

Trowelling > Page Total 2000/3/16)
[COHERE DEBUG] Item 186: bestMatch = { confidence: 54, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 186, Total confidence: 9889.202878390877
✅ Match (54%): "Horizontal; to insulation; (Ma..."
📂 [COHERE] Category from header: excavation (E20 Formwork for in situ concrete

Formwork; Basic finish at the discretion of contractor

Sides of ground beams and edges of beds > E41 Worked finishes/Cutting to in situ concrete

Worked finishes; as Spec E41

Trowelling > Page Total 2000/3/16)
📂 [COHERE] Item 187: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E20 Formwork for in situ concrete

Formwork; Basic finish at the discretion of contractor

Sides of ground beams and edges of beds > E41 Worked finishes/Cutting to in situ concrete

Worked finishes; as Spec E41

Trowelling > Page Total 2000/3/16)
[COHERE DEBUG] Item 187: bestMatch = { confidence: 54, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 187, Total confidence: 9943.416171107354
✅ Match (54%): "Horizontal; to insulation; Wit..."
📂 [COHERE] Category from header: excavation (E20 Formwork for in situ concrete

Formwork; Basic finish at the discretion of contractor

Sides of ground beams and edges of beds > E41 Worked finishes/Cutting to in situ concrete

Worked finishes; as Spec E41

Trowelling > Page Total 2000/3/16)
📂 [COHERE] Item 188: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E20 Formwork for in situ concrete

Formwork; Basic finish at the discretion of contractor

Sides of ground beams and edges of beds > E41 Worked finishes/Cutting to in situ concrete

Worked finishes; as Spec E41

Trowelling > Page Total 2000/3/16)
[COHERE DEBUG] Item 188: bestMatch = { confidence: 56, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 188, Total confidence: 9999.262296448795
✅ Match (56%): "Horizontal and vertical angles..."
📂 [COHERE] Category from header: excavation (E20 Formwork for in situ concrete

Formwork; Basic finish at the discretion of contractor

Sides of ground beams and edges of beds > E41 Worked finishes/Cutting to in situ concrete

Worked finishes; as Spec E41

Trowelling > Page Total 2000/3/16)
📂 [COHERE] Item 189: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E20 Formwork for in situ concrete

Formwork; Basic finish at the discretion of contractor

Sides of ground beams and edges of beds > E41 Worked finishes/Cutting to in situ concrete

Worked finishes; as Spec E41

Trowelling > Page Total 2000/3/16)
[COHERE DEBUG] Item 189: bestMatch = { confidence: 54, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 189, Total confidence: 10053.33089599722
✅ Match (54%): "Horizontal; to concrete (Mudma..."
📂 [COHERE] Category from header: excavation (E20 Formwork for in situ concrete

Formwork; Basic finish at the discretion of contractor

Sides of ground beams and edges of beds > E41 Worked finishes/Cutting to in situ concrete

Worked finishes; as Spec E41

Trowelling > Page Total 2000/3/16)
📂 [COHERE] Item 190: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E20 Formwork for in situ concrete

Formwork; Basic finish at the discretion of contractor

Sides of ground beams and edges of beds > E41 Worked finishes/Cutting to in situ concrete

Worked finishes; as Spec E41

Trowelling > Page Total 2000/3/16)
[COHERE DEBUG] Item 190: bestMatch = { confidence: 55, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 190, Total confidence: 10108.54156171486
✅ Match (55%): "Horizontal; to concrete (Mudma..."
📂 [COHERE] Category from header: excavation (E20 Formwork for in situ concrete

Formwork; Basic finish at the discretion of contractor

Sides of ground beams and edges of beds > E41 Worked finishes/Cutting to in situ concrete

Worked finishes; as Spec E41

Trowelling > Page Total 2000/3/16)
📂 [COHERE] Item 191: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E20 Formwork for in situ concrete

Formwork; Basic finish at the discretion of contractor

Sides of ground beams and edges of beds > E41 Worked finishes/Cutting to in situ concrete

Worked finishes; as Spec E41

Trowelling > Page Total 2000/3/16)
[COHERE DEBUG] Item 191: bestMatch = { confidence: 54, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 191, Total confidence: 10162.399782883182
✅ Match (54%): "Horizontal; to concrete (Mudma..."
📂 [COHERE] Category from header: excavation (E20 Formwork for in situ concrete

Formwork; Basic finish at the discretion of contractor

Sides of ground beams and edges of beds > E41 Worked finishes/Cutting to in situ concrete

Worked finishes; as Spec E41

Trowelling > Page Total 2000/3/16)
📂 [COHERE] Item 192: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E20 Formwork for in situ concrete

Formwork; Basic finish at the discretion of contractor

Sides of ground beams and edges of beds > E41 Worked finishes/Cutting to in situ concrete

Worked finishes; as Spec E41

Trowelling > Page Total 2000/3/16)
[COHERE DEBUG] Item 192: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 192, Total confidence: 10215.140091652782
✅ Match (53%): "Horizontal; to concrete (Mudma..."
❌ [COHERE MATCH] Failed to update progress for batch 2/6
   🚀 Processing batch 3/6 (96 items)
[COHERE] Using enhanced description: "Extra over excavation irrespective of depth for excavating: ..."
[COHERE] Using enhanced description: "Extra over excavation irrespective of depth for excavating: ..."
[COHERE] Using enhanced description: "Page Total 2000/4/3: Ground water..."
[COHERE] Using enhanced description: "Page Total 2000/4/3: Surface water..."
[COHERE] Using enhanced description: "Page Total 2000/4/3: Off site..."
[COHERE] Using enhanced description: "Page Total 2000/4/3: On site spoil heaps..."
[COHERE] Using enhanced description: "Page Total 2000/4/6: Brick footings course x 3..."
[COHERE] Using enhanced description: "Page Total 2000/4/6: thick brickwork..."
[COHERE] Using enhanced description: "Page Total 2000/4/6: Ground water..."
[COHERE] Using enhanced description: "Page Total 2000/4/6: Surface water..."
[COHERE] Using enhanced description: "Page Total 2000/4/6: Off site..."
[COHERE] Using enhanced description: "Page Total 2000/4/6: Generally..."
[COHERE] Using enhanced description: "Plain insitu concrete; Gen 1; 20mm aggregate; as Engineers S..."
[COHERE] Using enhanced description: "Page Total 2000/4/7: Not exceeding 250 high..."
[COHERE] Using enhanced description: "Page Total 2000/4/8: Generally..."
[COHERE] Using enhanced description: "Page Total 2000/4/9: Generally; (Service Pit)..."
📂 [COHERE] Category from header: excavation (E20 Formwork for in situ concrete

Formwork; Basic finish at the discretion of contractor

Sides of ground beams and edges of beds > E41 Worked finishes/Cutting to in situ concrete

Worked finishes; as Spec E41

Trowelling > Page Total 2000/3/16)
📂 [COHERE] Item 193: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E20 Formwork for in situ concrete

Formwork; Basic finish at the discretion of contractor

Sides of ground beams and edges of beds > E41 Worked finishes/Cutting to in situ concrete

Worked finishes; as Spec E41

Trowelling > Page Total 2000/3/16)
[COHERE DEBUG] Item 193: bestMatch = { confidence: 57, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 193, Total confidence: 10272.47114010957
✅ Match (57%): "Horizontal; to concrete (Top o..."
📂 [COHERE] Category from header: excavation (E20 Formwork for in situ concrete

Formwork; Basic finish at the discretion of contractor

Sides of ground beams and edges of beds > E41 Worked finishes/Cutting to in situ concrete

Worked finishes; as Spec E41

Trowelling > Page Total 2000/3/16)
📂 [COHERE] Item 194: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E20 Formwork for in situ concrete

Formwork; Basic finish at the discretion of contractor

Sides of ground beams and edges of beds > E41 Worked finishes/Cutting to in situ concrete

Worked finishes; as Spec E41

Trowelling > Page Total 2000/3/16)
[COHERE DEBUG] Item 194: bestMatch = { confidence: 54, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 194, Total confidence: 10326.63842264417
✅ Match (54%): "Horizontal; to concrete (Top o..."
📂 [COHERE] Category from header: excavation (E20 Formwork for in situ concrete

Formwork; Basic finish at the discretion of contractor

Sides of ground beams and edges of beds > E41 Worked finishes/Cutting to in situ concrete

Worked finishes; as Spec E41

Trowelling > Page Total 2000/3/16)
📂 [COHERE] Item 195: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E20 Formwork for in situ concrete

Formwork; Basic finish at the discretion of contractor

Sides of ground beams and edges of beds > E41 Worked finishes/Cutting to in situ concrete

Worked finishes; as Spec E41

Trowelling > Page Total 2000/3/16)
[COHERE DEBUG] Item 195: bestMatch = { confidence: 55, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 195, Total confidence: 10381.78012624914
✅ Match (55%): "Horizontal; to concrete (Top o..."
📂 [COHERE] Category from header: excavation (E20 Formwork for in situ concrete

Formwork; Basic finish at the discretion of contractor

Sides of ground beams and edges of beds > E41 Worked finishes/Cutting to in situ concrete

Worked finishes; as Spec E41

Trowelling > Page Total 2000/3/16)
📂 [COHERE] Item 196: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E20 Formwork for in situ concrete

Formwork; Basic finish at the discretion of contractor

Sides of ground beams and edges of beds > E41 Worked finishes/Cutting to in situ concrete

Worked finishes; as Spec E41

Trowelling > Page Total 2000/3/16)
[COHERE DEBUG] Item 196: bestMatch = { confidence: 54, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 196, Total confidence: 10435.799819123016
✅ Match (54%): "Vertical; to concrete (Perimet..."
📂 [COHERE] Category from header: excavation (E20 Formwork for in situ concrete

Formwork; Basic finish at the discretion of contractor

Sides of ground beams and edges of beds > E41 Worked finishes/Cutting to in situ concrete

Worked finishes; as Spec E41

Trowelling > Page Total 2000/3/16)
📂 [COHERE] Item 197: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E20 Formwork for in situ concrete

Formwork; Basic finish at the discretion of contractor

Sides of ground beams and edges of beds > E41 Worked finishes/Cutting to in situ concrete

Worked finishes; as Spec E41

Trowelling > Page Total 2000/3/16)
[COHERE DEBUG] Item 197: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 197, Total confidence: 10489.249518825962
✅ Match (53%): "Vertical; to concrete (Perimet..."
📂 [COHERE] Category from header: excavation (E20 Formwork for in situ concrete

Formwork; Basic finish at the discretion of contractor

Sides of ground beams and edges of beds > E41 Worked finishes/Cutting to in situ concrete

Worked finishes; as Spec E41

Trowelling > Page Total 2000/3/16)
📂 [COHERE] Item 198: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E20 Formwork for in situ concrete

Formwork; Basic finish at the discretion of contractor

Sides of ground beams and edges of beds > E41 Worked finishes/Cutting to in situ concrete

Worked finishes; as Spec E41

Trowelling > Page Total 2000/3/16)
[COHERE DEBUG] Item 198: bestMatch = { confidence: 57, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 198, Total confidence: 10546.03630651977
✅ Match (57%): "Vertical; to concrete (Sides o..."
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes; as Spec E41

Trowelling > Page Total 2000/3/16 > Page Total 2000/3/23)
📂 [COHERE] Item 199: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes; as Spec E41

Trowelling > Page Total 2000/3/16 > Page Total 2000/3/23)
[COHERE DEBUG] Item 199: bestMatch = { confidence: 51, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 199, Total confidence: 10597.311419830081
✅ Match (51%): "Vertical; to concrete (Sides o..."
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes; as Spec E41

Trowelling > Page Total 2000/3/16 > Page Total 2000/3/23)
📂 [COHERE] Item 200: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes; as Spec E41

Trowelling > Page Total 2000/3/16 > Page Total 2000/3/23)
[COHERE DEBUG] Item 200: bestMatch = { confidence: 54, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 200, Total confidence: 10651.36515181954
✅ Match (54%): "Vertical; to concrete (Sides o..."
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes; as Spec E41

Trowelling > Page Total 2000/3/16 > Page Total 2000/3/23)
📂 [COHERE] Item 201: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes; as Spec E41

Trowelling > Page Total 2000/3/16 > Page Total 2000/3/23)
[COHERE DEBUG] Item 201: bestMatch = { confidence: 54, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 201, Total confidence: 10705.356443803206
✅ Match (54%): "Vertical; to concrete (Sides o..."
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes; as Spec E41

Trowelling > Page Total 2000/3/16 > Page Total 2000/3/23)
📂 [COHERE] Item 202: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes; as Spec E41

Trowelling > Page Total 2000/3/16 > Page Total 2000/3/23)
[COHERE DEBUG] Item 202: bestMatch = { confidence: 51, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 202, Total confidence: 10756.837648923356
✅ Match (51%): "thick; to Insulation; horizont..."
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes; as Spec E41

Trowelling > Page Total 2000/3/16 > Page Total 2000/3/23)
📂 [COHERE] Item 203: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes; as Spec E41

Trowelling > Page Total 2000/3/16 > Page Total 2000/3/23)
[COHERE DEBUG] Item 203: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 203, Total confidence: 10809.812161235313
✅ Match (53%): "thick; to concrete; horizontal..."
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes; as Spec E41

Trowelling > Page Total 2000/3/16 > Page Total 2000/3/23)
📂 [COHERE] Item 204: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes; as Spec E41

Trowelling > Page Total 2000/3/16 > Page Total 2000/3/23)
[COHERE DEBUG] Item 204: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 204, Total confidence: 10862.78667354727
✅ Match (53%): "thick; to concrete; horizontal..."
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes; as Spec E41

Trowelling > Page Total 2000/3/16 > Page Total 2000/3/23)
📂 [COHERE] Item 205: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes; as Spec E41

Trowelling > Page Total 2000/3/16 > Page Total 2000/3/23)
[COHERE DEBUG] Item 205: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 205, Total confidence: 10915.761185859228
✅ Match (53%): "thick; to concrete; horizontal..."
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes; as Spec E41

Trowelling > Page Total 2000/3/16 > Page Total 2000/3/23)
📂 [COHERE] Item 206: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes; as Spec E41

Trowelling > Page Total 2000/3/16 > Page Total 2000/3/23)
[COHERE DEBUG] Item 206: bestMatch = { confidence: 50, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 206, Total confidence: 10965.348150666638
⚠️  Low confidence (50%): "At Door Thresholds and the lik..."
📂 [COHERE] Item 207: Category = none (confidence: 0)
[COHERE DEBUG] Item 207: bestMatch = { confidence: 47, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 207, Total confidence: 11012.774655348847
⚠️  Low confidence (47%): "25 m maximum depth; commencing..."
📂 [COHERE] Item 208: Category = none (confidence: 0)
[COHERE DEBUG] Item 208: bestMatch = { confidence: 45, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 208, Total confidence: 11057.641778568266
⚠️  Low confidence (45%): "m maximum depth; commencing at..."
📂 [COHERE] Category from description: steel (score: 0.5428571428571428)
📂 [COHERE] Item 209: Category = steel (confidence: 0.5428571428571428)
📂 [COHERE] Category from description: steel (score: 0.5428571428571428)
[COHERE DEBUG] Item 209: bestMatch = { confidence: 42, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 209, Total confidence: 11100.10704359218
⚠️  Low confidence (42%): "m maximum depth; commencing at..."
📂 [COHERE] Item 210: Category = none (confidence: 0)
[COHERE DEBUG] Item 210: bestMatch = { confidence: 44, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 210, Total confidence: 11144.392862574892
⚠️  Low confidence (44%): "m maximum depth; commencing at..."
📂 [COHERE] Item 211: Category = none (confidence: 0)
[COHERE DEBUG] Item 211: bestMatch = { confidence: 49, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 211, Total confidence: 11192.955086381797
⚠️  Low confidence (49%): "m maximum depth; commencing at..."
📂 [COHERE] Category from description: excavation (score: 0.5428571428571428)
📂 [COHERE] Item 212: Category = excavation (confidence: 0.5428571428571428)
📂 [COHERE] Category from description: excavation (score: 0.5428571428571428)
[COHERE DEBUG] Item 212: bestMatch = { confidence: 44, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 212, Total confidence: 11237.168785239202
⚠️  Low confidence (44%): "00 m maximum depth; commencing..."
📂 [COHERE] Category from description: excavation (score: 0.5428571428571428)
📂 [COHERE] Item 213: Category = excavation (confidence: 0.5428571428571428)
📂 [COHERE] Category from description: excavation (score: 0.5428571428571428)
[COHERE DEBUG] Item 213: bestMatch = { confidence: 49, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 213, Total confidence: 11286.612007128699
⚠️  Low confidence (49%): "00 m maximum depth; commencing..."
📂 [COHERE] Category from description: excavation (score: 0.5428571428571428)
📂 [COHERE] Item 214: Category = excavation (confidence: 0.5428571428571428)
📂 [COHERE] Category from description: excavation (score: 0.5428571428571428)
[COHERE DEBUG] Item 214: bestMatch = { confidence: 49, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 214, Total confidence: 11335.914205731911
⚠️  Low confidence (49%): "00 m maximum depth; commencing..."
📂 [COHERE] Category from description: excavation (score: 0.5428571428571428)
📂 [COHERE] Item 215: Category = excavation (confidence: 0.5428571428571428)
📂 [COHERE] Category from description: excavation (score: 0.5428571428571428)
[COHERE DEBUG] Item 215: bestMatch = { confidence: 47, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 215, Total confidence: 11382.826869378554
⚠️  Low confidence (47%): "00 m maximum depth; commencing..."
📂 [COHERE] Item 216: Category = none (confidence: 0)
[COHERE DEBUG] Item 216: bestMatch = { confidence: 42, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 216, Total confidence: 11425.114063795001
⚠️  Low confidence (42%): "00 m maximum depth; commencing..."
📂 [COHERE] Category from header: excavation (Page Total 2000/3/24 > Page Total 2000/4/2 > Extra over excavation irrespective of depth for excavating)
📂 [COHERE] Item 217: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 2000/3/24 > Page Total 2000/4/2 > Extra over excavation irrespective of depth for excavating)
[COHERE DEBUG] Item 217: bestMatch = { confidence: 52, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 217, Total confidence: 11477.056438477186
✅ Match (52%): "Below ground water level - RIS..."
📂 [COHERE] Category from header: excavation (Page Total 2000/3/24 > Page Total 2000/4/2 > Extra over excavation irrespective of depth for excavating)
📂 [COHERE] Item 218: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 2000/3/24 > Page Total 2000/4/2 > Extra over excavation irrespective of depth for excavating)
[COHERE DEBUG] Item 218: bestMatch = { confidence: 50, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 218, Total confidence: 11527.084919972278
✅ Match (50%): "Toxic/hazardous material; as N..."
📂 [COHERE] Category from header: excavation (Page Total 2000/3/24 > Page Total 2000/4/2 > Extra over excavation irrespective of depth for excavating)
📂 [COHERE] Item 219: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 2000/3/24 > Page Total 2000/4/2 > Extra over excavation irrespective of depth for excavating)
[COHERE DEBUG] Item 219: bestMatch = { confidence: 61, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 219, Total confidence: 11588.502919544322
✅ Match (61%): "Pile caps and ground beams bet..."
📂 [COHERE] Category from header: excavation (Page Total 2000/3/24 > Page Total 2000/4/2 > Extra over excavation irrespective of depth for excavating)
📂 [COHERE] Item 220: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 2000/3/24 > Page Total 2000/4/2 > Extra over excavation irrespective of depth for excavating)
[COHERE DEBUG] Item 220: bestMatch = { confidence: 51, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 220, Total confidence: 11639.157075758827
✅ Match (51%): "Pits..."
📂 [COHERE] Category from header: excavation (Page Total 2000/3/24 > Page Total 2000/4/2 > Extra over excavation irrespective of depth for excavating)
📂 [COHERE] Item 221: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 2000/3/24 > Page Total 2000/4/2 > Extra over excavation irrespective of depth for excavating)
[COHERE DEBUG] Item 221: bestMatch = { confidence: 51, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 221, Total confidence: 11689.833769533669
✅ Match (51%): "Reduce level; (At Floor 19.710..."
📂 [COHERE] Category from header: excavation (Page Total 2000/3/24 > Page Total 2000/4/2 > Extra over excavation irrespective of depth for excavating)
📂 [COHERE] Item 222: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 2000/3/24 > Page Total 2000/4/2 > Extra over excavation irrespective of depth for excavating)
[COHERE DEBUG] Item 222: bestMatch = { confidence: 56, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 222, Total confidence: 11745.346927359164
✅ Match (56%): "Trenches..."
📂 [COHERE] Category from header: excavation (Page Total 2000/4/2 > Extra over excavation irrespective of depth for excavating > Page Total 2000/4/3)
📂 [COHERE] Item 223: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 2000/4/2 > Extra over excavation irrespective of depth for excavating > Page Total 2000/4/3)
[COHERE DEBUG] Item 223: bestMatch = { confidence: 50, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 223, Total confidence: 11795.547936348836
✅ Match (50%): "00 m maximum depth; distance b..."
📂 [COHERE] Category from header: excavation (Page Total 2000/4/2 > Extra over excavation irrespective of depth for excavating > Page Total 2000/4/3)
📂 [COHERE] Item 224: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 2000/4/2 > Extra over excavation irrespective of depth for excavating > Page Total 2000/4/3)
[COHERE DEBUG] Item 224: bestMatch = { confidence: 50, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 224, Total confidence: 11845.518529853662
⚠️  Low confidence (50%): "00 m maximum depth; distance b..."
📂 [COHERE] Category from header: excavation (Page Total 2000/4/2 > Extra over excavation irrespective of depth for excavating > Page Total 2000/4/3)
📂 [COHERE] Item 225: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 2000/4/2 > Extra over excavation irrespective of depth for excavating > Page Total 2000/4/3)
[COHERE DEBUG] Item 225: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 225, Total confidence: 11898.490087243055
✅ Match (53%): "00 m maximum depth; distance b..."
📂 [COHERE] Category from header: excavation (Page Total 2000/4/2 > Extra over excavation irrespective of depth for excavating > Page Total 2000/4/3)
📂 [COHERE] Item 226: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 2000/4/2 > Extra over excavation irrespective of depth for excavating > Page Total 2000/4/3)
[COHERE DEBUG] Item 226: bestMatch = { confidence: 56, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 226, Total confidence: 11954.111848590082
✅ Match (56%): "00 m maximum depth; distance b..."
📂 [COHERE] Category from header: excavation (Page Total 2000/4/2 > Extra over excavation irrespective of depth for excavating > Page Total 2000/4/3)
📂 [COHERE] Item 227: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 2000/4/2 > Extra over excavation irrespective of depth for excavating > Page Total 2000/4/3)
[COHERE DEBUG] Item 227: bestMatch = { confidence: 52, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 227, Total confidence: 12005.635323773728
✅ Match (52%): "00 m maximum depth; distance b..."
📂 [COHERE] Category from header: excavation (Page Total 2000/4/2 > Extra over excavation irrespective of depth for excavating > Page Total 2000/4/3)
📂 [COHERE] Item 228: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 2000/4/2 > Extra over excavation irrespective of depth for excavating > Page Total 2000/4/3)
[COHERE DEBUG] Item 228: bestMatch = { confidence: 52, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 228, Total confidence: 12057.155689186537
✅ Match (52%): "00 m maximum depth; distance b..."
📂 [COHERE] Category from header: excavation (Page Total 2000/4/2 > Extra over excavation irrespective of depth for excavating > Page Total 2000/4/3)
📂 [COHERE] Item 229: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 2000/4/2 > Extra over excavation irrespective of depth for excavating > Page Total 2000/4/3)
[COHERE DEBUG] Item 229: bestMatch = { confidence: 55, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 229, Total confidence: 12111.854719707235
✅ Match (55%): "00 m maximum depth; distance b..."
📂 [COHERE] Category from header: excavation (Page Total 2000/4/2 > Extra over excavation irrespective of depth for excavating > Page Total 2000/4/3)
📂 [COHERE] Item 230: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 2000/4/2 > Extra over excavation irrespective of depth for excavating > Page Total 2000/4/3)
[COHERE DEBUG] Item 230: bestMatch = { confidence: 52, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 230, Total confidence: 12164.346136992779
✅ Match (52%): "Ground water..."
📂 [COHERE] Category from header: excavation (Page Total 2000/4/2 > Extra over excavation irrespective of depth for excavating > Page Total 2000/4/3)
📂 [COHERE] Item 231: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 2000/4/2 > Extra over excavation irrespective of depth for excavating > Page Total 2000/4/3)
[COHERE DEBUG] Item 231: bestMatch = { confidence: 50, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 231, Total confidence: 12214.170993624251
⚠️  Low confidence (50%): "Surface water..."
📂 [COHERE] Category from header: excavation (Page Total 2000/4/2 > Extra over excavation irrespective of depth for excavating > Page Total 2000/4/3)
📂 [COHERE] Item 232: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 2000/4/2 > Extra over excavation irrespective of depth for excavating > Page Total 2000/4/3)
[COHERE DEBUG] Item 232: bestMatch = { confidence: 49, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 232, Total confidence: 12263.40131257341
⚠️  Low confidence (49%): "Off site..."
📂 [COHERE] Category from header: excavation (Page Total 2000/4/2 > Extra over excavation irrespective of depth for excavating > Page Total 2000/4/3)
📂 [COHERE] Item 233: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 2000/4/2 > Extra over excavation irrespective of depth for excavating > Page Total 2000/4/3)
[COHERE DEBUG] Item 233: bestMatch = { confidence: 49, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 233, Total confidence: 12312.167785470006
⚠️  Low confidence (49%): "On site spoil heaps..."
📂 [COHERE] Category from header: excavation (Page Total 2000/4/2 > Extra over excavation irrespective of depth for excavating > Page Total 2000/4/3)
📂 [COHERE] Item 234: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 2000/4/2 > Extra over excavation irrespective of depth for excavating > Page Total 2000/4/3)
[COHERE DEBUG] Item 234: bestMatch = { confidence: 54, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 234, Total confidence: 12366.136922661062
✅ Match (54%): "Off site; toxic/hazardous mate..."
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating > Page Total 2000/4/3 > Page Total 2000/4/4)
📂 [COHERE] Item 235: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating > Page Total 2000/4/3 > Page Total 2000/4/4)
[COHERE DEBUG] Item 235: bestMatch = { confidence: 52, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 235, Total confidence: 12417.862828177647
✅ Match (52%): "Over 250 thick; (Below slab at..."
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating > Page Total 2000/4/3 > Page Total 2000/4/4)
📂 [COHERE] Item 236: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating > Page Total 2000/4/3 > Page Total 2000/4/4)
[COHERE DEBUG] Item 236: bestMatch = { confidence: 54, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 236, Total confidence: 12471.475049193403
✅ Match (54%): "Over 250 thick; (Below slab at..."
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating > Page Total 2000/4/3 > Page Total 2000/4/4)
📂 [COHERE] Item 237: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating > Page Total 2000/4/3 > Page Total 2000/4/4)
[COHERE DEBUG] Item 237: bestMatch = { confidence: 52, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 237, Total confidence: 12523.200954709988
✅ Match (52%): "Over 250 thick; (Below slab at..."
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating > Page Total 2000/4/3 > Page Total 2000/4/4)
📂 [COHERE] Item 238: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating > Page Total 2000/4/3 > Page Total 2000/4/4)
[COHERE DEBUG] Item 238: bestMatch = { confidence: 55, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 238, Total confidence: 12577.949693066732
✅ Match (55%): "Not exceeding 250 average thic..."
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating > Page Total 2000/4/3 > Page Total 2000/4/4)
📂 [COHERE] Item 239: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating > Page Total 2000/4/3 > Page Total 2000/4/4)
[COHERE DEBUG] Item 239: bestMatch = { confidence: 55, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 239, Total confidence: 12632.721871795353
✅ Match (55%): "Compacting; bottoms of excavat..."
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating > Page Total 2000/4/3 > Page Total 2000/4/4)
📂 [COHERE] Item 240: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating > Page Total 2000/4/3 > Page Total 2000/4/4)
[COHERE DEBUG] Item 240: bestMatch = { confidence: 54, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 240, Total confidence: 12686.281747831774
✅ Match (54%): "Compacting; bottoms of excavat..."
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating > Page Total 2000/4/3 > Page Total 2000/4/4)
📂 [COHERE] Item 241: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating > Page Total 2000/4/3 > Page Total 2000/4/4)
[COHERE DEBUG] Item 241: bestMatch = { confidence: 58, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 241, Total confidence: 12743.945117734806
✅ Match (58%): "Compacting; bottoms of excavat..."
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating > Page Total 2000/4/3 > Page Total 2000/4/4)
📂 [COHERE] Item 242: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating > Page Total 2000/4/3 > Page Total 2000/4/4)
[COHERE DEBUG] Item 242: bestMatch = { confidence: 54, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 242, Total confidence: 12798.04804784811
✅ Match (54%): "Compacting; bottoms of excavat..."
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating > Page Total 2000/4/3 > Page Total 2000/4/4)
📂 [COHERE] Item 243: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating > Page Total 2000/4/3 > Page Total 2000/4/4)
[COHERE DEBUG] Item 243: bestMatch = { confidence: 52, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 243, Total confidence: 12849.97739473973
✅ Match (52%): "Compacting; bottoms of excavat..."
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating > Page Total 2000/4/3 > Page Total 2000/4/4)
📂 [COHERE] Item 244: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating > Page Total 2000/4/3 > Page Total 2000/4/4)
[COHERE DEBUG] Item 244: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 244, Total confidence: 12903.255119075526
✅ Match (53%): "Compacting; surface of filling..."
📂 [COHERE] Category from description: excavation (score: 0.5428571428571428)
📂 [COHERE] Item 245: Category = excavation (confidence: 0.5428571428571428)
📂 [COHERE] Category from description: excavation (score: 0.5428571428571428)
[COHERE DEBUG] Item 245: bestMatch = { confidence: 57, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 245, Total confidence: 12960.313303263596
✅ Match (57%): "Compacting; surface of filling..."
📂 [COHERE] Item 246: Category = none (confidence: 0)
[COHERE DEBUG] Item 246: bestMatch = { confidence: 39, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 246, Total confidence: 12999.022417419308
⚠️  Low confidence (39%): "Length carried out in one oper..."
📂 [COHERE] Item 247: Category = none (confidence: 0)
[COHERE DEBUG] Item 247: bestMatch = { confidence: 34, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 247, Total confidence: 13032.536034165836
⚠️  Low confidence (34%): "The maximum number of sections..."
📂 [COHERE] Category from description: steel (score: 0.5428571428571428)
📂 [COHERE] Item 248: Category = steel (confidence: 0.5428571428571428)
📂 [COHERE] Category from description: steel (score: 0.5428571428571428)
[COHERE DEBUG] Item 248: bestMatch = { confidence: 43, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 248, Total confidence: 13075.765379961125
⚠️  Low confidence (43%): "Contractor Design ; making goo..."
📂 [COHERE] Item 249: Category = none (confidence: 0)
[COHERE DEBUG] Item 249: bestMatch = { confidence: 55, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 249, Total confidence: 13131.06571427214
✅ Match (55%): "00 m maximum depth; from one s..."
📂 [COHERE] Item 250: Category = none (confidence: 0)
[COHERE DEBUG] Item 250: bestMatch = { confidence: 55, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 250, Total confidence: 13186.366048583153
✅ Match (55%): "00 m maximum depth; from one s..."
📂 [COHERE] Category from header: excavation (D50 Underpinning

Limits > Excavating

Preliminary trenches > Extra over excavation irrespective of depth for excavating)
📂 [COHERE] Item 251: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (D50 Underpinning

Limits > Excavating

Preliminary trenches > Extra over excavation irrespective of depth for excavating)
[COHERE DEBUG] Item 251: bestMatch = { confidence: 54, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 251, Total confidence: 13239.88882158521
✅ Match (54%): "Below water level - PRICING PO..."
📂 [COHERE] Category from header: excavation (Excavating

Preliminary trenches > Extra over excavation irrespective of depth for excavating > Earthwork support

To faces of preliminary trenches)
📂 [COHERE] Item 252: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Excavating

Preliminary trenches > Extra over excavation irrespective of depth for excavating > Earthwork support

To faces of preliminary trenches)
[COHERE DEBUG] Item 252: bestMatch = { confidence: 59, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 252, Total confidence: 13298.8966846577
✅ Match (59%): "00 m maximum depth; distance b..."
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating > Earthwork support

To faces of preliminary trenches > Page Total 2000/4/6)
📂 [COHERE] Item 253: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating > Earthwork support

To faces of preliminary trenches > Page Total 2000/4/6)
[COHERE DEBUG] Item 253: bestMatch = { confidence: 59, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 253, Total confidence: 13358.306557958264
✅ Match (59%): "00 m maximum depth; distance b..."
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating > Earthwork support

To faces of preliminary trenches > Page Total 2000/4/6)
📂 [COHERE] Item 254: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating > Earthwork support

To faces of preliminary trenches > Page Total 2000/4/6)
[COHERE DEBUG] Item 254: bestMatch = { confidence: 61, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 254, Total confidence: 13418.926502506645
✅ Match (61%): "Brick footings course x 3..."
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating > Earthwork support

To faces of preliminary trenches > Page Total 2000/4/6)
📂 [COHERE] Item 255: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating > Earthwork support

To faces of preliminary trenches > Page Total 2000/4/6)
[COHERE DEBUG] Item 255: bestMatch = { confidence: 62, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 255, Total confidence: 13480.927383494543
✅ Match (62%): "thick brickwork..."
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating > Earthwork support

To faces of preliminary trenches > Page Total 2000/4/6)
📂 [COHERE] Item 256: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating > Earthwork support

To faces of preliminary trenches > Page Total 2000/4/6)
[COHERE DEBUG] Item 256: bestMatch = { confidence: 55, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 256, Total confidence: 13535.891635900532
✅ Match (55%): "Ground water..."
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating > Earthwork support

To faces of preliminary trenches > Page Total 2000/4/6)
📂 [COHERE] Item 257: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating > Earthwork support

To faces of preliminary trenches > Page Total 2000/4/6)
[COHERE DEBUG] Item 257: bestMatch = { confidence: 55, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 257, Total confidence: 13590.657719699633
✅ Match (55%): "Surface water..."
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating > Earthwork support

To faces of preliminary trenches > Page Total 2000/4/6)
📂 [COHERE] Item 258: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating > Earthwork support

To faces of preliminary trenches > Page Total 2000/4/6)
[COHERE DEBUG] Item 258: bestMatch = { confidence: 57, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 258, Total confidence: 13647.271514756178
✅ Match (57%): "Off site..."
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating > Earthwork support

To faces of preliminary trenches > Page Total 2000/4/6)
📂 [COHERE] Item 259: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating > Earthwork support

To faces of preliminary trenches > Page Total 2000/4/6)
[COHERE DEBUG] Item 259: bestMatch = { confidence: 60, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 259, Total confidence: 13707.251795795833
✅ Match (60%): "Generally..."
📂 [COHERE] Category from header: excavation (Earthwork support

To faces of preliminary trenches > Page Total 2000/4/6 > Plain insitu concrete; Gen 1; 20mm aggregate; as Engineers Spec E10/110A

Beds)
📂 [COHERE] Item 260: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Earthwork support

To faces of preliminary trenches > Page Total 2000/4/6 > Plain insitu concrete; Gen 1; 20mm aggregate; as Engineers Spec E10/110A

Beds)
[COHERE DEBUG] Item 260: bestMatch = { confidence: 54, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 260, Total confidence: 13760.989464567032
✅ Match (54%): "Not exceeding 150 thick; (Mud ..."
📂 [COHERE] Category from header: excavation (Earthwork support

To faces of preliminary trenches > Page Total 2000/4/6 > Plain insitu concrete; Gen 1; 20mm aggregate; as Engineers Spec E10/110A

Beds)
📂 [COHERE] Item 261: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Earthwork support

To faces of preliminary trenches > Page Total 2000/4/6 > Plain insitu concrete; Gen 1; 20mm aggregate; as Engineers Spec E10/110A

Beds)
[COHERE DEBUG] Item 261: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 261, Total confidence: 13814.272602155472
✅ Match (53%): "to 450 thick..."
📂 [COHERE] Category from header: concrete (Page Total 2000/4/6 > Plain insitu concrete; Gen 1; 20mm aggregate; as Engineers Spec E10/110A

Beds > Page Total 2000/4/7)
📂 [COHERE] Item 262: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/4/6 > Plain insitu concrete; Gen 1; 20mm aggregate; as Engineers Spec E10/110A

Beds > Page Total 2000/4/7)
[COHERE DEBUG] Item 262: bestMatch = { confidence: 48, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 262, Total confidence: 13862.158882374106
⚠️  Low confidence (48%): "Not exceeding 250 high..."
📂 [COHERE] Category from header: concrete (Page Total 2000/4/6 > Plain insitu concrete; Gen 1; 20mm aggregate; as Engineers Spec E10/110A

Beds > Page Total 2000/4/7)
📂 [COHERE] Item 263: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/4/6 > Plain insitu concrete; Gen 1; 20mm aggregate; as Engineers Spec E10/110A

Beds > Page Total 2000/4/7)
[COHERE DEBUG] Item 263: bestMatch = { confidence: 50, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 263, Total confidence: 13911.977110280866
⚠️  Low confidence (50%): "Various sizes; straight and be..."
📂 [COHERE] Category from header: concrete (Page Total 2000/4/6 > Plain insitu concrete; Gen 1; 20mm aggregate; as Engineers Spec E10/110A

Beds > Page Total 2000/4/7)
📂 [COHERE] Item 264: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/4/6 > Plain insitu concrete; Gen 1; 20mm aggregate; as Engineers Spec E10/110A

Beds > Page Total 2000/4/7)
[COHERE DEBUG] Item 264: bestMatch = { confidence: 47, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 264, Total confidence: 13959.087504537963
⚠️  Low confidence (47%): "extra over for couplers to rei..."
📂 [COHERE] Category from header: concrete (Plain insitu concrete; Gen 1; 20mm aggregate; as Engineers Spec E10/110A

Beds > Page Total 2000/4/7 > Worked finishes to in-situ concrete; as Engineers Spec E41

Finishing)
📂 [COHERE] Item 265: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Plain insitu concrete; Gen 1; 20mm aggregate; as Engineers Spec E10/110A

Beds > Page Total 2000/4/7 > Worked finishes to in-situ concrete; as Engineers Spec E41

Finishing)
[COHERE DEBUG] Item 265: bestMatch = { confidence: 51, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 265, Total confidence: 14009.949572281379
✅ Match (51%): "Ordinary finish; as Engineers ..."
📂 [COHERE] Category from header: concrete (Page Total 2000/4/7 > Worked finishes to in-situ concrete; as Engineers Spec E41

Finishing > Page Total 2000/4/8)
📂 [COHERE] Item 266: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/4/7 > Worked finishes to in-situ concrete; as Engineers Spec E41

Finishing > Page Total 2000/4/8)
[COHERE DEBUG] Item 266: bestMatch = { confidence: 50, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 266, Total confidence: 14059.48848498235
⚠️  Low confidence (50%): "Not exceeding 150 thick; (Mud ..."
📂 [COHERE] Category from header: concrete (Page Total 2000/4/7 > Worked finishes to in-situ concrete; as Engineers Spec E41

Finishing > Page Total 2000/4/8)
📂 [COHERE] Item 267: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/4/7 > Worked finishes to in-situ concrete; as Engineers Spec E41

Finishing > Page Total 2000/4/8)
[COHERE DEBUG] Item 267: bestMatch = { confidence: 50, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 267, Total confidence: 14109.932274622923
✅ Match (50%): "Not exceeding 150 thick; (Mud ..."
📂 [COHERE] Category from header: concrete (Page Total 2000/4/7 > Worked finishes to in-situ concrete; as Engineers Spec E41

Finishing > Page Total 2000/4/8)
📂 [COHERE] Item 268: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/4/7 > Worked finishes to in-situ concrete; as Engineers Spec E41

Finishing > Page Total 2000/4/8)
[COHERE DEBUG] Item 268: bestMatch = { confidence: 50, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 268, Total confidence: 14160.213684984974
✅ Match (50%): "Not exceeding 150 thick; (Mud ..."
📂 [COHERE] Category from header: concrete (Page Total 2000/4/7 > Worked finishes to in-situ concrete; as Engineers Spec E41

Finishing > Page Total 2000/4/8)
📂 [COHERE] Item 269: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/4/7 > Worked finishes to in-situ concrete; as Engineers Spec E41

Finishing > Page Total 2000/4/8)
[COHERE DEBUG] Item 269: bestMatch = { confidence: 50, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 269, Total confidence: 14210.422387296556
✅ Match (50%): "Not exceeding 150 thick; (Mud ..."
📂 [COHERE] Category from header: concrete (Page Total 2000/4/7 > Worked finishes to in-situ concrete; as Engineers Spec E41

Finishing > Page Total 2000/4/8)
📂 [COHERE] Item 270: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/4/7 > Worked finishes to in-situ concrete; as Engineers Spec E41

Finishing > Page Total 2000/4/8)
[COHERE DEBUG] Item 270: bestMatch = { confidence: 50, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 270, Total confidence: 14260.532514434126
✅ Match (50%): "Not exceeding 150 thick; (Mud ..."
📂 [COHERE] Category from header: concrete (Page Total 2000/4/7 > Worked finishes to in-situ concrete; as Engineers Spec E41

Finishing > Page Total 2000/4/8)
📂 [COHERE] Item 271: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/4/7 > Worked finishes to in-situ concrete; as Engineers Spec E41

Finishing > Page Total 2000/4/8)
[COHERE DEBUG] Item 271: bestMatch = { confidence: 49, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 271, Total confidence: 14309.285427448238
⚠️  Low confidence (49%): "Generally; poured on or agains..."
📂 [COHERE] Category from header: concrete (Page Total 2000/4/7 > Worked finishes to in-situ concrete; as Engineers Spec E41

Finishing > Page Total 2000/4/8)
📂 [COHERE] Item 272: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/4/7 > Worked finishes to in-situ concrete; as Engineers Spec E41

Finishing > Page Total 2000/4/8)
[COHERE DEBUG] Item 272: bestMatch = { confidence: 50, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 272, Total confidence: 14359.043556084409
⚠️  Low confidence (50%): "Generally..."
📂 [COHERE] Category from header: concrete (Page Total 2000/4/7 > Worked finishes to in-situ concrete; as Engineers Spec E41

Finishing > Page Total 2000/4/8)
📂 [COHERE] Item 273: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/4/7 > Worked finishes to in-situ concrete; as Engineers Spec E41

Finishing > Page Total 2000/4/8)
[COHERE DEBUG] Item 273: bestMatch = { confidence: 55, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 273, Total confidence: 14414.129290880988
✅ Match (55%): "to 450 thick; (150 thick Main ..."
📂 [COHERE] Category from header: concrete (Page Total 2000/4/7 > Worked finishes to in-situ concrete; as Engineers Spec E41

Finishing > Page Total 2000/4/8)
📂 [COHERE] Item 274: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/4/7 > Worked finishes to in-situ concrete; as Engineers Spec E41

Finishing > Page Total 2000/4/8)
[COHERE DEBUG] Item 274: bestMatch = { confidence: 52, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 274, Total confidence: 14466.339844813467
✅ Match (52%): "to 450 thick; (200 thick Main ..."
📂 [COHERE] Category from header: concrete (Page Total 2000/4/7 > Worked finishes to in-situ concrete; as Engineers Spec E41

Finishing > Page Total 2000/4/8)
📂 [COHERE] Item 275: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/4/7 > Worked finishes to in-situ concrete; as Engineers Spec E41

Finishing > Page Total 2000/4/8)
[COHERE DEBUG] Item 275: bestMatch = { confidence: 54, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 275, Total confidence: 14520.205851730496
✅ Match (54%): "to 450 thick; (200 thick Main ..."
📂 [COHERE] Category from header: concrete (Worked finishes to in-situ concrete; as Engineers Spec E41

Finishing > Page Total 2000/4/8 > Page Total 2000/4/9)
📂 [COHERE] Item 276: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Worked finishes to in-situ concrete; as Engineers Spec E41

Finishing > Page Total 2000/4/8 > Page Total 2000/4/9)
[COHERE DEBUG] Item 276: bestMatch = { confidence: 52, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 276, Total confidence: 14571.750477948419
✅ Match (52%): "Generally; (Abutting existing ..."
📂 [COHERE] Category from header: concrete (Worked finishes to in-situ concrete; as Engineers Spec E41

Finishing > Page Total 2000/4/8 > Page Total 2000/4/9)
📂 [COHERE] Item 277: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Worked finishes to in-situ concrete; as Engineers Spec E41

Finishing > Page Total 2000/4/8 > Page Total 2000/4/9)
[COHERE DEBUG] Item 277: bestMatch = { confidence: 48, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 277, Total confidence: 14620.142847590652
⚠️  Low confidence (48%): "Generally; (Service Pit)..."
📂 [COHERE] Category from header: concrete (Worked finishes to in-situ concrete; as Engineers Spec E41

Finishing > Page Total 2000/4/8 > Page Total 2000/4/9)
📂 [COHERE] Item 278: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Worked finishes to in-situ concrete; as Engineers Spec E41

Finishing > Page Total 2000/4/8 > Page Total 2000/4/9)
[COHERE DEBUG] Item 278: bestMatch = { confidence: 58, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 278, Total confidence: 14678.44325529073
✅ Match (58%): "to 450 thick; (200 thick - Ret..."
📂 [COHERE] Category from header: concrete (Worked finishes to in-situ concrete; as Engineers Spec E41

Finishing > Page Total 2000/4/8 > Page Total 2000/4/9)
📂 [COHERE] Item 279: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Worked finishes to in-situ concrete; as Engineers Spec E41

Finishing > Page Total 2000/4/8 > Page Total 2000/4/9)
[COHERE DEBUG] Item 279: bestMatch = { confidence: 59, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 279, Total confidence: 14736.961587685764
✅ Match (59%): "to 450 thick; (200 thick - Ret..."
📂 [COHERE] Category from header: concrete (Worked finishes to in-situ concrete; as Engineers Spec E41

Finishing > Page Total 2000/4/8 > Page Total 2000/4/9)
📂 [COHERE] Item 280: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Worked finishes to in-situ concrete; as Engineers Spec E41

Finishing > Page Total 2000/4/8 > Page Total 2000/4/9)
[COHERE DEBUG] Item 280: bestMatch = { confidence: 59, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 280, Total confidence: 14795.495505499213
✅ Match (59%): "to 450 thick; (200 thick - Ret..."
📂 [COHERE] Category from header: concrete (Worked finishes to in-situ concrete; as Engineers Spec E41

Finishing > Page Total 2000/4/8 > Page Total 2000/4/9)
📂 [COHERE] Item 281: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Worked finishes to in-situ concrete; as Engineers Spec E41

Finishing > Page Total 2000/4/8 > Page Total 2000/4/9)
[COHERE DEBUG] Item 281: bestMatch = { confidence: 58, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 281, Total confidence: 14853.280296540534
✅ Match (58%): "to 450 thick; (300 thick - W3 ..."
📂 [COHERE] Category from header: concrete (Page Total 2000/4/8 > Page Total 2000/4/9 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations)
📂 [COHERE] Item 282: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/4/8 > Page Total 2000/4/9 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations)
[COHERE DEBUG] Item 282: bestMatch = { confidence: 55, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 282, Total confidence: 14907.89976290658
✅ Match (55%): "Not exceeding 250 high' (Found..."
📂 [COHERE] Category from header: concrete (Page Total 2000/4/8 > Page Total 2000/4/9 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations)
📂 [COHERE] Item 283: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/4/8 > Page Total 2000/4/9 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations)
[COHERE DEBUG] Item 283: bestMatch = { confidence: 56, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 283, Total confidence: 14964.21568489679
✅ Match (56%): "Not exceeding 250 high' (Found..."
📂 [COHERE] Category from header: concrete (Page Total 2000/4/8 > Page Total 2000/4/9 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations)
📂 [COHERE] Item 284: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/4/8 > Page Total 2000/4/9 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations)
[COHERE DEBUG] Item 284: bestMatch = { confidence: 55, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 284, Total confidence: 15019.03630712763
✅ Match (55%): "Not exceeding 250 high; (Edge ..."
📂 [COHERE] Category from header: concrete (Page Total 2000/4/8 > Page Total 2000/4/9 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations)
📂 [COHERE] Item 285: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/4/8 > Page Total 2000/4/9 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations)
[COHERE DEBUG] Item 285: bestMatch = { confidence: 56, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 285, Total confidence: 15075.372046797098
✅ Match (56%): "Not exceeding 250 high; (Edge ..."
📂 [COHERE] Category from header: concrete (Page Total 2000/4/8 > Page Total 2000/4/9 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations)
📂 [COHERE] Item 286: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/4/8 > Page Total 2000/4/9 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations)
[COHERE DEBUG] Item 286: bestMatch = { confidence: 56, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 286, Total confidence: 15130.914615480318
✅ Match (56%): "Not exceeding 250 high; (Edge ..."
📂 [COHERE] Category from header: concrete (Page Total 2000/4/9 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations > Page Total 2000/4/10)
📂 [COHERE] Item 287: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/4/9 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations > Page Total 2000/4/10)
[COHERE DEBUG] Item 287: bestMatch = { confidence: 60, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 287, Total confidence: 15191.320954987565
✅ Match (60%): "to 500 high; (Sides of Ground ..."
📂 [COHERE] Category from header: concrete (Page Total 2000/4/9 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations > Page Total 2000/4/10)
📂 [COHERE] Item 288: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/4/9 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations > Page Total 2000/4/10)
[COHERE DEBUG] Item 288: bestMatch = { confidence: 52, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 288, Total confidence: 15242.834433018861
✅ Match (52%): "Vertical; to one side; (Other ..."
❌ [COHERE MATCH] Failed to update progress for batch 3/6
   🚀 Processing batch 4/6 (96 items)
[COHERE] Using enhanced description: "Page Total 2000/4/10: Not exceeding 250 wide..."
[COHERE] Using enhanced description: "E40 Designed joints in situ concrete

Joints; movement and..."
[COHERE] Using enhanced description: "Page Total 22000/1/1: m maximum depth..."
[COHERE] Using enhanced description: "Page Total 22000/1/1: Surface water..."
[COHERE] Using enhanced description: "Page Total 22000/1/1: Off site..."
[COHERE] Using enhanced description: "Page Total 22000/2/1: Extra over for dropper kerbs..."
[COHERE] Using enhanced description: "Page Total 22000/2/5: Not exceeding 150 thick..."
[COHERE] Using enhanced description: "E20 Formwork for in situ concrete

Formwork; Basic finish;..."
[COHERE] Using enhanced description: "E41 Worked finishes/Cutting to in situ concrete

Worked fi..."
[COHERE] Using enhanced description: "E41 Worked finishes/Cutting to in situ concrete

Worked fi..."
[COHERE] Using enhanced description: "Page Total 22000/3/2: 00 m maximum depth..."
[COHERE] Using enhanced description: "Page Total 22000/3/2: Off site..."
📂 [COHERE] Category from header: concrete (Page Total 2000/4/9 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations > Page Total 2000/4/10)
📂 [COHERE] Item 289: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/4/9 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations > Page Total 2000/4/10)
[COHERE DEBUG] Item 289: bestMatch = { confidence: 52, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 289, Total confidence: 15295.249788872108
✅ Match (52%): "Vertical; to one side; (Other ..."
📂 [COHERE] Category from header: concrete (Page Total 2000/4/9 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations > Page Total 2000/4/10)
📂 [COHERE] Item 290: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/4/9 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations > Page Total 2000/4/10)
[COHERE DEBUG] Item 290: bestMatch = { confidence: 50, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 290, Total confidence: 15345.488590797811
✅ Match (50%): "Vertical; to both sides; (both..."
📂 [COHERE] Category from header: concrete (Page Total 2000/4/9 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations > Page Total 2000/4/10)
📂 [COHERE] Item 291: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/4/9 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations > Page Total 2000/4/10)
[COHERE DEBUG] Item 291: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 291, Total confidence: 15398.03157329279
✅ Match (53%): "Vertical; to both sides; (both..."
📂 [COHERE] Category from header: concrete (Page Total 2000/4/9 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations > Page Total 2000/4/10)
📂 [COHERE] Item 292: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/4/9 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations > Page Total 2000/4/10)
[COHERE DEBUG] Item 292: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 292, Total confidence: 15450.953777976865
✅ Match (53%): "Vertical; to both sides; (both..."
📂 [COHERE] Category from header: concrete (Page Total 2000/4/9 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations > Page Total 2000/4/10)
📂 [COHERE] Item 293: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/4/9 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations > Page Total 2000/4/10)
[COHERE DEBUG] Item 293: bestMatch = { confidence: 50, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 293, Total confidence: 15501.284576557771
✅ Match (50%): "Suspended one side; 150 high -..."
📂 [COHERE] Category from header: concrete (Page Total 2000/4/9 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations > Page Total 2000/4/10)
📂 [COHERE] Item 294: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/4/9 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations > Page Total 2000/4/10)
[COHERE DEBUG] Item 294: bestMatch = { confidence: 50, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 294, Total confidence: 15551.664451548084
✅ Match (50%): "Suspended one side; 150 high -..."
📂 [COHERE] Category from header: concrete (Page Total 2000/4/9 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations > Page Total 2000/4/10)
📂 [COHERE] Item 295: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/4/9 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations > Page Total 2000/4/10)
[COHERE DEBUG] Item 295: bestMatch = { confidence: 52, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 295, Total confidence: 15603.891230304835
✅ Match (52%): "Suspended one side; 150 high -..."
📂 [COHERE] Category from header: concrete (Page Total 2000/4/9 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations > Page Total 2000/4/10)
📂 [COHERE] Item 296: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/4/9 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations > Page Total 2000/4/10)
[COHERE DEBUG] Item 296: bestMatch = { confidence: 51, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 296, Total confidence: 15654.461214222516
✅ Match (51%): "Suspended one side; 150 high -..."
📂 [COHERE] Category from header: concrete (Page Total 2000/4/9 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations > Page Total 2000/4/10)
📂 [COHERE] Item 297: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/4/9 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations > Page Total 2000/4/10)
[COHERE DEBUG] Item 297: bestMatch = { confidence: 52, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 297, Total confidence: 15706.401455262456
✅ Match (52%): "Suspended both sides; 150 high..."
📂 [COHERE] Category from header: concrete (Page Total 2000/4/9 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations > Page Total 2000/4/10)
📂 [COHERE] Item 298: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/4/9 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of foundations > Page Total 2000/4/10)
[COHERE DEBUG] Item 298: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 298, Total confidence: 15759.068440423518
✅ Match (53%): "Not exceeding 250 wide..."
📂 [COHERE] Category from header: concrete (Page Total 2000/4/10 > Page Total 2000/4/11 > E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars)
📂 [COHERE] Item 299: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/4/10 > Page Total 2000/4/11 > E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars)
[COHERE DEBUG] Item 299: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 299, Total confidence: 15812.006244092152
✅ Match (53%): "Variable nominal size; straigh..."
📂 [COHERE] Category from header: concrete (Page Total 2000/4/10 > Page Total 2000/4/11 > E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars)
📂 [COHERE] Item 300: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/4/10 > Page Total 2000/4/11 > E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars)
[COHERE DEBUG] Item 300: bestMatch = { confidence: 56, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 300, Total confidence: 15868.486780722145
✅ Match (56%): "Variable nominal size; straigh..."
📂 [COHERE] Category from header: concrete (Page Total 2000/4/10 > Page Total 2000/4/11 > E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars)
📂 [COHERE] Item 301: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/4/10 > Page Total 2000/4/11 > E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars)
[COHERE DEBUG] Item 301: bestMatch = { confidence: 52, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 301, Total confidence: 15920.880599933693
✅ Match (52%): "Variable nominal size; straigh..."
📂 [COHERE] Category from header: concrete (Page Total 2000/4/10 > Page Total 2000/4/11 > E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars)
📂 [COHERE] Item 302: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/4/10 > Page Total 2000/4/11 > E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars)
[COHERE DEBUG] Item 302: bestMatch = { confidence: 56, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 302, Total confidence: 15977.349822407332
✅ Match (56%): "Variable nominal size; straigh..."
📂 [COHERE] Category from header: concrete (Page Total 2000/4/11 > E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars > E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain)
📂 [COHERE] Item 303: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/4/11 > E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars > E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain)
[COHERE DEBUG] Item 303: bestMatch = { confidence: 56, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 303, Total confidence: 16033.601238808065
✅ Match (56%): "200 wide; (150 thick slab) - P..."
📂 [COHERE] Category from header: concrete (Page Total 2000/4/11 > E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars > E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain)
📂 [COHERE] Item 304: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/4/11 > E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars > E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain)
[COHERE DEBUG] Item 304: bestMatch = { confidence: 57, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 304, Total confidence: 16090.786793202973
✅ Match (57%): "300 wide; (200 thick slab) - P..."
📂 [COHERE] Category from header: concrete (Page Total 2000/4/11 > E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars > E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain)
📂 [COHERE] Item 305: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/4/11 > E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars > E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain)
[COHERE DEBUG] Item 305: bestMatch = { confidence: 52, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 305, Total confidence: 16142.827470379189
✅ Match (52%): "Set on edge; Horizontal; (200 ..."
📂 [COHERE] Category from header: concrete (Page Total 2000/4/11 > E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars > E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain)
📂 [COHERE] Item 306: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 2000/4/11 > E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars > E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain)
[COHERE DEBUG] Item 306: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 306, Total confidence: 16195.494294303238
✅ Match (53%): "External angles..."
📂 [COHERE] Category from header: excavation (E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars > E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
📂 [COHERE] Item 307: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars > E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
[COHERE DEBUG] Item 307: bestMatch = { confidence: 49, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 307, Total confidence: 16244.19807844509
⚠️  Low confidence (49%): "Generally; (Mud mat - below Ma..."
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/4/12 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
📂 [COHERE] Item 308: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/4/12 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
[COHERE DEBUG] Item 308: bestMatch = { confidence: 50, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 308, Total confidence: 16293.889864207638
⚠️  Low confidence (50%): "Generally; (Mud mat - below Ma..."
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/4/12 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
📂 [COHERE] Item 309: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/4/12 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
[COHERE DEBUG] Item 309: bestMatch = { confidence: 47, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 309, Total confidence: 16341.300092562053
⚠️  Low confidence (47%): "Generally; (Mud mat - below Fo..."
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/4/12 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
📂 [COHERE] Item 310: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/4/12 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
[COHERE DEBUG] Item 310: bestMatch = { confidence: 49, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 310, Total confidence: 16390.26215712622
⚠️  Low confidence (49%): "Generally; (Mud mat - below Fo..."
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/4/12 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
📂 [COHERE] Item 311: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/4/12 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
[COHERE DEBUG] Item 311: bestMatch = { confidence: 49, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 311, Total confidence: 16439.6628005091
⚠️  Low confidence (49%): "Generally; (Mud mat - below Gr..."
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/4/12 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
📂 [COHERE] Item 312: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/4/12 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
[COHERE DEBUG] Item 312: bestMatch = { confidence: 48, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 312, Total confidence: 16487.23151591932
⚠️  Low confidence (48%): "Generally; (Top of 150 thick M..."
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/4/12 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
📂 [COHERE] Item 313: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/4/12 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
[COHERE DEBUG] Item 313: bestMatch = { confidence: 50, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 313, Total confidence: 16537.04868850355
⚠️  Low confidence (50%): "Generally; (Top of 200 thick M..."
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/4/12 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
📂 [COHERE] Item 314: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/4/12 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
[COHERE DEBUG] Item 314: bestMatch = { confidence: 47, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 314, Total confidence: 16583.851790174307
⚠️  Low confidence (47%): "Generally; (Top of 200 thick S..."
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/4/12 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
📂 [COHERE] Item 315: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/4/12 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
[COHERE DEBUG] Item 315: bestMatch = { confidence: 46, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 315, Total confidence: 16629.713111407924
⚠️  Low confidence (46%): "Generally; (Top of Foundation ..."
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/4/12 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
📂 [COHERE] Item 316: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/4/12 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
[COHERE DEBUG] Item 316: bestMatch = { confidence: 48, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 316, Total confidence: 16678.082651522604
⚠️  Low confidence (48%): "Generally; (Top of Ground Beam..."
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/4/12 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
📂 [COHERE] Item 317: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/4/12 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
[COHERE DEBUG] Item 317: bestMatch = { confidence: 49, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 317, Total confidence: 16727.483316085156
⚠️  Low confidence (49%): "Generally; (Top of 150 thick M..."
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/4/12 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
📂 [COHERE] Item 318: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/4/12 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
[COHERE DEBUG] Item 318: bestMatch = { confidence: 50, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 318, Total confidence: 16777.07770336189
⚠️  Low confidence (50%): "Generally; (Top of 200 thick M..."
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/4/12 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
📂 [COHERE] Item 319: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/4/12 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
[COHERE DEBUG] Item 319: bestMatch = { confidence: 50, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 319, Total confidence: 16826.990436448737
⚠️  Low confidence (50%): "Various sizes - PRICING POINT;..."
📂 [COHERE] Category from header: excavation (Page Total 2000/4/12 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/4/13)
📂 [COHERE] Item 320: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 2000/4/12 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/4/13)
[COHERE DEBUG] Item 320: bestMatch = { confidence: 47, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 320, Total confidence: 16874.17383388809
⚠️  Low confidence (47%): "Not exceeding 1m girth - PRICI..."
📂 [COHERE] Category from header: excavation (Page Total 2000/4/12 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/4/13)
📂 [COHERE] Item 321: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 2000/4/12 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/4/13)
[COHERE DEBUG] Item 321: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 321, Total confidence: 16926.759417840047
✅ Match (53%): "Over 100 diameter; assumed 150..."
📂 [COHERE] Category from header: excavation (Page Total 2000/4/12 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/4/13)
📂 [COHERE] Item 322: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 2000/4/12 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/4/13)
[COHERE DEBUG] Item 322: bestMatch = { confidence: 58, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 322, Total confidence: 16984.350753886974
✅ Match (58%): "Over 100 diameter; assumed 150..."
📂 [COHERE] Category from header: excavation (Page Total 2000/4/12 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/4/13)
📂 [COHERE] Item 323: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 2000/4/12 > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/4/13)
[COHERE DEBUG] Item 323: bestMatch = { confidence: 54, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 323, Total confidence: 17038.758034359136
✅ Match (54%): "Over 100 diameter; assumed 150..."
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/4/13 > Page Total 2000/4/14)
📂 [COHERE] Item 324: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/4/13 > Page Total 2000/4/14)
[COHERE DEBUG] Item 324: bestMatch = { confidence: 51, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 324, Total confidence: 17089.749452627304
✅ Match (51%): "Horizontal; to insulation; (Ma..."
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/4/13 > Page Total 2000/4/14)
📂 [COHERE] Item 325: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/4/13 > Page Total 2000/4/14)
[COHERE DEBUG] Item 325: bestMatch = { confidence: 49, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 325, Total confidence: 17138.90519803709
⚠️  Low confidence (49%): "Horizontal; to insulation; Wit..."
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/4/13 > Page Total 2000/4/14)
📂 [COHERE] Item 326: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/4/13 > Page Total 2000/4/14)
[COHERE DEBUG] Item 326: bestMatch = { confidence: 49, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 326, Total confidence: 17187.737980505994
⚠️  Low confidence (49%): "Horizontal and vertical angles..."
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/4/13 > Page Total 2000/4/14)
📂 [COHERE] Item 327: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/4/13 > Page Total 2000/4/14)
[COHERE DEBUG] Item 327: bestMatch = { confidence: 50, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 327, Total confidence: 17238.018850784476
✅ Match (50%): "Horizontal; to concrete (Below..."
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/4/13 > Page Total 2000/4/14)
📂 [COHERE] Item 328: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/4/13 > Page Total 2000/4/14)
[COHERE DEBUG] Item 328: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 328, Total confidence: 17291.353977702987
✅ Match (53%): "Horizontal; to concrete (Below..."
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/4/13 > Page Total 2000/4/14)
📂 [COHERE] Item 329: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 2000/4/13 > Page Total 2000/4/14)
[COHERE DEBUG] Item 329: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 329, Total confidence: 17344.33553706309
✅ Match (53%): "Horizontal; to concrete (Main ..."
📂 [COHERE] Category from description: concrete (score: 0.55)
📂 [COHERE] Item 330: Category = concrete (confidence: 0.55)
📂 [COHERE] Category from description: concrete (score: 0.55)
[COHERE DEBUG] Item 330: bestMatch = { confidence: 51, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 330, Total confidence: 17395.75395705839
✅ Match (51%): "Vertical; to concrete (Perimet..."
📂 [COHERE] Category from description: excavation (score: 0.5428571428571428)
📂 [COHERE] Item 331: Category = excavation (confidence: 0.5428571428571428)
📂 [COHERE] Category from description: excavation (score: 0.5428571428571428)
[COHERE DEBUG] Item 331: bestMatch = { confidence: 54, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 331, Total confidence: 17449.947772531927
✅ Match (54%): "Vertical; to concrete (Sides o..."
📂 [COHERE] Category from description: roofing (score: 0.56)
📂 [COHERE] Item 332: Category = roofing (confidence: 0.56)
📂 [COHERE] Category from description: roofing (score: 0.56)
[COHERE DEBUG] Item 332: bestMatch = { confidence: 50, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 332, Total confidence: 17499.477163385745
⚠️  Low confidence (50%): "thick; to Insulation; horizont..."
📂 [COHERE] Category from description: concrete (score: 0.55)
📂 [COHERE] Item 333: Category = concrete (confidence: 0.55)
📂 [COHERE] Category from description: concrete (score: 0.55)
[COHERE DEBUG] Item 333: bestMatch = { confidence: 51, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 333, Total confidence: 17550.407796064326
✅ Match (51%): "thick; to concrete; horizontal..."
📂 [COHERE] Category from description: concrete (score: 0.55)
📂 [COHERE] Item 334: Category = concrete (confidence: 0.55)
📂 [COHERE] Category from description: concrete (score: 0.55)
[COHERE DEBUG] Item 334: bestMatch = { confidence: 51, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 334, Total confidence: 17601.338428742907
✅ Match (51%): "thick; to concrete; horizontal..."
📂 [COHERE] Category from description: concrete (score: 0.55)
📂 [COHERE] Item 335: Category = concrete (confidence: 0.55)
📂 [COHERE] Category from description: concrete (score: 0.55)
[COHERE DEBUG] Item 335: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 335, Total confidence: 17654.57858516156
✅ Match (53%): "thick; to concrete; horizontal..."
📂 [COHERE] Category from description: doors_windows (score: 0.56)
📂 [COHERE] Item 336: Category = doors_windows (confidence: 0.56)
📂 [COHERE] Category from description: doors_windows (score: 0.56)
[COHERE DEBUG] Item 336: bestMatch = { confidence: 39, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 336, Total confidence: 17693.978056588214
⚠️  Low confidence (39%): "At Door Thresholds and the lik..."
📂 [COHERE] Item 337: Category = none (confidence: 0)
[COHERE DEBUG] Item 337: bestMatch = { confidence: 37, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 337, Total confidence: 17730.975089373456
⚠️  Low confidence (37%): "Generally; PRICING POINT ALLOW..."
📂 [COHERE] Item 338: Category = none (confidence: 0)
[COHERE DEBUG] Item 338: bestMatch = { confidence: 43, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 338, Total confidence: 17773.732332378517
⚠️  Low confidence (43%): "m maximum depth..."
📂 [COHERE] Item 339: Category = none (confidence: 0)
[COHERE DEBUG] Item 339: bestMatch = { confidence: 42, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 339, Total confidence: 17815.297351165103
⚠️  Low confidence (42%): "Toxic/hazardous material; (PRI..."
📂 [COHERE] Category from description: excavation (score: 0.5428571428571428)
📂 [COHERE] Item 340: Category = excavation (confidence: 0.5428571428571428)
📂 [COHERE] Category from description: excavation (score: 0.5428571428571428)
[COHERE DEBUG] Item 340: bestMatch = { confidence: 49, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 340, Total confidence: 17864.124056911744
⚠️  Low confidence (49%): "Below ground water level; (PRI..."
📂 [COHERE] Category from description: plumbing (score: 0.55)
📂 [COHERE] Item 341: Category = plumbing (confidence: 0.55)
📂 [COHERE] Category from description: plumbing (score: 0.55)
[COHERE DEBUG] Item 341: bestMatch = { confidence: 38, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 341, Total confidence: 17902.538914898243
⚠️  Low confidence (38%): "Surface water..."
📂 [COHERE] Item 342: Category = none (confidence: 0)
[COHERE DEBUG] Item 342: bestMatch = { confidence: 38, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 342, Total confidence: 17940.364540014383
⚠️  Low confidence (38%): "Off site..."
📂 [COHERE] Category from description: excavation (score: 0.5428571428571428)
📂 [COHERE] Item 343: Category = excavation (confidence: 0.5428571428571428)
📂 [COHERE] Category from description: excavation (score: 0.5428571428571428)
[COHERE DEBUG] Item 343: bestMatch = { confidence: 54, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 343, Total confidence: 17994.217856036026
✅ Match (54%): "Compacting; bottoms of excavat..."
📂 [COHERE] Category from description: concrete (score: 0.55)
📂 [COHERE] Item 344: Category = concrete (confidence: 0.55)
📂 [COHERE] Category from description: concrete (score: 0.55)
[COHERE DEBUG] Item 344: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 344, Total confidence: 18046.867208112493
✅ Match (53%): "x 255; laid 0-6mm upstand; con..."
📂 [COHERE] Category from description: concrete (score: 0.55)
📂 [COHERE] Item 345: Category = concrete (confidence: 0.55)
📂 [COHERE] Category from description: concrete (score: 0.55)
[COHERE DEBUG] Item 345: bestMatch = { confidence: 55, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 345, Total confidence: 18101.71715385508
✅ Match (55%): "x 150 x 915 long; laid flush; ..."
📂 [COHERE] Category from description: concrete (score: 0.55)
📂 [COHERE] Item 346: Category = concrete (confidence: 0.55)
📂 [COHERE] Category from description: concrete (score: 0.55)
[COHERE DEBUG] Item 346: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 346, Total confidence: 18154.97447620939
✅ Match (53%): "x 150 x 915 long; laid flush; ..."
📂 [COHERE] Category from description: concrete (score: 0.55)
📂 [COHERE] Item 347: Category = concrete (confidence: 0.55)
📂 [COHERE] Category from description: concrete (score: 0.55)
[COHERE DEBUG] Item 347: bestMatch = { confidence: 55, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 347, Total confidence: 18210.189461333197
✅ Match (55%): "x 150 x 915 long; laid flush; ..."
📂 [COHERE] Category from description: concrete (score: 0.55)
📂 [COHERE] Item 348: Category = concrete (confidence: 0.55)
📂 [COHERE] Category from description: concrete (score: 0.55)
[COHERE DEBUG] Item 348: bestMatch = { confidence: 54, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 348, Total confidence: 18263.892323813077
✅ Match (54%): "x 150 x 915 long; laid flush; ..."
📂 [COHERE] Category from description: concrete (score: 0.55)
📂 [COHERE] Item 349: Category = concrete (confidence: 0.55)
📂 [COHERE] Category from description: concrete (score: 0.55)
[COHERE DEBUG] Item 349: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 349, Total confidence: 18317.328876065458
✅ Match (53%): "x 255; laid 125mm upstand; con..."
📂 [COHERE] Item 350: Category = none (confidence: 0)
[COHERE DEBUG] Item 350: bestMatch = { confidence: 55, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 350, Total confidence: 18372.33666061086
✅ Match (55%): "Extra over for dropper kerbs..."
📂 [COHERE] Category from description: concrete (score: 0.55)
📂 [COHERE] Item 351: Category = concrete (confidence: 0.55)
📂 [COHERE] Category from description: concrete (score: 0.55)
[COHERE DEBUG] Item 351: bestMatch = { confidence: 55, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 351, Total confidence: 18427.22539094787
✅ Match (55%): "x 200; laid flush; concrete fo..."
📂 [COHERE] Category from description: concrete (score: 0.55)
📂 [COHERE] Item 352: Category = concrete (confidence: 0.55)
📂 [COHERE] Category from description: concrete (score: 0.55)
[COHERE DEBUG] Item 352: bestMatch = { confidence: 54, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 352, Total confidence: 18481.601016387678
✅ Match (54%): "x 200; laid flush; concrete fo..."
📂 [COHERE] Category from header: excavation (Page Total 22000/1/1 > Page Total 22000/2/1 > Q20 Hardcore/Granular/Cement bound bases/sub-bases to roads/pavings

6F2 capping layer; graded so that when compacted is dense without voids; refer to engineers drawing ECS2-CDL-XX-XX-DR-C-50010 Rev P03

Filling to make up levels)
📂 [COHERE] Item 353: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 22000/1/1 > Page Total 22000/2/1 > Q20 Hardcore/Granular/Cement bound bases/sub-bases to roads/pavings

6F2 capping layer; graded so that when compacted is dense without voids; refer to engineers drawing ECS2-CDL-XX-XX-DR-C-50010 Rev P03

Filling to make up levels)
[COHERE DEBUG] Item 353: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 353, Total confidence: 18534.182595573926
✅ Match (53%): "Not exceeding 250 average thic..."
📂 [COHERE] Category from header: excavation (Page Total 22000/2/1 > Q20 Hardcore/Granular/Cement bound bases/sub-bases to roads/pavings

6F2 capping layer; graded so that when compacted is dense without voids; refer to engineers drawing ECS2-CDL-XX-XX-DR-C-50010 Rev P03

Filling to make up levels > Page Total 22000/2/2)
📂 [COHERE] Item 354: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 22000/2/1 > Q20 Hardcore/Granular/Cement bound bases/sub-bases to roads/pavings

6F2 capping layer; graded so that when compacted is dense without voids; refer to engineers drawing ECS2-CDL-XX-XX-DR-C-50010 Rev P03

Filling to make up levels > Page Total 22000/2/2)
[COHERE DEBUG] Item 354: bestMatch = { confidence: 50, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 354, Total confidence: 18584.318289822433
✅ Match (50%): "Not exceeding 250 average thic..."
📂 [COHERE] Category from header: excavation (Page Total 22000/2/1 > Q20 Hardcore/Granular/Cement bound bases/sub-bases to roads/pavings

6F2 capping layer; graded so that when compacted is dense without voids; refer to engineers drawing ECS2-CDL-XX-XX-DR-C-50010 Rev P03

Filling to make up levels > Page Total 22000/2/2)
📂 [COHERE] Item 355: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 22000/2/1 > Q20 Hardcore/Granular/Cement bound bases/sub-bases to roads/pavings

6F2 capping layer; graded so that when compacted is dense without voids; refer to engineers drawing ECS2-CDL-XX-XX-DR-C-50010 Rev P03

Filling to make up levels > Page Total 22000/2/2)
[COHERE DEBUG] Item 355: bestMatch = { confidence: 47, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 355, Total confidence: 18631.689225908292
⚠️  Low confidence (47%): "extra over for Cedadrive honey..."
📂 [COHERE] Category from header: excavation (Page Total 22000/2/1 > Q20 Hardcore/Granular/Cement bound bases/sub-bases to roads/pavings

6F2 capping layer; graded so that when compacted is dense without voids; refer to engineers drawing ECS2-CDL-XX-XX-DR-C-50010 Rev P03

Filling to make up levels > Page Total 22000/2/2)
📂 [COHERE] Item 356: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 22000/2/1 > Q20 Hardcore/Granular/Cement bound bases/sub-bases to roads/pavings

6F2 capping layer; graded so that when compacted is dense without voids; refer to engineers drawing ECS2-CDL-XX-XX-DR-C-50010 Rev P03

Filling to make up levels > Page Total 22000/2/2)
[COHERE DEBUG] Item 356: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 356, Total confidence: 18684.6727625515
✅ Match (53%): "Exceeding 250 average thick; d..."
📂 [COHERE] Category from header: excavation (Page Total 22000/2/1 > Q20 Hardcore/Granular/Cement bound bases/sub-bases to roads/pavings

6F2 capping layer; graded so that when compacted is dense without voids; refer to engineers drawing ECS2-CDL-XX-XX-DR-C-50010 Rev P03

Filling to make up levels > Page Total 22000/2/2)
📂 [COHERE] Item 357: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 22000/2/1 > Q20 Hardcore/Granular/Cement bound bases/sub-bases to roads/pavings

6F2 capping layer; graded so that when compacted is dense without voids; refer to engineers drawing ECS2-CDL-XX-XX-DR-C-50010 Rev P03

Filling to make up levels > Page Total 22000/2/2)
[COHERE DEBUG] Item 357: bestMatch = { confidence: 50, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 357, Total confidence: 18734.2399473588
⚠️  Low confidence (50%): "Not exceeding 250 average thic..."
📂 [COHERE] Category from header: excavation (Page Total 22000/2/1 > Q20 Hardcore/Granular/Cement bound bases/sub-bases to roads/pavings

6F2 capping layer; graded so that when compacted is dense without voids; refer to engineers drawing ECS2-CDL-XX-XX-DR-C-50010 Rev P03

Filling to make up levels > Page Total 22000/2/2)
📂 [COHERE] Item 358: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 22000/2/1 > Q20 Hardcore/Granular/Cement bound bases/sub-bases to roads/pavings

6F2 capping layer; graded so that when compacted is dense without voids; refer to engineers drawing ECS2-CDL-XX-XX-DR-C-50010 Rev P03

Filling to make up levels > Page Total 22000/2/2)
[COHERE DEBUG] Item 358: bestMatch = { confidence: 49, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 358, Total confidence: 18783.06247664203
⚠️  Low confidence (49%): "extra over for cellweb TRP sys..."
📂 [COHERE] Category from header: excavation (Page Total 22000/2/1 > Q20 Hardcore/Granular/Cement bound bases/sub-bases to roads/pavings

6F2 capping layer; graded so that when compacted is dense without voids; refer to engineers drawing ECS2-CDL-XX-XX-DR-C-50010 Rev P03

Filling to make up levels > Page Total 22000/2/2)
📂 [COHERE] Item 359: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 22000/2/1 > Q20 Hardcore/Granular/Cement bound bases/sub-bases to roads/pavings

6F2 capping layer; graded so that when compacted is dense without voids; refer to engineers drawing ECS2-CDL-XX-XX-DR-C-50010 Rev P03

Filling to make up levels > Page Total 22000/2/2)
[COHERE DEBUG] Item 359: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 359, Total confidence: 18835.985044717218
✅ Match (53%): "Over 250 average thick; deposi..."
📂 [COHERE] Category from header: excavation (Page Total 22000/2/1 > Q20 Hardcore/Granular/Cement bound bases/sub-bases to roads/pavings

6F2 capping layer; graded so that when compacted is dense without voids; refer to engineers drawing ECS2-CDL-XX-XX-DR-C-50010 Rev P03

Filling to make up levels > Page Total 22000/2/2)
📂 [COHERE] Item 360: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 22000/2/1 > Q20 Hardcore/Granular/Cement bound bases/sub-bases to roads/pavings

6F2 capping layer; graded so that when compacted is dense without voids; refer to engineers drawing ECS2-CDL-XX-XX-DR-C-50010 Rev P03

Filling to make up levels > Page Total 22000/2/2)
[COHERE DEBUG] Item 360: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 360, Total confidence: 18888.907612792405
✅ Match (53%): "Over 250 average thick; deposi..."
📂 [COHERE] Category from header: excavation (Page Total 22000/2/1 > Q20 Hardcore/Granular/Cement bound bases/sub-bases to roads/pavings

6F2 capping layer; graded so that when compacted is dense without voids; refer to engineers drawing ECS2-CDL-XX-XX-DR-C-50010 Rev P03

Filling to make up levels > Page Total 22000/2/2)
📂 [COHERE] Item 361: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 22000/2/1 > Q20 Hardcore/Granular/Cement bound bases/sub-bases to roads/pavings

6F2 capping layer; graded so that when compacted is dense without voids; refer to engineers drawing ECS2-CDL-XX-XX-DR-C-50010 Rev P03

Filling to make up levels > Page Total 22000/2/2)
[COHERE DEBUG] Item 361: bestMatch = { confidence: 52, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 361, Total confidence: 18941.052468364793
✅ Match (52%): "Not exceeding 250 average thic..."
📂 [COHERE] Category from header: excavation (Q20 Hardcore/Granular/Cement bound bases/sub-bases to roads/pavings

6F2 capping layer; graded so that when compacted is dense without voids; refer to engineers drawing ECS2-CDL-XX-XX-DR-C-50010 Rev P03

Filling to make up levels > Page Total 22000/2/2 > Page Total 22000/2/3)
📂 [COHERE] Item 362: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Q20 Hardcore/Granular/Cement bound bases/sub-bases to roads/pavings

6F2 capping layer; graded so that when compacted is dense without voids; refer to engineers drawing ECS2-CDL-XX-XX-DR-C-50010 Rev P03

Filling to make up levels > Page Total 22000/2/2 > Page Total 22000/2/3)
[COHERE DEBUG] Item 362: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 362, Total confidence: 18993.568018025544
✅ Match (53%): "Not exceeding 250 average thic..."
📂 [COHERE] Category from header: excavation (Q20 Hardcore/Granular/Cement bound bases/sub-bases to roads/pavings

6F2 capping layer; graded so that when compacted is dense without voids; refer to engineers drawing ECS2-CDL-XX-XX-DR-C-50010 Rev P03

Filling to make up levels > Page Total 22000/2/2 > Page Total 22000/2/3)
📂 [COHERE] Item 363: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Q20 Hardcore/Granular/Cement bound bases/sub-bases to roads/pavings

6F2 capping layer; graded so that when compacted is dense without voids; refer to engineers drawing ECS2-CDL-XX-XX-DR-C-50010 Rev P03

Filling to make up levels > Page Total 22000/2/2 > Page Total 22000/2/3)
[COHERE DEBUG] Item 363: bestMatch = { confidence: 57, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 363, Total confidence: 19050.455004841613
✅ Match (57%): "Filling; 50mm blinding with qu..."
📂 [COHERE] Category from header: excavation (Q20 Hardcore/Granular/Cement bound bases/sub-bases to roads/pavings

6F2 capping layer; graded so that when compacted is dense without voids; refer to engineers drawing ECS2-CDL-XX-XX-DR-C-50010 Rev P03

Filling to make up levels > Page Total 22000/2/2 > Page Total 22000/2/3)
📂 [COHERE] Item 364: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Q20 Hardcore/Granular/Cement bound bases/sub-bases to roads/pavings

6F2 capping layer; graded so that when compacted is dense without voids; refer to engineers drawing ECS2-CDL-XX-XX-DR-C-50010 Rev P03

Filling to make up levels > Page Total 22000/2/2 > Page Total 22000/2/3)
[COHERE DEBUG] Item 364: bestMatch = { confidence: 55, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 364, Total confidence: 19105.357852028534
✅ Match (55%): "Filling; 50mm free draining ag..."
📂 [COHERE] Category from header: excavation (Q20 Hardcore/Granular/Cement bound bases/sub-bases to roads/pavings

6F2 capping layer; graded so that when compacted is dense without voids; refer to engineers drawing ECS2-CDL-XX-XX-DR-C-50010 Rev P03

Filling to make up levels > Page Total 22000/2/2 > Page Total 22000/2/3)
📂 [COHERE] Item 365: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Q20 Hardcore/Granular/Cement bound bases/sub-bases to roads/pavings

6F2 capping layer; graded so that when compacted is dense without voids; refer to engineers drawing ECS2-CDL-XX-XX-DR-C-50010 Rev P03

Filling to make up levels > Page Total 22000/2/2 > Page Total 22000/2/3)
[COHERE DEBUG] Item 365: bestMatch = { confidence: 52, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 365, Total confidence: 19156.899330992783
✅ Match (52%): "Generally; over 300 wide; laid..."
📂 [COHERE] Category from header: excavation (Q20 Hardcore/Granular/Cement bound bases/sub-bases to roads/pavings

6F2 capping layer; graded so that when compacted is dense without voids; refer to engineers drawing ECS2-CDL-XX-XX-DR-C-50010 Rev P03

Filling to make up levels > Page Total 22000/2/2 > Page Total 22000/2/3)
📂 [COHERE] Item 366: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Q20 Hardcore/Granular/Cement bound bases/sub-bases to roads/pavings

6F2 capping layer; graded so that when compacted is dense without voids; refer to engineers drawing ECS2-CDL-XX-XX-DR-C-50010 Rev P03

Filling to make up levels > Page Total 22000/2/2 > Page Total 22000/2/3)
[COHERE DEBUG] Item 366: bestMatch = { confidence: 52, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 366, Total confidence: 19208.440809957032
✅ Match (52%): "Generally; over 300 wide; laid..."
📂 [COHERE] Item 367: Category = none (confidence: 0)
[COHERE DEBUG] Item 367: bestMatch = { confidence: 54, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 367, Total confidence: 19262.404243868772
✅ Match (54%): "To falls or cross falls and to..."
📂 [COHERE] Category from header: excavation (Page Total 22000/2/4 > Q23 Gravel/Hoggin roads/pavings/woodchip

Loose gravel; ECCOGRAVEL, ref: Golden flint; 10mm aggregate size; no Spec; refer to drawing EXS2-CDL-XX-XX-DR-C-50010 Rev P03

Pavings > Q24 Interlocking brick / block roads / pavings

Paving; Permeable Clay block paving; Chelmer Valley Ltd, Alpha collection, ref: Spalding; colour: TBC; size TBC; 2-5mm wide joints, filled with sand; bond: herringbone pattern; laid on 50mm free draining bedding to BS7533-13 Table A.2; as Spec Q24/1205; refer to drawing ECS2-CDL-XX-XX-DR-C-50010 Rev P03

Paving type 04)
📂 [COHERE] Item 368: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 22000/2/4 > Q23 Gravel/Hoggin roads/pavings/woodchip

Loose gravel; ECCOGRAVEL, ref: Golden flint; 10mm aggregate size; no Spec; refer to drawing EXS2-CDL-XX-XX-DR-C-50010 Rev P03

Pavings > Q24 Interlocking brick / block roads / pavings

Paving; Permeable Clay block paving; Chelmer Valley Ltd, Alpha collection, ref: Spalding; colour: TBC; size TBC; 2-5mm wide joints, filled with sand; bond: herringbone pattern; laid on 50mm free draining bedding to BS7533-13 Table A.2; as Spec Q24/1205; refer to drawing ECS2-CDL-XX-XX-DR-C-50010 Rev P03

Paving type 04)
[COHERE DEBUG] Item 368: bestMatch = { confidence: 52, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 368, Total confidence: 19314.454766228995
✅ Match (52%): "To falls or cross falls and to..."
📂 [COHERE] Category from header: excavation (Page Total 22000/2/4 > Q23 Gravel/Hoggin roads/pavings/woodchip

Loose gravel; ECCOGRAVEL, ref: Golden flint; 10mm aggregate size; no Spec; refer to drawing EXS2-CDL-XX-XX-DR-C-50010 Rev P03

Pavings > Q24 Interlocking brick / block roads / pavings

Paving; Permeable Clay block paving; Chelmer Valley Ltd, Alpha collection, ref: Spalding; colour: TBC; size TBC; 2-5mm wide joints, filled with sand; bond: herringbone pattern; laid on 50mm free draining bedding to BS7533-13 Table A.2; as Spec Q24/1205; refer to drawing ECS2-CDL-XX-XX-DR-C-50010 Rev P03

Paving type 04)
📂 [COHERE] Item 369: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 22000/2/4 > Q23 Gravel/Hoggin roads/pavings/woodchip

Loose gravel; ECCOGRAVEL, ref: Golden flint; 10mm aggregate size; no Spec; refer to drawing EXS2-CDL-XX-XX-DR-C-50010 Rev P03

Pavings > Q24 Interlocking brick / block roads / pavings

Paving; Permeable Clay block paving; Chelmer Valley Ltd, Alpha collection, ref: Spalding; colour: TBC; size TBC; 2-5mm wide joints, filled with sand; bond: herringbone pattern; laid on 50mm free draining bedding to BS7533-13 Table A.2; as Spec Q24/1205; refer to drawing ECS2-CDL-XX-XX-DR-C-50010 Rev P03

Paving type 04)
[COHERE DEBUG] Item 369: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 369, Total confidence: 19367.636393047465
✅ Match (53%): "Sunmittals as Spec Q24.2100-21..."
📂 [COHERE] Category from header: excavation (Page Total 22000/2/4 > Q23 Gravel/Hoggin roads/pavings/woodchip

Loose gravel; ECCOGRAVEL, ref: Golden flint; 10mm aggregate size; no Spec; refer to drawing EXS2-CDL-XX-XX-DR-C-50010 Rev P03

Pavings > Q24 Interlocking brick / block roads / pavings

Paving; Permeable Clay block paving; Chelmer Valley Ltd, Alpha collection, ref: Spalding; colour: TBC; size TBC; 2-5mm wide joints, filled with sand; bond: herringbone pattern; laid on 50mm free draining bedding to BS7533-13 Table A.2; as Spec Q24/1205; refer to drawing ECS2-CDL-XX-XX-DR-C-50010 Rev P03

Paving type 04)
📂 [COHERE] Item 370: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 22000/2/4 > Q23 Gravel/Hoggin roads/pavings/woodchip

Loose gravel; ECCOGRAVEL, ref: Golden flint; 10mm aggregate size; no Spec; refer to drawing EXS2-CDL-XX-XX-DR-C-50010 Rev P03

Pavings > Q24 Interlocking brick / block roads / pavings

Paving; Permeable Clay block paving; Chelmer Valley Ltd, Alpha collection, ref: Spalding; colour: TBC; size TBC; 2-5mm wide joints, filled with sand; bond: herringbone pattern; laid on 50mm free draining bedding to BS7533-13 Table A.2; as Spec Q24/1205; refer to drawing ECS2-CDL-XX-XX-DR-C-50010 Rev P03

Paving type 04)
[COHERE DEBUG] Item 370: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 370, Total confidence: 19420.29977858846
✅ Match (53%): "Extra over for cutting paving ..."
📂 [COHERE] Category from header: excavation (Page Total 22000/2/4 > Q23 Gravel/Hoggin roads/pavings/woodchip

Loose gravel; ECCOGRAVEL, ref: Golden flint; 10mm aggregate size; no Spec; refer to drawing EXS2-CDL-XX-XX-DR-C-50010 Rev P03

Pavings > Q24 Interlocking brick / block roads / pavings

Paving; Permeable Clay block paving; Chelmer Valley Ltd, Alpha collection, ref: Spalding; colour: TBC; size TBC; 2-5mm wide joints, filled with sand; bond: herringbone pattern; laid on 50mm free draining bedding to BS7533-13 Table A.2; as Spec Q24/1205; refer to drawing ECS2-CDL-XX-XX-DR-C-50010 Rev P03

Paving type 04)
📂 [COHERE] Item 371: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 22000/2/4 > Q23 Gravel/Hoggin roads/pavings/woodchip

Loose gravel; ECCOGRAVEL, ref: Golden flint; 10mm aggregate size; no Spec; refer to drawing EXS2-CDL-XX-XX-DR-C-50010 Rev P03

Pavings > Q24 Interlocking brick / block roads / pavings

Paving; Permeable Clay block paving; Chelmer Valley Ltd, Alpha collection, ref: Spalding; colour: TBC; size TBC; 2-5mm wide joints, filled with sand; bond: herringbone pattern; laid on 50mm free draining bedding to BS7533-13 Table A.2; as Spec Q24/1205; refer to drawing ECS2-CDL-XX-XX-DR-C-50010 Rev P03

Paving type 04)
[COHERE DEBUG] Item 371: bestMatch = { confidence: 58, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 371, Total confidence: 19478.48760905646
✅ Match (58%): "Treads; 350 wide; fixing to co..."
📂 [COHERE] Category from header: excavation (Q23 Gravel/Hoggin roads/pavings/woodchip

Loose gravel; ECCOGRAVEL, ref: Golden flint; 10mm aggregate size; no Spec; refer to drawing EXS2-CDL-XX-XX-DR-C-50010 Rev P03

Pavings > Q24 Interlocking brick / block roads / pavings

Paving; Permeable Clay block paving; Chelmer Valley Ltd, Alpha collection, ref: Spalding; colour: TBC; size TBC; 2-5mm wide joints, filled with sand; bond: herringbone pattern; laid on 50mm free draining bedding to BS7533-13 Table A.2; as Spec Q24/1205; refer to drawing ECS2-CDL-XX-XX-DR-C-50010 Rev P03

Paving type 04 > Q25 Slab/Brick/Block/Sett/Cobble pavings

Paving; Contractors Proposal's, ref: Blister Paving; colour: TBC; Size: TBC; laid on 50mm sharp sand bedding; 6mm joints; no Spec

Pavings)
📂 [COHERE] Item 372: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Q23 Gravel/Hoggin roads/pavings/woodchip

Loose gravel; ECCOGRAVEL, ref: Golden flint; 10mm aggregate size; no Spec; refer to drawing EXS2-CDL-XX-XX-DR-C-50010 Rev P03

Pavings > Q24 Interlocking brick / block roads / pavings

Paving; Permeable Clay block paving; Chelmer Valley Ltd, Alpha collection, ref: Spalding; colour: TBC; size TBC; 2-5mm wide joints, filled with sand; bond: herringbone pattern; laid on 50mm free draining bedding to BS7533-13 Table A.2; as Spec Q24/1205; refer to drawing ECS2-CDL-XX-XX-DR-C-50010 Rev P03

Paving type 04 > Q25 Slab/Brick/Block/Sett/Cobble pavings

Paving; Contractors Proposal's, ref: Blister Paving; colour: TBC; Size: TBC; laid on 50mm sharp sand bedding; 6mm joints; no Spec

Pavings)
[COHERE DEBUG] Item 372: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 372, Total confidence: 19531.695238036853
✅ Match (53%): "Generally; to falls or cross f..."
📂 [COHERE] Category from header: excavation (Q24 Interlocking brick / block roads / pavings

Paving; Permeable Clay block paving; Chelmer Valley Ltd, Alpha collection, ref: Spalding; colour: TBC; size TBC; 2-5mm wide joints, filled with sand; bond: herringbone pattern; laid on 50mm free draining bedding to BS7533-13 Table A.2; as Spec Q24/1205; refer to drawing ECS2-CDL-XX-XX-DR-C-50010 Rev P03

Paving type 04 > Q25 Slab/Brick/Block/Sett/Cobble pavings

Paving; Contractors Proposal's, ref: Blister Paving; colour: TBC; Size: TBC; laid on 50mm sharp sand bedding; 6mm joints; no Spec

Pavings > Page Total 22000/2/5)
📂 [COHERE] Item 373: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Q24 Interlocking brick / block roads / pavings

Paving; Permeable Clay block paving; Chelmer Valley Ltd, Alpha collection, ref: Spalding; colour: TBC; size TBC; 2-5mm wide joints, filled with sand; bond: herringbone pattern; laid on 50mm free draining bedding to BS7533-13 Table A.2; as Spec Q24/1205; refer to drawing ECS2-CDL-XX-XX-DR-C-50010 Rev P03

Paving type 04 > Q25 Slab/Brick/Block/Sett/Cobble pavings

Paving; Contractors Proposal's, ref: Blister Paving; colour: TBC; Size: TBC; laid on 50mm sharp sand bedding; 6mm joints; no Spec

Pavings > Page Total 22000/2/5)
[COHERE DEBUG] Item 373: bestMatch = { confidence: 57, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 373, Total confidence: 19588.899148774977
✅ Match (57%): "Not exceeding 150 thick; (Mud ..."
📂 [COHERE] Category from header: excavation (Q24 Interlocking brick / block roads / pavings

Paving; Permeable Clay block paving; Chelmer Valley Ltd, Alpha collection, ref: Spalding; colour: TBC; size TBC; 2-5mm wide joints, filled with sand; bond: herringbone pattern; laid on 50mm free draining bedding to BS7533-13 Table A.2; as Spec Q24/1205; refer to drawing ECS2-CDL-XX-XX-DR-C-50010 Rev P03

Paving type 04 > Q25 Slab/Brick/Block/Sett/Cobble pavings

Paving; Contractors Proposal's, ref: Blister Paving; colour: TBC; Size: TBC; laid on 50mm sharp sand bedding; 6mm joints; no Spec

Pavings > Page Total 22000/2/5)
📂 [COHERE] Item 374: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Q24 Interlocking brick / block roads / pavings

Paving; Permeable Clay block paving; Chelmer Valley Ltd, Alpha collection, ref: Spalding; colour: TBC; size TBC; 2-5mm wide joints, filled with sand; bond: herringbone pattern; laid on 50mm free draining bedding to BS7533-13 Table A.2; as Spec Q24/1205; refer to drawing ECS2-CDL-XX-XX-DR-C-50010 Rev P03

Paving type 04 > Q25 Slab/Brick/Block/Sett/Cobble pavings

Paving; Contractors Proposal's, ref: Blister Paving; colour: TBC; Size: TBC; laid on 50mm sharp sand bedding; 6mm joints; no Spec

Pavings > Page Total 22000/2/5)
[COHERE DEBUG] Item 374: bestMatch = { confidence: 59, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 374, Total confidence: 19647.574086508663
✅ Match (59%): "Generally; (150 thick x 400 hi..."
📂 [COHERE] Category from header: excavation (Q24 Interlocking brick / block roads / pavings

Paving; Permeable Clay block paving; Chelmer Valley Ltd, Alpha collection, ref: Spalding; colour: TBC; size TBC; 2-5mm wide joints, filled with sand; bond: herringbone pattern; laid on 50mm free draining bedding to BS7533-13 Table A.2; as Spec Q24/1205; refer to drawing ECS2-CDL-XX-XX-DR-C-50010 Rev P03

Paving type 04 > Q25 Slab/Brick/Block/Sett/Cobble pavings

Paving; Contractors Proposal's, ref: Blister Paving; colour: TBC; Size: TBC; laid on 50mm sharp sand bedding; 6mm joints; no Spec

Pavings > Page Total 22000/2/5)
📂 [COHERE] Item 375: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Q24 Interlocking brick / block roads / pavings

Paving; Permeable Clay block paving; Chelmer Valley Ltd, Alpha collection, ref: Spalding; colour: TBC; size TBC; 2-5mm wide joints, filled with sand; bond: herringbone pattern; laid on 50mm free draining bedding to BS7533-13 Table A.2; as Spec Q24/1205; refer to drawing ECS2-CDL-XX-XX-DR-C-50010 Rev P03

Paving type 04 > Q25 Slab/Brick/Block/Sett/Cobble pavings

Paving; Contractors Proposal's, ref: Blister Paving; colour: TBC; Size: TBC; laid on 50mm sharp sand bedding; 6mm joints; no Spec

Pavings > Page Total 22000/2/5)
[COHERE DEBUG] Item 375: bestMatch = { confidence: 57, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 375, Total confidence: 19704.23136164168
✅ Match (57%): "Not exceeding 150 thick..."
📂 [COHERE] Category from header: concrete (Q25 Slab/Brick/Block/Sett/Cobble pavings

Paving; Contractors Proposal's, ref: Blister Paving; colour: TBC; Size: TBC; laid on 50mm sharp sand bedding; 6mm joints; no Spec

Pavings > Page Total 22000/2/5 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of upstands)
📂 [COHERE] Item 376: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Q25 Slab/Brick/Block/Sett/Cobble pavings

Paving; Contractors Proposal's, ref: Blister Paving; colour: TBC; Size: TBC; laid on 50mm sharp sand bedding; 6mm joints; no Spec

Pavings > Page Total 22000/2/5 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of upstands)
[COHERE DEBUG] Item 376: bestMatch = { confidence: 56, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 376, Total confidence: 19760.26870272346
✅ Match (56%): "over 250 not exceeding 500 hig..."
📂 [COHERE] Category from header: concrete (Q25 Slab/Brick/Block/Sett/Cobble pavings

Paving; Contractors Proposal's, ref: Blister Paving; colour: TBC; Size: TBC; laid on 50mm sharp sand bedding; 6mm joints; no Spec

Pavings > Page Total 22000/2/5 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of upstands)
📂 [COHERE] Item 377: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Q25 Slab/Brick/Block/Sett/Cobble pavings

Paving; Contractors Proposal's, ref: Blister Paving; colour: TBC; Size: TBC; laid on 50mm sharp sand bedding; 6mm joints; no Spec

Pavings > Page Total 22000/2/5 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of upstands)
[COHERE DEBUG] Item 377: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 377, Total confidence: 19813.068720455012
✅ Match (53%): "not exceeding 250 high..."
📂 [COHERE] Category from header: concrete (Page Total 22000/2/5 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of upstands > E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars)
📂 [COHERE] Item 378: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 22000/2/5 > E20 Formwork for in situ concrete

Formwork; Basic finish; As Engineers Spec E20/610

Sides of upstands > E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars)
[COHERE DEBUG] Item 378: bestMatch = { confidence: 54, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 378, Total confidence: 19867.22701431002
✅ Match (54%): "Variable nominal size; straigh..."
📂 [COHERE] Category from header: concrete (E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars > Page Total 22000/3/1 > E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain)
📂 [COHERE] Item 379: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (E30 Reinforcement for in situ concrete

Reinforcement bars; As Architects Spec E30.150; to BS4449; including hooks; tying wire; spacers and chairs; as Engineers Notes; NOT measured in accordance with SMM7R

Bars > Page Total 22000/3/1 > E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain)
[COHERE DEBUG] Item 379: bestMatch = { confidence: 57, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 379, Total confidence: 19924.551408455765
✅ Match (57%): "300 wide; (150 thick slab) - P..."
📂 [COHERE] Category from header: excavation (Page Total 22000/3/1 > E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
📂 [COHERE] Item 380: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 22000/3/1 > E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
[COHERE DEBUG] Item 380: bestMatch = { confidence: 51, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 380, Total confidence: 19975.529551428976
✅ Match (51%): "Generally; (Mud mat)..."
📂 [COHERE] Category from header: excavation (Page Total 22000/3/1 > E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
📂 [COHERE] Item 381: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 22000/3/1 > E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
[COHERE DEBUG] Item 381: bestMatch = { confidence: 49, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 381, Total confidence: 20024.984293865335
⚠️  Low confidence (49%): "Generally..."
📂 [COHERE] Category from header: excavation (Page Total 22000/3/1 > E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
📂 [COHERE] Item 382: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 22000/3/1 > E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
[COHERE DEBUG] Item 382: bestMatch = { confidence: 51, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 382, Total confidence: 20076.10965790903
✅ Match (51%): "Generally; 150 wide (Top of Up..."
📂 [COHERE] Category from header: excavation (E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 22000/3/2)
📂 [COHERE] Item 383: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 22000/3/2)
[COHERE DEBUG] Item 383: bestMatch = { confidence: 50, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 383, Total confidence: 20126.259559918857
✅ Match (50%): "00 m maximum depth..."
📂 [COHERE] Category from header: excavation (E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 22000/3/2)
📂 [COHERE] Item 384: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 22000/3/2)
[COHERE DEBUG] Item 384: bestMatch = { confidence: 51, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 384, Total confidence: 20177.13192946192
✅ Match (51%): "Off site..."
❌ [COHERE MATCH] Failed to update progress for batch 4/6
   🚀 Processing batch 5/6 (96 items)
[COHERE] Using enhanced description: "Clean stone; 50-75 dia; drainage layer to bottom of tree pit..."
[COHERE] Using enhanced description: "Page Total 22000/5/1: 00 m maximum depth..."
[COHERE] Using enhanced description: "Excavating

Trenches; width over 300 wide: 00 m maximum de..."
[COHERE] Using enhanced description: "Extra over excavation irrespective of depth for excavating: ..."
[COHERE] Using enhanced description: "Extra over excavation irrespective of depth for excavating: ..."
[COHERE] Using enhanced description: "Extra over excavation irrespective of depth for excavating: ..."
[COHERE] Using enhanced description: "Page Total 22000/6/1: Generally..."
[COHERE] Using enhanced description: "E30 Reinforcement for in situ concrete

Reinforcement mesh..."
[COHERE] Using enhanced description: "E41 Worked finishes/Cutting to in situ concrete

Worked fi..."
[COHERE] Using enhanced description: "E41 Worked finishes/Cutting to in situ concrete

Worked fi..."
[COHERE] Using enhanced description: "Page Total 23000/1/1: generally..."
[COHERE] Using enhanced description: "Plain In-situ concrete Grade C20, 20 maximum aggregate; as S..."
[COHERE] Using enhanced description: "Plain In-situ concrete Grade C20, 20 maximum aggregate; as S..."
[COHERE] Using enhanced description: "Page Total 23000/1/2: Branches 100 x 100 x 100..."
[COHERE] Using enhanced description: "Page Total 23000/1/2: Rocker pipes; 600 long..."
[COHERE] Using enhanced description: "Page Total 23000/1/2: Rocker pipes; 1200 long..."
[COHERE] Using enhanced description: "Page Total 23000/1/2: nominal size; in trenches..."
[COHERE] Using enhanced description: "Page Total 23000/1/2: Branches 150 x 100 x 150..."
[COHERE] Using enhanced description: "Page Total 23000/1/2: Rocker pipes; 600 long..."
[COHERE] Using enhanced description: "Page Total 23000/1/2: Rocker pipes; 1200 long..."
[COHERE] Using enhanced description: "Page Total 23000/2/1: generally..."
[COHERE] Using enhanced description: "Plain In-situ concrete Grade C20, 20 maximum aggregate; as S..."
[COHERE] Using enhanced description: "Plain In-situ concrete Grade C20, 20 maximum aggregate; as S..."
[COHERE] Using enhanced description: "Plain In-situ concrete Grade C20, 20 maximum aggregate; as S..."
[COHERE] Using enhanced description: "Plain In-situ concrete Grade C20, 20 maximum aggregate; as S..."
[COHERE] Using enhanced description: "Plain In-situ concrete Grade C20, 20 maximum aggregate; as S..."
[COHERE] Using enhanced description: "Plain In-situ concrete Grade C20, 20 maximum aggregate; as S..."
📂 [COHERE] Category from header: excavation (E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 22000/3/2)
📂 [COHERE] Item 385: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E40 Designed joints in situ concrete

Joints; movement and similar joints; as Engineers Spec E40 - NO Spec ; Contractors design

Plain > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 22000/3/2)
[COHERE DEBUG] Item 385: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 385, Total confidence: 20230.489712161634
✅ Match (53%): "Not exceeding 250 average thic..."
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 22000/3/2 > Clean stone; 50-75 dia; drainage layer to bottom of tree pits

Filling to make up levels)
📂 [COHERE] Item 386: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 22000/3/2 > Clean stone; 50-75 dia; drainage layer to bottom of tree pits

Filling to make up levels)
[COHERE DEBUG] Item 386: bestMatch = { confidence: 54, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 386, Total confidence: 20284.049236225434
✅ Match (54%): "Over 250 average thick..."
📂 [COHERE] Category from header: excavation (Page Total 22000/3/2 > Clean stone; 50-75 dia; drainage layer to bottom of tree pits

Filling to make up levels > Page Total 22000/5/1)
📂 [COHERE] Item 387: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 22000/3/2 > Clean stone; 50-75 dia; drainage layer to bottom of tree pits

Filling to make up levels > Page Total 22000/5/1)
[COHERE DEBUG] Item 387: bestMatch = { confidence: 51, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 387, Total confidence: 20335.247606582532
✅ Match (51%): "00 m maximum depth..."
📂 [COHERE] Category from header: excavation (Clean stone; 50-75 dia; drainage layer to bottom of tree pits

Filling to make up levels > Page Total 22000/5/1 > Excavating

Trenches; width over 300 wide)
📂 [COHERE] Item 388: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Clean stone; 50-75 dia; drainage layer to bottom of tree pits

Filling to make up levels > Page Total 22000/5/1 > Excavating

Trenches; width over 300 wide)
[COHERE DEBUG] Item 388: bestMatch = { confidence: 64, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 388, Total confidence: 20399.46938162088
✅ Match (64%): "00 m maximum depth..."
📂 [COHERE] Category from header: excavation (Page Total 22000/5/1 > Excavating

Trenches; width over 300 wide > Extra over excavation irrespective of depth for excavating)
📂 [COHERE] Item 389: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 22000/5/1 > Excavating

Trenches; width over 300 wide > Extra over excavation irrespective of depth for excavating)
[COHERE DEBUG] Item 389: bestMatch = { confidence: 62, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 389, Total confidence: 20461.087721863492
✅ Match (62%): "Below ground water level - RIS..."
📂 [COHERE] Category from header: excavation (Page Total 22000/5/1 > Excavating

Trenches; width over 300 wide > Extra over excavation irrespective of depth for excavating)
📂 [COHERE] Item 390: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 22000/5/1 > Excavating

Trenches; width over 300 wide > Extra over excavation irrespective of depth for excavating)
[COHERE DEBUG] Item 390: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 390, Total confidence: 20514.25274480001
✅ Match (53%): "Toxic/hazardous material; as N..."
📂 [COHERE] Category from header: excavation (Page Total 22000/5/1 > Excavating

Trenches; width over 300 wide > Extra over excavation irrespective of depth for excavating)
📂 [COHERE] Item 391: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 22000/5/1 > Excavating

Trenches; width over 300 wide > Extra over excavation irrespective of depth for excavating)
[COHERE DEBUG] Item 391: bestMatch = { confidence: 58, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 391, Total confidence: 20572.24043731496
✅ Match (58%): "00 m maximum depth; distance b..."
📂 [COHERE] Category from header: excavation (Page Total 22000/5/1 > Excavating

Trenches; width over 300 wide > Extra over excavation irrespective of depth for excavating)
📂 [COHERE] Item 392: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 22000/5/1 > Excavating

Trenches; width over 300 wide > Extra over excavation irrespective of depth for excavating)
[COHERE DEBUG] Item 392: bestMatch = { confidence: 57, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 392, Total confidence: 20629.080749287066
✅ Match (57%): "00 m maximum depth; distance b..."
📂 [COHERE] Category from header: excavation (Page Total 22000/5/1 > Excavating

Trenches; width over 300 wide > Extra over excavation irrespective of depth for excavating)
📂 [COHERE] Item 393: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 22000/5/1 > Excavating

Trenches; width over 300 wide > Extra over excavation irrespective of depth for excavating)
[COHERE DEBUG] Item 393: bestMatch = { confidence: 62, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 393, Total confidence: 20690.884045091076
✅ Match (62%): "Ground water..."
📂 [COHERE] Category from header: excavation (Page Total 22000/5/1 > Excavating

Trenches; width over 300 wide > Extra over excavation irrespective of depth for excavating)
📂 [COHERE] Item 394: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 22000/5/1 > Excavating

Trenches; width over 300 wide > Extra over excavation irrespective of depth for excavating)
[COHERE DEBUG] Item 394: bestMatch = { confidence: 61, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 394, Total confidence: 20751.45070507707
✅ Match (61%): "Surface water..."
📂 [COHERE] Category from header: excavation (Page Total 22000/5/1 > Excavating

Trenches; width over 300 wide > Extra over excavation irrespective of depth for excavating)
📂 [COHERE] Item 395: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 22000/5/1 > Excavating

Trenches; width over 300 wide > Extra over excavation irrespective of depth for excavating)
[COHERE DEBUG] Item 395: bestMatch = { confidence: 59, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 395, Total confidence: 20810.511638360258
✅ Match (59%): "Off site..."
📂 [COHERE] Category from header: excavation (Page Total 22000/5/1 > Excavating

Trenches; width over 300 wide > Extra over excavation irrespective of depth for excavating)
📂 [COHERE] Item 396: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 22000/5/1 > Excavating

Trenches; width over 300 wide > Extra over excavation irrespective of depth for excavating)
[COHERE DEBUG] Item 396: bestMatch = { confidence: 58, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 396, Total confidence: 20868.462271844302
✅ Match (58%): "Off site; toxic/hazardous mate..."
📂 [COHERE] Category from header: excavation (Excavating

Trenches; width over 300 wide > Extra over excavation irrespective of depth for excavating > Crusher run stone;depositing in layers 150mm maximum thickness

Filling to; excavations)
📂 [COHERE] Item 397: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Excavating

Trenches; width over 300 wide > Extra over excavation irrespective of depth for excavating > Crusher run stone;depositing in layers 150mm maximum thickness

Filling to; excavations)
[COHERE DEBUG] Item 397: bestMatch = { confidence: 56, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 397, Total confidence: 20924.66151250263
✅ Match (56%): "Over 250 thick; (Either side o..."
📂 [COHERE] Category from header: excavation (Excavating

Trenches; width over 300 wide > Extra over excavation irrespective of depth for excavating > Crusher run stone;depositing in layers 150mm maximum thickness

Filling to; excavations)
📂 [COHERE] Item 398: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Excavating

Trenches; width over 300 wide > Extra over excavation irrespective of depth for excavating > Crusher run stone;depositing in layers 150mm maximum thickness

Filling to; excavations)
[COHERE DEBUG] Item 398: bestMatch = { confidence: 54, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 398, Total confidence: 20978.913700065517
✅ Match (54%): "Compacting; bottoms of excavat..."
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating > Crusher run stone;depositing in layers 150mm maximum thickness

Filling to; excavations > Page Total 22000/6/1)
📂 [COHERE] Item 399: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating > Crusher run stone;depositing in layers 150mm maximum thickness

Filling to; excavations > Page Total 22000/6/1)
[COHERE DEBUG] Item 399: bestMatch = { confidence: 50, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 399, Total confidence: 21029.309655346016
✅ Match (50%): "Compacting; surface of filling..."
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating > Crusher run stone;depositing in layers 150mm maximum thickness

Filling to; excavations > Page Total 22000/6/1)
📂 [COHERE] Item 400: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating > Crusher run stone;depositing in layers 150mm maximum thickness

Filling to; excavations > Page Total 22000/6/1)
[COHERE DEBUG] Item 400: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 400, Total confidence: 21082.039262540668
✅ Match (53%): "Not exceeding 150 thick; (Mud ..."
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating > Crusher run stone;depositing in layers 150mm maximum thickness

Filling to; excavations > Page Total 22000/6/1)
📂 [COHERE] Item 401: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Extra over excavation irrespective of depth for excavating > Crusher run stone;depositing in layers 150mm maximum thickness

Filling to; excavations > Page Total 22000/6/1)
[COHERE DEBUG] Item 401: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 401, Total confidence: 21134.553811701724
✅ Match (53%): "Generally..."
📂 [COHERE] Category from header: excavation (Crusher run stone;depositing in layers 150mm maximum thickness

Filling to; excavations > Page Total 22000/6/1 > E30 Reinforcement for in situ concrete

Reinforcement mesh; As Architects Spec E30; as Engineers Notes

Mesh)
📂 [COHERE] Item 402: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Crusher run stone;depositing in layers 150mm maximum thickness

Filling to; excavations > Page Total 22000/6/1 > E30 Reinforcement for in situ concrete

Reinforcement mesh; As Architects Spec E30; as Engineers Notes

Mesh)
[COHERE DEBUG] Item 402: bestMatch = { confidence: 55, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 402, Total confidence: 21189.62408976071
✅ Match (55%): "A393..."
📂 [COHERE] Category from header: excavation (Page Total 22000/6/1 > E30 Reinforcement for in situ concrete

Reinforcement mesh; As Architects Spec E30; as Engineers Notes

Mesh > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
📂 [COHERE] Item 403: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 22000/6/1 > E30 Reinforcement for in situ concrete

Reinforcement mesh; As Architects Spec E30; as Engineers Notes

Mesh > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
[COHERE DEBUG] Item 403: bestMatch = { confidence: 52, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 403, Total confidence: 21241.76252856633
✅ Match (52%): "Generally; (Mud mat)..."
📂 [COHERE] Category from header: excavation (Page Total 22000/6/1 > E30 Reinforcement for in situ concrete

Reinforcement mesh; As Architects Spec E30; as Engineers Notes

Mesh > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
📂 [COHERE] Item 404: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 22000/6/1 > E30 Reinforcement for in situ concrete

Reinforcement mesh; As Architects Spec E30; as Engineers Notes

Mesh > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec)
[COHERE DEBUG] Item 404: bestMatch = { confidence: 52, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 404, Total confidence: 21293.28049013245
✅ Match (52%): "Generally; (Foundations)..."
📂 [COHERE] Category from header: excavation (E30 Reinforcement for in situ concrete

Reinforcement mesh; As Architects Spec E30; as Engineers Notes

Mesh > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 22000/6/2)
📂 [COHERE] Item 405: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E30 Reinforcement for in situ concrete

Reinforcement mesh; As Architects Spec E30; as Engineers Notes

Mesh > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 22000/6/2)
[COHERE DEBUG] Item 405: bestMatch = { confidence: 55, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 405, Total confidence: 21348.106919969512
✅ Match (55%): "average depth; backfilling wit..."
📂 [COHERE] Category from header: excavation (E30 Reinforcement for in situ concrete

Reinforcement mesh; As Architects Spec E30; as Engineers Notes

Mesh > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 22000/6/2)
📂 [COHERE] Item 406: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E30 Reinforcement for in situ concrete

Reinforcement mesh; As Architects Spec E30; as Engineers Notes

Mesh > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 22000/6/2)
[COHERE DEBUG] Item 406: bestMatch = { confidence: 55, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 406, Total confidence: 21402.933349806575
✅ Match (55%): "average depth; backfilling wit..."
📂 [COHERE] Category from header: excavation (E30 Reinforcement for in situ concrete

Reinforcement mesh; As Architects Spec E30; as Engineers Notes

Mesh > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 22000/6/2)
📂 [COHERE] Item 407: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E30 Reinforcement for in situ concrete

Reinforcement mesh; As Architects Spec E30; as Engineers Notes

Mesh > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 22000/6/2)
[COHERE DEBUG] Item 407: bestMatch = { confidence: 55, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 407, Total confidence: 21457.75977964364
✅ Match (55%): "average depth; backfilling wit..."
📂 [COHERE] Category from header: excavation (E30 Reinforcement for in situ concrete

Reinforcement mesh; As Architects Spec E30; as Engineers Notes

Mesh > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 22000/6/2)
📂 [COHERE] Item 408: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E30 Reinforcement for in situ concrete

Reinforcement mesh; As Architects Spec E30; as Engineers Notes

Mesh > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 22000/6/2)
[COHERE DEBUG] Item 408: bestMatch = { confidence: 59, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 408, Total confidence: 21517.045908993266
✅ Match (59%): "Forming hole in foundation wal..."
📂 [COHERE] Category from header: excavation (E30 Reinforcement for in situ concrete

Reinforcement mesh; As Architects Spec E30; as Engineers Notes

Mesh > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 22000/6/2)
📂 [COHERE] Item 409: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E30 Reinforcement for in situ concrete

Reinforcement mesh; As Architects Spec E30; as Engineers Notes

Mesh > E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 22000/6/2)
[COHERE DEBUG] Item 409: bestMatch = { confidence: 59, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 409, Total confidence: 21576.315494282222
✅ Match (59%): "Forming hole in foundation wal..."
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 22000/6/2 > Excavating trenches within new building

For pipes; not exceeding 200 nominal size)
📂 [COHERE] Item 410: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (E41 Worked finishes/Cutting to in situ concrete

Worked finishes

Manual tamping; NO Architects Spec > Page Total 22000/6/2 > Excavating trenches within new building

For pipes; not exceeding 200 nominal size)
[COHERE DEBUG] Item 410: bestMatch = { confidence: 68, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 410, Total confidence: 21643.830418203044
✅ Match (68%): "average depth; backfilling wit..."
📂 [COHERE] Category from header: plumbing (Page Total 22000/6/2 > Excavating trenches within new building

For pipes; not exceeding 200 nominal size > Excavating trenches

For pipes; not exceeding 200 nominal size)
📂 [COHERE] Item 411: Category = plumbing (confidence: 0.9)
📂 [COHERE] Category from header: plumbing (Page Total 22000/6/2 > Excavating trenches within new building

For pipes; not exceeding 200 nominal size > Excavating trenches

For pipes; not exceeding 200 nominal size)
[COHERE DEBUG] Item 411: bestMatch = { confidence: 71, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 411, Total confidence: 21714.61632805147
✅ Match (71%): "average depth; backfilling wit..."
📂 [COHERE] Category from header: plumbing (Page Total 22000/6/2 > Excavating trenches within new building

For pipes; not exceeding 200 nominal size > Excavating trenches

For pipes; not exceeding 200 nominal size)
📂 [COHERE] Item 412: Category = plumbing (confidence: 0.9)
📂 [COHERE] Category from header: plumbing (Page Total 22000/6/2 > Excavating trenches within new building

For pipes; not exceeding 200 nominal size > Excavating trenches

For pipes; not exceeding 200 nominal size)
[COHERE DEBUG] Item 412: bestMatch = { confidence: 71, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 412, Total confidence: 21785.402237899896
✅ Match (71%): "average depth; backfilling wit..."
📂 [COHERE] Category from header: plumbing (Page Total 22000/6/2 > Excavating trenches within new building

For pipes; not exceeding 200 nominal size > Excavating trenches

For pipes; not exceeding 200 nominal size)
📂 [COHERE] Item 413: Category = plumbing (confidence: 0.9)
📂 [COHERE] Category from header: plumbing (Page Total 22000/6/2 > Excavating trenches within new building

For pipes; not exceeding 200 nominal size > Excavating trenches

For pipes; not exceeding 200 nominal size)
[COHERE DEBUG] Item 413: bestMatch = { confidence: 71, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 413, Total confidence: 21856.188147748322
✅ Match (71%): "average depth; backfilling wit..."
📂 [COHERE] Category from header: plumbing (Page Total 22000/6/2 > Excavating trenches within new building

For pipes; not exceeding 200 nominal size > Excavating trenches

For pipes; not exceeding 200 nominal size)
📂 [COHERE] Item 414: Category = plumbing (confidence: 0.9)
📂 [COHERE] Category from header: plumbing (Page Total 22000/6/2 > Excavating trenches within new building

For pipes; not exceeding 200 nominal size > Excavating trenches

For pipes; not exceeding 200 nominal size)
[COHERE DEBUG] Item 414: bestMatch = { confidence: 60, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 414, Total confidence: 21916.62637779494
✅ Match (60%): "Toxic/hazardous material; (PRI..."
📂 [COHERE] Category from header: plumbing (Excavating trenches within new building

For pipes; not exceeding 200 nominal size > Excavating trenches

For pipes; not exceeding 200 nominal size > Page Total 23000/1/1)
📂 [COHERE] Item 415: Category = plumbing (confidence: 0.9)
📂 [COHERE] Category from header: plumbing (Excavating trenches within new building

For pipes; not exceeding 200 nominal size > Excavating trenches

For pipes; not exceeding 200 nominal size > Page Total 23000/1/1)
[COHERE DEBUG] Item 415: bestMatch = { confidence: 58, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 415, Total confidence: 21974.91667452139
✅ Match (58%): "Below ground water level; (PRI..."
📂 [COHERE] Category from header: plumbing (Excavating trenches within new building

For pipes; not exceeding 200 nominal size > Excavating trenches

For pipes; not exceeding 200 nominal size > Page Total 23000/1/1)
📂 [COHERE] Item 416: Category = plumbing (confidence: 0.9)
📂 [COHERE] Category from header: plumbing (Excavating trenches within new building

For pipes; not exceeding 200 nominal size > Excavating trenches

For pipes; not exceeding 200 nominal size > Page Total 23000/1/1)
[COHERE DEBUG] Item 416: bestMatch = { confidence: 62, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 416, Total confidence: 22036.74962238173
✅ Match (62%): "generally..."
📂 [COHERE] Category from header: plumbing (Excavating trenches within new building

For pipes; not exceeding 200 nominal size > Excavating trenches

For pipes; not exceeding 200 nominal size > Page Total 23000/1/1)
📂 [COHERE] Item 417: Category = plumbing (confidence: 0.9)
📂 [COHERE] Category from header: plumbing (Excavating trenches within new building

For pipes; not exceeding 200 nominal size > Excavating trenches

For pipes; not exceeding 200 nominal size > Page Total 23000/1/1)
[COHERE DEBUG] Item 417: bestMatch = { confidence: 63, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 417, Total confidence: 22099.408643363993
✅ Match (63%): "x 500 thick; for pipe 150 nomi..."
📂 [COHERE] Category from header: concrete (Excavating trenches

For pipes; not exceeding 200 nominal size > Page Total 23000/1/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds)
📂 [COHERE] Item 418: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Excavating trenches

For pipes; not exceeding 200 nominal size > Page Total 23000/1/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds)
[COHERE DEBUG] Item 418: bestMatch = { confidence: 59, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 418, Total confidence: 22158.63334149763
✅ Match (59%): "x 400 thick; for pipe 100 nomi..."
📂 [COHERE] Category from header: concrete (Excavating trenches

For pipes; not exceeding 200 nominal size > Page Total 23000/1/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds)
📂 [COHERE] Item 419: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Excavating trenches

For pipes; not exceeding 200 nominal size > Page Total 23000/1/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds)
[COHERE DEBUG] Item 419: bestMatch = { confidence: 59, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 419, Total confidence: 22217.858039631265
✅ Match (59%): "x 400 thick; for pipe 100 nomi..."
📂 [COHERE] Category from header: concrete (Excavating trenches

For pipes; not exceeding 200 nominal size > Page Total 23000/1/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds)
📂 [COHERE] Item 420: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Excavating trenches

For pipes; not exceeding 200 nominal size > Page Total 23000/1/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds)
[COHERE DEBUG] Item 420: bestMatch = { confidence: 59, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 420, Total confidence: 22277.261643018483
✅ Match (59%): "x 400 thick; for pipe 150 nomi..."
📂 [COHERE] Category from header: concrete (Excavating trenches

For pipes; not exceeding 200 nominal size > Page Total 23000/1/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds)
📂 [COHERE] Item 421: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Excavating trenches

For pipes; not exceeding 200 nominal size > Page Total 23000/1/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds)
[COHERE DEBUG] Item 421: bestMatch = { confidence: 62, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 421, Total confidence: 22339.22550217978
✅ Match (62%): "x 450 thick; for pipe 100 nomi..."
📂 [COHERE] Category from header: concrete (Excavating trenches

For pipes; not exceeding 200 nominal size > Page Total 23000/1/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds)
📂 [COHERE] Item 422: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Excavating trenches

For pipes; not exceeding 200 nominal size > Page Total 23000/1/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds)
[COHERE DEBUG] Item 422: bestMatch = { confidence: 58, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 422, Total confidence: 22397.18286626209
✅ Match (58%): "nominal size; vertical; in tre..."
📂 [COHERE] Category from header: concrete (Excavating trenches

For pipes; not exceeding 200 nominal size > Page Total 23000/1/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds)
📂 [COHERE] Item 423: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Excavating trenches

For pipes; not exceeding 200 nominal size > Page Total 23000/1/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds)
[COHERE DEBUG] Item 423: bestMatch = { confidence: 56, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 423, Total confidence: 22452.80700634854
✅ Match (56%): "nominal size; in trenches..."
📂 [COHERE] Category from header: concrete (Excavating trenches

For pipes; not exceeding 200 nominal size > Page Total 23000/1/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds)
📂 [COHERE] Item 424: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Excavating trenches

For pipes; not exceeding 200 nominal size > Page Total 23000/1/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds)
[COHERE DEBUG] Item 424: bestMatch = { confidence: 54, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 424, Total confidence: 22506.76733249887
✅ Match (54%): "Slab penetration detail over p..."
📂 [COHERE] Category from header: concrete (Excavating trenches

For pipes; not exceeding 200 nominal size > Page Total 23000/1/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds)
📂 [COHERE] Item 425: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Excavating trenches

For pipes; not exceeding 200 nominal size > Page Total 23000/1/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds)
[COHERE DEBUG] Item 425: bestMatch = { confidence: 54, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 425, Total confidence: 22560.954819734503
✅ Match (54%): "Puddle flanges..."
📂 [COHERE] Category from header: concrete (Page Total 23000/1/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds > Page Total 23000/1/2)
📂 [COHERE] Item 426: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 23000/1/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds > Page Total 23000/1/2)
[COHERE DEBUG] Item 426: bestMatch = { confidence: 48, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 426, Total confidence: 22608.620205007002
⚠️  Low confidence (48%): "Adaptor to above ground draina..."
📂 [COHERE] Category from header: concrete (Page Total 23000/1/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds > Page Total 23000/1/2)
📂 [COHERE] Item 427: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 23000/1/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds > Page Total 23000/1/2)
[COHERE DEBUG] Item 427: bestMatch = { confidence: 56, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 427, Total confidence: 22664.501213890762
✅ Match (56%): "Sleeve through pile caps and g..."
📂 [COHERE] Category from header: concrete (Page Total 23000/1/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds > Page Total 23000/1/2)
📂 [COHERE] Item 428: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 23000/1/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds > Page Total 23000/1/2)
[COHERE DEBUG] Item 428: bestMatch = { confidence: 52, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 428, Total confidence: 22716.77182476381
✅ Match (52%): "Branches 100 x 100 x 100..."
📂 [COHERE] Category from header: concrete (Page Total 23000/1/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds > Page Total 23000/1/2)
📂 [COHERE] Item 429: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 23000/1/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds > Page Total 23000/1/2)
[COHERE DEBUG] Item 429: bestMatch = { confidence: 50, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 429, Total confidence: 22766.419062255216
⚠️  Low confidence (50%): "Rocker pipes; 600 long..."
📂 [COHERE] Category from header: concrete (Page Total 23000/1/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds > Page Total 23000/1/2)
📂 [COHERE] Item 430: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 23000/1/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds > Page Total 23000/1/2)
[COHERE DEBUG] Item 430: bestMatch = { confidence: 48, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 430, Total confidence: 22814.36848004772
⚠️  Low confidence (48%): "Adaptor to above ground draina..."
📂 [COHERE] Category from header: concrete (Page Total 23000/1/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds > Page Total 23000/1/2)
📂 [COHERE] Item 431: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 23000/1/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds > Page Total 23000/1/2)
[COHERE DEBUG] Item 431: bestMatch = { confidence: 46, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 431, Total confidence: 22860.19794774614
⚠️  Low confidence (46%): "Adaptor to above ground draina..."
📂 [COHERE] Category from header: concrete (Page Total 23000/1/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds > Page Total 23000/1/2)
📂 [COHERE] Item 432: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 23000/1/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds > Page Total 23000/1/2)
[COHERE DEBUG] Item 432: bestMatch = { confidence: 50, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 432, Total confidence: 22910.070603249045
⚠️  Low confidence (50%): "Allowance for additional fitti..."
📂 [COHERE] Category from header: concrete (Page Total 23000/1/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds > Page Total 23000/1/2)
📂 [COHERE] Item 433: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 23000/1/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds > Page Total 23000/1/2)
[COHERE DEBUG] Item 433: bestMatch = { confidence: 49, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 433, Total confidence: 22958.785103605333
⚠️  Low confidence (49%): "Rocker pipes; 1200 long..."
📂 [COHERE] Category from header: concrete (Page Total 23000/1/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds > Page Total 23000/1/2)
📂 [COHERE] Item 434: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 23000/1/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds > Page Total 23000/1/2)
[COHERE DEBUG] Item 434: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 434, Total confidence: 23011.64310283224
✅ Match (53%): "nominal size; in trenches..."
📂 [COHERE] Category from header: concrete (Page Total 23000/1/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds > Page Total 23000/1/2)
📂 [COHERE] Item 435: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 23000/1/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds > Page Total 23000/1/2)
[COHERE DEBUG] Item 435: bestMatch = { confidence: 56, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 435, Total confidence: 23067.524111716
✅ Match (56%): "Sleeve through pile caps and g..."
📂 [COHERE] Category from header: concrete (Page Total 23000/1/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds > Page Total 23000/1/2)
📂 [COHERE] Item 436: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 23000/1/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds > Page Total 23000/1/2)
[COHERE DEBUG] Item 436: bestMatch = { confidence: 56, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 436, Total confidence: 23123.26068100128
✅ Match (56%): "Branches 150 x 100 x 150..."
📂 [COHERE] Category from header: concrete (Page Total 23000/1/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds > Page Total 23000/1/2)
📂 [COHERE] Item 437: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 23000/1/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds > Page Total 23000/1/2)
[COHERE DEBUG] Item 437: bestMatch = { confidence: 50, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 437, Total confidence: 23172.907918492685
⚠️  Low confidence (50%): "Rocker pipes; 600 long..."
📂 [COHERE] Category from header: concrete (Page Total 23000/1/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds > Page Total 23000/1/2)
📂 [COHERE] Item 438: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 23000/1/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds > Page Total 23000/1/2)
[COHERE DEBUG] Item 438: bestMatch = { confidence: 50, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 438, Total confidence: 23222.78057399559
⚠️  Low confidence (50%): "Allowance for additional fitti..."
📂 [COHERE] Category from header: concrete (Page Total 23000/1/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds > Page Total 23000/1/2)
📂 [COHERE] Item 439: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 23000/1/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds > Page Total 23000/1/2)
[COHERE DEBUG] Item 439: bestMatch = { confidence: 49, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 439, Total confidence: 23271.49507435188
⚠️  Low confidence (49%): "Rocker pipes; 1200 long..."
📂 [COHERE] Category from header: concrete (Page Total 23000/1/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds > Page Total 23000/1/2)
📂 [COHERE] Item 440: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 23000/1/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds > Page Total 23000/1/2)
[COHERE DEBUG] Item 440: bestMatch = { confidence: 51, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 440, Total confidence: 23322.015723281616
✅ Match (51%): "Internal gully; 100 nominal si..."
📂 [COHERE] Category from header: concrete (Page Total 23000/1/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds > Page Total 23000/1/2)
📂 [COHERE] Item 441: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 23000/1/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds > Page Total 23000/1/2)
[COHERE DEBUG] Item 441: bestMatch = { confidence: 50, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 441, Total confidence: 23371.98816818772
⚠️  Low confidence (50%): "Internal shower gully; 100 nom..."
📂 [COHERE] Category from header: concrete (Page Total 23000/1/2 > Page Total 23000/1/3 > MANHOLES

DISPOSAL SYSTEMS

R12 Manholes

Precast concrete manholes

Manholes)
📂 [COHERE] Item 442: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 23000/1/2 > Page Total 23000/1/3 > MANHOLES

DISPOSAL SYSTEMS

R12 Manholes

Precast concrete manholes

Manholes)
[COHERE DEBUG] Item 442: bestMatch = { confidence: 59, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 442, Total confidence: 23431.04688500815
✅ Match (59%): "Internal; 450 x 600 precase co..."
📂 [COHERE] Category from header: concrete (Page Total 23000/1/2 > Page Total 23000/1/3 > MANHOLES

DISPOSAL SYSTEMS

R12 Manholes

Precast concrete manholes

Manholes)
📂 [COHERE] Item 443: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 23000/1/2 > Page Total 23000/1/3 > MANHOLES

DISPOSAL SYSTEMS

R12 Manholes

Precast concrete manholes

Manholes)
[COHERE DEBUG] Item 443: bestMatch = { confidence: 59, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 443, Total confidence: 23489.983981850324
✅ Match (59%): "Internal; 450 x 600 precase co..."
📂 [COHERE] Category from header: concrete (Page Total 23000/1/2 > Page Total 23000/1/3 > MANHOLES

DISPOSAL SYSTEMS

R12 Manholes

Precast concrete manholes

Manholes)
📂 [COHERE] Item 444: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 23000/1/2 > Page Total 23000/1/3 > MANHOLES

DISPOSAL SYSTEMS

R12 Manholes

Precast concrete manholes

Manholes)
[COHERE DEBUG] Item 444: bestMatch = { confidence: 59, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 444, Total confidence: 23549.042698670753
✅ Match (59%): "Internal; 450 x 600 precase co..."
📂 [COHERE] Category from header: concrete (Page Total 23000/1/2 > Page Total 23000/1/3 > MANHOLES

DISPOSAL SYSTEMS

R12 Manholes

Precast concrete manholes

Manholes)
📂 [COHERE] Item 445: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 23000/1/2 > Page Total 23000/1/3 > MANHOLES

DISPOSAL SYSTEMS

R12 Manholes

Precast concrete manholes

Manholes)
[COHERE DEBUG] Item 445: bestMatch = { confidence: 59, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 445, Total confidence: 23608.18198125276
✅ Match (59%): "Internal; 450 x 600 precase co..."
📂 [COHERE] Category from header: concrete (Page Total 23000/1/3 > MANHOLES

DISPOSAL SYSTEMS

R12 Manholes

Precast concrete manholes

Manholes > Page Total 23000/1/4)
📂 [COHERE] Item 446: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 23000/1/3 > MANHOLES

DISPOSAL SYSTEMS

R12 Manholes

Precast concrete manholes

Manholes > Page Total 23000/1/4)
[COHERE DEBUG] Item 446: bestMatch = { confidence: 61, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 446, Total confidence: 23668.93631108488
✅ Match (61%): "External; 1200 dia precase con..."
📂 [COHERE] Category from header: concrete (Page Total 23000/1/3 > MANHOLES

DISPOSAL SYSTEMS

R12 Manholes

Precast concrete manholes

Manholes > Page Total 23000/1/4)
📂 [COHERE] Item 447: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 23000/1/3 > MANHOLES

DISPOSAL SYSTEMS

R12 Manholes

Precast concrete manholes

Manholes > Page Total 23000/1/4)
[COHERE DEBUG] Item 447: bestMatch = { confidence: 58, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 447, Total confidence: 23727.07807678377
✅ Match (58%): "External; 450 dia; 1.00 to 1.5..."
📂 [COHERE] Category from header: concrete (Page Total 23000/1/3 > MANHOLES

DISPOSAL SYSTEMS

R12 Manholes

Precast concrete manholes

Manholes > Page Total 23000/1/4)
📂 [COHERE] Item 448: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 23000/1/3 > MANHOLES

DISPOSAL SYSTEMS

R12 Manholes

Precast concrete manholes

Manholes > Page Total 23000/1/4)
[COHERE DEBUG] Item 448: bestMatch = { confidence: 58, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 448, Total confidence: 23785.523305034763
✅ Match (58%): "External; 450 dia; 1.00 to 1.5..."
📂 [COHERE] Category from header: concrete (Page Total 23000/1/3 > MANHOLES

DISPOSAL SYSTEMS

R12 Manholes

Precast concrete manholes

Manholes > Page Total 23000/1/4)
📂 [COHERE] Item 449: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 23000/1/3 > MANHOLES

DISPOSAL SYSTEMS

R12 Manholes

Precast concrete manholes

Manholes > Page Total 23000/1/4)
[COHERE DEBUG] Item 449: bestMatch = { confidence: 56, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 449, Total confidence: 23841.54880625858
✅ Match (56%): "Locating existing live manhole..."
📂 [COHERE] Category from header: concrete (MANHOLES

DISPOSAL SYSTEMS

R12 Manholes

Precast concrete manholes

Manholes > Page Total 23000/1/4 > Page Total 23000/1/5)
📂 [COHERE] Item 450: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (MANHOLES

DISPOSAL SYSTEMS

R12 Manholes

Precast concrete manholes

Manholes > Page Total 23000/1/4 > Page Total 23000/1/5)
[COHERE DEBUG] Item 450: bestMatch = { confidence: 51, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 450, Total confidence: 23892.392151619726
✅ Match (51%): "CCTV Drainage Survey of comple..."
📂 [COHERE] Category from header: concrete (MANHOLES

DISPOSAL SYSTEMS

R12 Manholes

Precast concrete manholes

Manholes > Page Total 23000/1/4 > Page Total 23000/1/5)
📂 [COHERE] Item 451: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (MANHOLES

DISPOSAL SYSTEMS

R12 Manholes

Precast concrete manholes

Manholes > Page Total 23000/1/4 > Page Total 23000/1/5)
[COHERE DEBUG] Item 451: bestMatch = { confidence: 55, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 451, Total confidence: 23947.21335569381
✅ Match (55%): "To include for general testing..."
📂 [COHERE] Category from description: excavation (score: 0.5428571428571428)
📂 [COHERE] Item 452: Category = excavation (confidence: 0.5428571428571428)
📂 [COHERE] Category from description: excavation (score: 0.5428571428571428)
[COHERE DEBUG] Item 452: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 452, Total confidence: 24000.208717705173
✅ Match (53%): "average depth; backfilling wit..."
📂 [COHERE] Category from description: excavation (score: 0.5428571428571428)
📂 [COHERE] Item 453: Category = excavation (confidence: 0.5428571428571428)
📂 [COHERE] Category from description: excavation (score: 0.5428571428571428)
[COHERE DEBUG] Item 453: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 453, Total confidence: 24053.204079716535
✅ Match (53%): "average depth; backfilling wit..."
📂 [COHERE] Category from description: excavation (score: 0.5428571428571428)
📂 [COHERE] Item 454: Category = excavation (confidence: 0.5428571428571428)
📂 [COHERE] Category from description: excavation (score: 0.5428571428571428)
[COHERE DEBUG] Item 454: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 454, Total confidence: 24106.1994417279
✅ Match (53%): "average depth; backfilling wit..."
📂 [COHERE] Category from description: excavation (score: 0.5428571428571428)
📂 [COHERE] Item 455: Category = excavation (confidence: 0.5428571428571428)
📂 [COHERE] Category from description: excavation (score: 0.5428571428571428)
[COHERE DEBUG] Item 455: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 455, Total confidence: 24159.19480373926
✅ Match (53%): "average depth; backfilling wit..."
📂 [COHERE] Category from description: excavation (score: 0.5428571428571428)
📂 [COHERE] Item 456: Category = excavation (confidence: 0.5428571428571428)
📂 [COHERE] Category from description: excavation (score: 0.5428571428571428)
[COHERE DEBUG] Item 456: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 456, Total confidence: 24212.190165750624
✅ Match (53%): "average depth; backfilling wit..."
📂 [COHERE] Category from description: excavation (score: 0.5428571428571428)
📂 [COHERE] Item 457: Category = excavation (confidence: 0.5428571428571428)
📂 [COHERE] Category from description: excavation (score: 0.5428571428571428)
[COHERE DEBUG] Item 457: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 457, Total confidence: 24265.185527761987
✅ Match (53%): "average depth; backfilling wit..."
📂 [COHERE] Category from description: excavation (score: 0.5428571428571428)
📂 [COHERE] Item 458: Category = excavation (confidence: 0.5428571428571428)
📂 [COHERE] Category from description: excavation (score: 0.5428571428571428)
[COHERE DEBUG] Item 458: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 458, Total confidence: 24318.18088977335
✅ Match (53%): "average depth; backfilling wit..."
📂 [COHERE] Category from description: excavation (score: 0.5428571428571428)
📂 [COHERE] Item 459: Category = excavation (confidence: 0.5428571428571428)
📂 [COHERE] Category from description: excavation (score: 0.5428571428571428)
[COHERE DEBUG] Item 459: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 459, Total confidence: 24371.176251784713
✅ Match (53%): "average depth; backfilling wit..."
📂 [COHERE] Category from description: excavation (score: 0.5428571428571428)
📂 [COHERE] Item 460: Category = excavation (confidence: 0.5428571428571428)
📂 [COHERE] Category from description: excavation (score: 0.5428571428571428)
[COHERE DEBUG] Item 460: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 460, Total confidence: 24424.171613796076
✅ Match (53%): "average depth; backfilling wit..."
📂 [COHERE] Category from description: excavation (score: 0.5428571428571428)
📂 [COHERE] Item 461: Category = excavation (confidence: 0.5428571428571428)
📂 [COHERE] Category from description: excavation (score: 0.5428571428571428)
[COHERE DEBUG] Item 461: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 461, Total confidence: 24477.16697580744
✅ Match (53%): "average depth; backfilling wit..."
📂 [COHERE] Item 462: Category = none (confidence: 0)
[COHERE DEBUG] Item 462: bestMatch = { confidence: 42, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 462, Total confidence: 24518.734344682904
⚠️  Low confidence (42%): "Toxic/hazardous material; (PRI..."
📂 [COHERE] Category from description: excavation (score: 0.5428571428571428)
📂 [COHERE] Item 463: Category = excavation (confidence: 0.5428571428571428)
📂 [COHERE] Category from description: excavation (score: 0.5428571428571428)
[COHERE DEBUG] Item 463: bestMatch = { confidence: 50, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 463, Total confidence: 24568.34665457407
⚠️  Low confidence (50%): "Below ground water level; (PRI..."
📂 [COHERE] Item 464: Category = none (confidence: 0)
[COHERE DEBUG] Item 464: bestMatch = { confidence: 42, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 464, Total confidence: 24610.72835109127
⚠️  Low confidence (42%): "generally..."
📂 [COHERE] Category from description: plumbing (score: 0.55)
📂 [COHERE] Item 465: Category = plumbing (confidence: 0.55)
📂 [COHERE] Category from description: plumbing (score: 0.55)
[COHERE DEBUG] Item 465: bestMatch = { confidence: 51, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 465, Total confidence: 24662.02895096072
✅ Match (51%): "x 500 thick; for pipe 150 nomi..."
📂 [COHERE] Category from description: plumbing (score: 0.55)
📂 [COHERE] Item 466: Category = plumbing (confidence: 0.55)
📂 [COHERE] Category from description: plumbing (score: 0.55)
[COHERE DEBUG] Item 466: bestMatch = { confidence: 48, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 466, Total confidence: 24709.86576703913
⚠️  Low confidence (48%): "x 500 thick; for pipe 300 nomi..."
📂 [COHERE] Category from header: concrete (Page Total 23000/1/6 > Page Total 23000/2/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds)
📂 [COHERE] Item 467: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 23000/1/6 > Page Total 23000/2/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds)
[COHERE DEBUG] Item 467: bestMatch = { confidence: 54, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 467, Total confidence: 24764.01166653199
✅ Match (54%): "x 400 thick; for pipe 150 nomi..."
📂 [COHERE] Category from header: concrete (Page Total 23000/1/6 > Page Total 23000/2/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds)
📂 [COHERE] Item 468: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 23000/1/6 > Page Total 23000/2/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds)
[COHERE DEBUG] Item 468: bestMatch = { confidence: 52, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 468, Total confidence: 24816.47656654265
✅ Match (52%): "x 500 thick; for pipe 300 nomi..."
📂 [COHERE] Category from header: concrete (Page Total 23000/1/6 > Page Total 23000/2/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds)
📂 [COHERE] Item 469: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 23000/1/6 > Page Total 23000/2/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds)
[COHERE DEBUG] Item 469: bestMatch = { confidence: 57, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 469, Total confidence: 24873.094231660383
✅ Match (57%): "x 450 thick; for pipe 150 nomi..."
📂 [COHERE] Category from header: concrete (Page Total 23000/1/6 > Page Total 23000/2/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds)
📂 [COHERE] Item 470: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 23000/1/6 > Page Total 23000/2/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds)
[COHERE DEBUG] Item 470: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 470, Total confidence: 24925.748595191577
✅ Match (53%): "nominal size; vertical; in tre..."
📂 [COHERE] Category from header: concrete (Page Total 23000/1/6 > Page Total 23000/2/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds)
📂 [COHERE] Item 471: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 23000/1/6 > Page Total 23000/2/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds)
[COHERE DEBUG] Item 471: bestMatch = { confidence: 51, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 471, Total confidence: 24977.06451378973
✅ Match (51%): "Allowance for additional fitti..."
📂 [COHERE] Category from header: concrete (Page Total 23000/1/6 > Page Total 23000/2/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds)
📂 [COHERE] Item 472: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 23000/1/6 > Page Total 23000/2/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds)
[COHERE DEBUG] Item 472: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 472, Total confidence: 25029.78499935647
✅ Match (53%): "nominal size; in trenches..."
📂 [COHERE] Category from header: concrete (Page Total 23000/1/6 > Page Total 23000/2/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds)
📂 [COHERE] Item 473: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 23000/1/6 > Page Total 23000/2/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds)
[COHERE DEBUG] Item 473: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 473, Total confidence: 25083.04426377387
✅ Match (53%): "Short radius bends..."
📂 [COHERE] Category from header: concrete (Page Total 23000/1/6 > Page Total 23000/2/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds)
📂 [COHERE] Item 474: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 23000/1/6 > Page Total 23000/2/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds)
[COHERE DEBUG] Item 474: bestMatch = { confidence: 52, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 474, Total confidence: 25134.926032516512
✅ Match (52%): "Adaptor to RWP's..."
📂 [COHERE] Category from header: concrete (Page Total 23000/1/6 > Page Total 23000/2/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds)
📂 [COHERE] Item 475: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 23000/1/6 > Page Total 23000/2/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds)
[COHERE DEBUG] Item 475: bestMatch = { confidence: 56, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 475, Total confidence: 25191.338925258286
✅ Match (56%): "Branches 150 x 150 x 150..."
📂 [COHERE] Category from header: concrete (Page Total 23000/1/6 > Page Total 23000/2/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds)
📂 [COHERE] Item 476: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 23000/1/6 > Page Total 23000/2/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds)
[COHERE DEBUG] Item 476: bestMatch = { confidence: 49, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 476, Total confidence: 25240.28163362452
⚠️  Low confidence (49%): "Rocker pies; 600 long..."
📂 [COHERE] Category from header: concrete (Page Total 23000/1/6 > Page Total 23000/2/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds)
📂 [COHERE] Item 477: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 23000/1/6 > Page Total 23000/2/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds)
[COHERE DEBUG] Item 477: bestMatch = { confidence: 55, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 477, Total confidence: 25295.037097461336
✅ Match (55%): "Branches 300 x 150 x 300..."
📂 [COHERE] Category from header: concrete (Page Total 23000/1/6 > Page Total 23000/2/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds)
📂 [COHERE] Item 478: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 23000/1/6 > Page Total 23000/2/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds)
[COHERE DEBUG] Item 478: bestMatch = { confidence: 48, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 478, Total confidence: 25343.473410986753
⚠️  Low confidence (48%): "Adaptor to above ground draina..."
📂 [COHERE] Category from header: concrete (Page Total 23000/1/6 > Page Total 23000/2/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds)
📂 [COHERE] Item 479: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 23000/1/6 > Page Total 23000/2/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds)
[COHERE DEBUG] Item 479: bestMatch = { confidence: 51, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 479, Total confidence: 25394.789329584906
✅ Match (51%): "Allowance for additional fitti..."
📂 [COHERE] Category from header: concrete (Page Total 23000/1/6 > Page Total 23000/2/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds)
📂 [COHERE] Item 480: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 23000/1/6 > Page Total 23000/2/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds)
[COHERE DEBUG] Item 480: bestMatch = { confidence: 49, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 480, Total confidence: 25444.149340729426
⚠️  Low confidence (49%): "Adaptor to Polystorm Xtra Modu..."
❌ [COHERE MATCH] Failed to update progress for batch 5/6
   🚀 Processing batch 6/6 (43 items)
[COHERE] Using enhanced description: "Page Total 23000/2/2: nominal size; in trenches..."
[COHERE] Using enhanced description: "Page Total 23000/2/2: Rocker pipes; 600 long..."
[COHERE] Using enhanced description: "Page Total 23000/2/2: end caps..."
[COHERE] Using enhanced description: "Page Total 23000/2/2: combined outlet sump unit..."
[COHERE] Using enhanced description: "Page Total 23000/2/7: 00 m maximum depth..."
[COHERE] Using enhanced description: "Page Total 23000/2/7: Surface water..."
[COHERE] Using enhanced description: "Page Total 23000/2/7: Off site..."
[COHERE] Using enhanced description: "Type 3 gravel; graded so that when compacted is dense withou..."
📂 [COHERE] Category from header: concrete (Page Total 23000/2/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds > Page Total 23000/2/2)
📂 [COHERE] Item 481: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 23000/2/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds > Page Total 23000/2/2)
[COHERE DEBUG] Item 481: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 481, Total confidence: 25497.61084570257
✅ Match (53%): "nominal size; in trenches..."
📂 [COHERE] Category from header: concrete (Page Total 23000/2/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds > Page Total 23000/2/2)
📂 [COHERE] Item 482: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 23000/2/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds > Page Total 23000/2/2)
[COHERE DEBUG] Item 482: bestMatch = { confidence: 48, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 482, Total confidence: 25546.10508597703
⚠️  Low confidence (48%): "Adaptor to Polystorm Xtra Modu..."
📂 [COHERE] Category from header: concrete (Page Total 23000/2/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds > Page Total 23000/2/2)
📂 [COHERE] Item 483: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 23000/2/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds > Page Total 23000/2/2)
[COHERE DEBUG] Item 483: bestMatch = { confidence: 49, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 483, Total confidence: 25595.264790791225
⚠️  Low confidence (49%): "Rocker pipes; 600 long..."
📂 [COHERE] Category from header: concrete (Page Total 23000/2/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds > Page Total 23000/2/2)
📂 [COHERE] Item 484: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 23000/2/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds > Page Total 23000/2/2)
[COHERE DEBUG] Item 484: bestMatch = { confidence: 50, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 484, Total confidence: 25645.48171764115
✅ Match (50%): "Allowance for additional fitti..."
📂 [COHERE] Category from header: concrete (Page Total 23000/2/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds > Page Total 23000/2/2)
📂 [COHERE] Item 485: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 23000/2/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds > Page Total 23000/2/2)
[COHERE DEBUG] Item 485: bestMatch = { confidence: 57, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 485, Total confidence: 25702.21823912206
✅ Match (57%): "External gully; 150 nominal si..."
📂 [COHERE] Category from header: concrete (Page Total 23000/2/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds > Page Total 23000/2/2)
📂 [COHERE] Item 486: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 23000/2/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds > Page Total 23000/2/2)
[COHERE DEBUG] Item 486: bestMatch = { confidence: 51, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 486, Total confidence: 25752.907883817443
✅ Match (51%): "RWP gully; 150 nominal size ou..."
📂 [COHERE] Category from header: concrete (Page Total 23000/2/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds > Page Total 23000/2/2)
📂 [COHERE] Item 487: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 23000/2/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds > Page Total 23000/2/2)
[COHERE DEBUG] Item 487: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 487, Total confidence: 25806.258914219674
✅ Match (53%): "Level channel; with 150mm nomi..."
📂 [COHERE] Category from header: concrete (Page Total 23000/2/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds > Page Total 23000/2/2)
📂 [COHERE] Item 488: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 23000/2/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds > Page Total 23000/2/2)
[COHERE DEBUG] Item 488: bestMatch = { confidence: 52, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 488, Total confidence: 25858.23237895498
✅ Match (52%): "end caps..."
📂 [COHERE] Category from header: concrete (Page Total 23000/2/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds > Page Total 23000/2/2)
📂 [COHERE] Item 489: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 23000/2/1 > Plain In-situ concrete Grade C20, 20 maximum aggregate; as Spec. R12/483

Beds and surrounds > Page Total 23000/2/2)
[COHERE DEBUG] Item 489: bestMatch = { confidence: 50, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 489, Total confidence: 25907.966241640206
⚠️  Low confidence (50%): "combined outlet sump unit..."
📂 [COHERE] Category from header: concrete (Page Total 23000/2/2 > Page Total 23000/2/3 > MANHOLES

DISPOSAL SYSTEMS

R12 Manholes

Precast concrete manholes

Manholes)
📂 [COHERE] Item 490: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 23000/2/2 > Page Total 23000/2/3 > MANHOLES

DISPOSAL SYSTEMS

R12 Manholes

Precast concrete manholes

Manholes)
[COHERE DEBUG] Item 490: bestMatch = { confidence: 60, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 490, Total confidence: 25967.588776770725
✅ Match (60%): "x 600 precase concrete chamber..."
📂 [COHERE] Category from header: concrete (Page Total 23000/2/2 > Page Total 23000/2/3 > MANHOLES

DISPOSAL SYSTEMS

R12 Manholes

Precast concrete manholes

Manholes)
📂 [COHERE] Item 491: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 23000/2/2 > Page Total 23000/2/3 > MANHOLES

DISPOSAL SYSTEMS

R12 Manholes

Precast concrete manholes

Manholes)
[COHERE DEBUG] Item 491: bestMatch = { confidence: 60, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 491, Total confidence: 26027.13376804646
✅ Match (60%): "x 600 precase concrete chamber..."
📂 [COHERE] Category from header: concrete (Page Total 23000/2/2 > Page Total 23000/2/3 > MANHOLES

DISPOSAL SYSTEMS

R12 Manholes

Precast concrete manholes

Manholes)
📂 [COHERE] Item 492: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 23000/2/2 > Page Total 23000/2/3 > MANHOLES

DISPOSAL SYSTEMS

R12 Manholes

Precast concrete manholes

Manholes)
[COHERE DEBUG] Item 492: bestMatch = { confidence: 61, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 492, Total confidence: 26088.55187682655
✅ Match (61%): "x 750 precase concrete chamber..."
📂 [COHERE] Category from header: concrete (Page Total 23000/2/2 > Page Total 23000/2/3 > MANHOLES

DISPOSAL SYSTEMS

R12 Manholes

Precast concrete manholes

Manholes)
📂 [COHERE] Item 493: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 23000/2/2 > Page Total 23000/2/3 > MANHOLES

DISPOSAL SYSTEMS

R12 Manholes

Precast concrete manholes

Manholes)
[COHERE DEBUG] Item 493: bestMatch = { confidence: 62, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 493, Total confidence: 26150.36548035465
✅ Match (62%): "x 750 precase concrete chamber..."
📂 [COHERE] Category from header: concrete (Page Total 23000/2/2 > Page Total 23000/2/3 > MANHOLES

DISPOSAL SYSTEMS

R12 Manholes

Precast concrete manholes

Manholes)
📂 [COHERE] Item 494: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 23000/2/2 > Page Total 23000/2/3 > MANHOLES

DISPOSAL SYSTEMS

R12 Manholes

Precast concrete manholes

Manholes)
[COHERE DEBUG] Item 494: bestMatch = { confidence: 59, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 494, Total confidence: 26209.286871141616
✅ Match (59%): "External; 450 dia; 0.50 to 1.0..."
📂 [COHERE] Category from header: concrete (Page Total 23000/2/3 > MANHOLES

DISPOSAL SYSTEMS

R12 Manholes

Precast concrete manholes

Manholes > Page Total 23000/2/4)
📂 [COHERE] Item 495: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 23000/2/3 > MANHOLES

DISPOSAL SYSTEMS

R12 Manholes

Precast concrete manholes

Manholes > Page Total 23000/2/4)
[COHERE DEBUG] Item 495: bestMatch = { confidence: 59, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 495, Total confidence: 26267.933664182998
✅ Match (59%): "External; 450 dia; 1.00 to 1.5..."
📂 [COHERE] Category from header: concrete (Page Total 23000/2/3 > MANHOLES

DISPOSAL SYSTEMS

R12 Manholes

Precast concrete manholes

Manholes > Page Total 23000/2/4)
📂 [COHERE] Item 496: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 23000/2/3 > MANHOLES

DISPOSAL SYSTEMS

R12 Manholes

Precast concrete manholes

Manholes > Page Total 23000/2/4)
[COHERE DEBUG] Item 496: bestMatch = { confidence: 60, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 496, Total confidence: 26327.60470315432
✅ Match (60%): "External; 450 dia; 1.50 to 2.0..."
📂 [COHERE] Category from header: concrete (Page Total 23000/2/3 > MANHOLES

DISPOSAL SYSTEMS

R12 Manholes

Precast concrete manholes

Manholes > Page Total 23000/2/4)
📂 [COHERE] Item 497: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 23000/2/3 > MANHOLES

DISPOSAL SYSTEMS

R12 Manholes

Precast concrete manholes

Manholes > Page Total 23000/2/4)
[COHERE DEBUG] Item 497: bestMatch = { confidence: 60, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 497, Total confidence: 26387.115102139476
✅ Match (60%): "External; 600 dia; 0.50 to 1.0..."
📂 [COHERE] Category from header: concrete (Page Total 23000/2/3 > MANHOLES

DISPOSAL SYSTEMS

R12 Manholes

Precast concrete manholes

Manholes > Page Total 23000/2/4)
📂 [COHERE] Item 498: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 23000/2/3 > MANHOLES

DISPOSAL SYSTEMS

R12 Manholes

Precast concrete manholes

Manholes > Page Total 23000/2/4)
[COHERE DEBUG] Item 498: bestMatch = { confidence: 59, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 498, Total confidence: 26445.643211359235
✅ Match (59%): "External; 600 dia; 0.50 to 1.0..."
📂 [COHERE] Category from header: concrete (Page Total 23000/2/3 > MANHOLES

DISPOSAL SYSTEMS

R12 Manholes

Precast concrete manholes

Manholes > Page Total 23000/2/4)
📂 [COHERE] Item 499: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 23000/2/3 > MANHOLES

DISPOSAL SYSTEMS

R12 Manholes

Precast concrete manholes

Manholes > Page Total 23000/2/4)
[COHERE DEBUG] Item 499: bestMatch = { confidence: 59, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 499, Total confidence: 26504.506982462386
✅ Match (59%): "External; 600 dia; 1.50 to 2.0..."
📂 [COHERE] Category from header: concrete (Page Total 23000/2/3 > MANHOLES

DISPOSAL SYSTEMS

R12 Manholes

Precast concrete manholes

Manholes > Page Total 23000/2/4)
📂 [COHERE] Item 500: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (Page Total 23000/2/3 > MANHOLES

DISPOSAL SYSTEMS

R12 Manholes

Precast concrete manholes

Manholes > Page Total 23000/2/4)
[COHERE DEBUG] Item 500: bestMatch = { confidence: 58, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 500, Total confidence: 26562.243247279283
✅ Match (58%): "Locating existing live sewer; ..."
📂 [COHERE] Category from header: concrete (MANHOLES

DISPOSAL SYSTEMS

R12 Manholes

Precast concrete manholes

Manholes > Page Total 23000/2/4 > Page Total 23000/2/5)
📂 [COHERE] Item 501: Category = concrete (confidence: 0.9)
📂 [COHERE] Category from header: concrete (MANHOLES

DISPOSAL SYSTEMS

R12 Manholes

Precast concrete manholes

Manholes > Page Total 23000/2/4 > Page Total 23000/2/5)
[COHERE DEBUG] Item 501: bestMatch = { confidence: 59, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 501, Total confidence: 26621.34496436567
✅ Match (59%): "Locating existing live manhole..."
📂 [COHERE] Category from description: plumbing (score: 0.55)
📂 [COHERE] Item 502: Category = plumbing (confidence: 0.55)
📂 [COHERE] Category from description: plumbing (score: 0.55)
[COHERE DEBUG] Item 502: bestMatch = { confidence: 43, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 502, Total confidence: 26664.359733241534
⚠️  Low confidence (43%): "CCTV Drainage Survey of comple..."
📂 [COHERE] Category from description: plumbing (score: 0.55)
📂 [COHERE] Item 503: Category = plumbing (confidence: 0.55)
📂 [COHERE] Category from description: plumbing (score: 0.55)
[COHERE DEBUG] Item 503: bestMatch = { confidence: 48, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 503, Total confidence: 26712.05099896949
⚠️  Low confidence (48%): "To include for general testing..."
📂 [COHERE] Item 504: Category = none (confidence: 0)
[COHERE DEBUG] Item 504: bestMatch = { confidence: 43, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 504, Total confidence: 26755.295937334722
⚠️  Low confidence (43%): "00 m maximum depth..."
📂 [COHERE] Item 505: Category = none (confidence: 0)
[COHERE DEBUG] Item 505: bestMatch = { confidence: 44, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 505, Total confidence: 26799.050365997697
⚠️  Low confidence (44%): "00 m maximum depth; distance b..."
📂 [COHERE] Category from description: excavation (score: 0.5428571428571428)
📂 [COHERE] Item 506: Category = excavation (confidence: 0.5428571428571428)
📂 [COHERE] Category from description: excavation (score: 0.5428571428571428)
[COHERE DEBUG] Item 506: bestMatch = { confidence: 49, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 506, Total confidence: 26847.926456989902
⚠️  Low confidence (49%): "Ground water; Contractors Risk..."
📂 [COHERE] Category from description: plumbing (score: 0.55)
📂 [COHERE] Item 507: Category = plumbing (confidence: 0.55)
📂 [COHERE] Category from description: plumbing (score: 0.55)
[COHERE DEBUG] Item 507: bestMatch = { confidence: 41, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 507, Total confidence: 26888.6050079374
⚠️  Low confidence (41%): "Surface water..."
📂 [COHERE] Item 508: Category = none (confidence: 0)
[COHERE DEBUG] Item 508: bestMatch = { confidence: 43, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 508, Total confidence: 26931.633057158535
⚠️  Low confidence (43%): "Off site..."
📂 [COHERE] Item 509: Category = none (confidence: 0)
[COHERE DEBUG] Item 509: bestMatch = { confidence: 45, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 509, Total confidence: 26976.492329834397
⚠️  Low confidence (45%): "Not exceeding 250 average thic..."
📂 [COHERE] Category from header: excavation (Page Total 23000/2/6 > Page Total 23000/2/7 > Type 3 gravel; graded so that when compacted is dense without voids

Filling to make up levels)
📂 [COHERE] Item 510: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 23000/2/6 > Page Total 23000/2/7 > Type 3 gravel; graded so that when compacted is dense without voids

Filling to make up levels)
[COHERE DEBUG] Item 510: bestMatch = { confidence: 49, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 510, Total confidence: 27025.371331798393
⚠️  Low confidence (49%): "Over 250 average thick; compac..."
📂 [COHERE] Category from header: excavation (Page Total 23000/2/6 > Page Total 23000/2/7 > Type 3 gravel; graded so that when compacted is dense without voids

Filling to make up levels)
📂 [COHERE] Item 511: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 23000/2/6 > Page Total 23000/2/7 > Type 3 gravel; graded so that when compacted is dense without voids

Filling to make up levels)
[COHERE DEBUG] Item 511: bestMatch = { confidence: 55, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 511, Total confidence: 27080.035594583853
✅ Match (55%): "Bottom of excavation; with vit..."
📂 [COHERE] Category from header: excavation (Page Total 23000/2/6 > Page Total 23000/2/7 > Type 3 gravel; graded so that when compacted is dense without voids

Filling to make up levels)
📂 [COHERE] Item 512: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 23000/2/6 > Page Total 23000/2/7 > Type 3 gravel; graded so that when compacted is dense without voids

Filling to make up levels)
[COHERE DEBUG] Item 512: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 512, Total confidence: 27132.80287769408
✅ Match (53%): "filling; with vitrated plate..."
📂 [COHERE] Category from header: excavation (Page Total 23000/2/6 > Page Total 23000/2/7 > Type 3 gravel; graded so that when compacted is dense without voids

Filling to make up levels)
📂 [COHERE] Item 513: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 23000/2/6 > Page Total 23000/2/7 > Type 3 gravel; graded so that when compacted is dense without voids

Filling to make up levels)
[COHERE DEBUG] Item 513: bestMatch = { confidence: 53, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 513, Total confidence: 27185.790247177138
✅ Match (53%): "Generally; laying vertically a..."
📂 [COHERE] Category from header: excavation (Page Total 23000/2/7 > Type 3 gravel; graded so that when compacted is dense without voids

Filling to make up levels > Page Total 23000/3/1)
📂 [COHERE] Item 514: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 23000/2/7 > Type 3 gravel; graded so that when compacted is dense without voids

Filling to make up levels > Page Total 23000/3/1)
[COHERE DEBUG] Item 514: bestMatch = { confidence: 56, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 514, Total confidence: 27241.624958199707
✅ Match (56%): "Extra over for sealing around ..."
📂 [COHERE] Category from header: excavation (Page Total 23000/2/7 > Type 3 gravel; graded so that when compacted is dense without voids

Filling to make up levels > Page Total 23000/3/1)
📂 [COHERE] Item 515: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 23000/2/7 > Type 3 gravel; graded so that when compacted is dense without voids

Filling to make up levels > Page Total 23000/3/1)
[COHERE DEBUG] Item 515: bestMatch = { confidence: 59, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 515, Total confidence: 27300.27185804209
✅ Match (59%): "Extra over for sealing around ..."
📂 [COHERE] Category from header: excavation (Page Total 23000/2/7 > Type 3 gravel; graded so that when compacted is dense without voids

Filling to make up levels > Page Total 23000/3/1)
📂 [COHERE] Item 516: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 23000/2/7 > Type 3 gravel; graded so that when compacted is dense without voids

Filling to make up levels > Page Total 23000/3/1)
[COHERE DEBUG] Item 516: bestMatch = { confidence: 50, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 516, Total confidence: 27349.849487753858
⚠️  Low confidence (50%): "Attenuation; Total void volume..."
📂 [COHERE] Category from header: excavation (Page Total 23000/2/7 > Type 3 gravel; graded so that when compacted is dense without voids

Filling to make up levels > Page Total 23000/3/1)
📂 [COHERE] Item 517: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 23000/2/7 > Type 3 gravel; graded so that when compacted is dense without voids

Filling to make up levels > Page Total 23000/3/1)
[COHERE DEBUG] Item 517: bestMatch = { confidence: 54, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 517, Total confidence: 27404.062025189498
✅ Match (54%): "Extra over for flange adaptor ..."
📂 [COHERE] Category from header: excavation (Page Total 23000/2/7 > Type 3 gravel; graded so that when compacted is dense without voids

Filling to make up levels > Page Total 23000/3/1)
📂 [COHERE] Item 518: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 23000/2/7 > Type 3 gravel; graded so that when compacted is dense without voids

Filling to make up levels > Page Total 23000/3/1)
[COHERE DEBUG] Item 518: bestMatch = { confidence: 56, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 518, Total confidence: 27460.19414954304
✅ Match (56%): "Extra over for flange adaptor ..."
📂 [COHERE] Category from header: excavation (Page Total 23000/2/7 > Type 3 gravel; graded so that when compacted is dense without voids

Filling to make up levels > Page Total 23000/3/1)
📂 [COHERE] Item 519: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Page Total 23000/2/7 > Type 3 gravel; graded so that when compacted is dense without voids

Filling to make up levels > Page Total 23000/3/1)
[COHERE DEBUG] Item 519: bestMatch = { confidence: 55, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 519, Total confidence: 27515.45602211083
✅ Match (55%): "Extra over for vent pipe; incl..."
📂 [COHERE] Category from header: excavation (Type 3 gravel; graded so that when compacted is dense without voids

Filling to make up levels > Page Total 23000/3/1 > Page Total 23000/3/2)
📂 [COHERE] Item 520: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Type 3 gravel; graded so that when compacted is dense without voids

Filling to make up levels > Page Total 23000/3/1 > Page Total 23000/3/2)
[COHERE DEBUG] Item 520: bestMatch = { confidence: 49, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 520, Total confidence: 27564.5890203506
⚠️  Low confidence (49%): "Removal of redundant pipework,..."
📂 [COHERE] Category from header: excavation (Type 3 gravel; graded so that when compacted is dense without voids

Filling to make up levels > Page Total 23000/3/1 > Page Total 23000/3/2)
📂 [COHERE] Item 521: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Type 3 gravel; graded so that when compacted is dense without voids

Filling to make up levels > Page Total 23000/3/1 > Page Total 23000/3/2)
[COHERE DEBUG] Item 521: bestMatch = { confidence: 42, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 521, Total confidence: 27606.63282248073
⚠️  Low confidence (42%): "Remove and replace existing ac..."
📂 [COHERE] Category from header: excavation (Type 3 gravel; graded so that when compacted is dense without voids

Filling to make up levels > Page Total 23000/3/1 > Page Total 23000/3/2)
📂 [COHERE] Item 522: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Type 3 gravel; graded so that when compacted is dense without voids

Filling to make up levels > Page Total 23000/3/1 > Page Total 23000/3/2)
[COHERE DEBUG] Item 522: bestMatch = { confidence: 50, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 522, Total confidence: 27656.572694726197
⚠️  Low confidence (50%): "To include for general repairs..."
📂 [COHERE] Category from header: excavation (Type 3 gravel; graded so that when compacted is dense without voids

Filling to make up levels > Page Total 23000/3/1 > Page Total 23000/3/2)
📂 [COHERE] Item 523: Category = excavation (confidence: 0.9)
📂 [COHERE] Category from header: excavation (Type 3 gravel; graded so that when compacted is dense without voids

Filling to make up levels > Page Total 23000/3/1 > Page Total 23000/3/2)
[COHERE DEBUG] Item 523: bestMatch = { confidence: 47, hasItem: true }
[COHERE DEBUG] MATCHED! Count now: 523, Total confidence: 27703.21615041354
⚠️  Low confidence (47%): "CCTV Drainage Survey and Repor..."
❌ [COHERE MATCH] Failed to update progress for batch 6/6
[COHERE DEBUG] FINAL SUMMARY:
[COHERE DEBUG] - Total items: 523
[COHERE DEBUG] - Matched count: 523
[COHERE DEBUG] - Total confidence sum: 27703.21615041354
[COHERE DEBUG] - Average confidence: 53%
[COHERE DEBUG] - Matches array length: 523
🚀 Ultra-Fast Cohere Embedding Summary:
   - Items processed: 523
   - Matches found: 523
   - Average confidence: 53%
   - Success rate: 100%
   - Total time: 19.1s (27.4 items/sec)
✅ Found original file at: C:\Users\abaza\OneDrive\Desktop\MJDv8\server\temp\job-b89982fc-38d6-4df9-8ea3-597bf408631b-Input - Copy.xlsx
📄 Using ExcelExportService with original format preservation
📄 Creating export with original format for: job-b89982fc-38d6-4df9-8ea3-597bf408631b-Input - Copy.xlsx
📊 Processing 523 match results
📋 Processing sheet: PAGES
   🎯 Found 523 matches for sheet PAGES
   📊 Created match lookup with 523 entries
   📊 Row numbers in matches: 13, 19, 21, 27, 29...
   📍 Found quantity column at index 4 in row 8
   📍 Found rate column at index 6 in row 8
   📍 Quantity column: 4, Rate column: 6, Max column: 8
   📍 Adding new columns starting at column 5
   📊 Setting rate for row 13: 46.32
   📊 Setting rate for row 19: 116.33
   📊 Setting rate for row 21: 516.25
   📊 Setting rate for row 27: 74930
   📊 Setting rate for row 29: 12.09
   📊 Setting rate for row 35: 19.22
   📊 Setting rate for row 48: 15.3
   📊 Setting rate for row 50: 81.49
   📊 Setting rate for row 56: 24.03
   📊 Setting rate for row 58: 516.25
   📊 Setting rate for row 64: 16.16
   📊 Setting rate for row 70: 16.16
   📊 Setting rate for row 76: 16.16
   📊 Setting rate for row 78: 16.16
   📊 Setting rate for row 84: 75.2
   📊 Setting rate for row 90: 8.33
   📊 Setting rate for row 103: 14.42
   📊 Setting rate for row 116: 75.2
   📊 Setting rate for row 129: 19.22
   📊 Setting rate for row 135: 116.33
   📊 Setting rate for row 137: 160
   📊 Setting rate for row 143: 77.5
   📊 Setting rate for row 145: 12.09
   📊 Setting rate for row 151: 15.3
   📊 Setting rate for row 164: 81.49
   📊 Setting rate for row 170: 24.03
   📊 Setting rate for row 176: 16.16
   📊 Setting rate for row 182: 16.16
   📊 Setting rate for row 184: 16.16
   📊 Setting rate for row 190: 75.2
   📊 Setting rate for row 196: 16.16
   📊 Setting rate for row 198: 14.42
   📊 Setting rate for row 211: 20.2
   📊 Setting rate for row 213: 20.2
   📊 Setting rate for row 215: 20.2
   📊 Setting rate for row 217: 20.2
   📊 Setting rate for row 219: 20.2
   📊 Setting rate for row 221: 20.2
   📊 Setting rate for row 227: 20.2
   📊 Setting rate for row 240: 75.2
   📊 Setting rate for row 242: 31.06
   📊 Setting rate for row 244: 75.2
   📊 Setting rate for row 246: 31.06
   📊 Setting rate for row 248: 75.2
   📊 Setting rate for row 250: 31.06
   📊 Setting rate for row 252: 31.06
   📊 Setting rate for row 254: 75.2
   📊 Setting rate for row 256: 31.06
   📊 Setting rate for row 258: 20.2
   📊 Setting rate for row 260: 20.2
   📊 Setting rate for row 262: 31.06
   📊 Setting rate for row 275: 1770
   📊 Setting rate for row 281: 300.3
   📊 Setting rate for row 283: 516.25
   📊 Setting rate for row 289: 19.1
   📊 Setting rate for row 291: 41.05
   📊 Setting rate for row 293: 19.1
   📊 Setting rate for row 295: 84.17
   📊 Setting rate for row 301: 19.1
   📊 Setting rate for row 303: 19.1
   📊 Setting rate for row 305: 281.92
   📊 Setting rate for row 307: 281.92
   📊 Setting rate for row 309: 19.1
   📊 Setting rate for row 322: 19.1
   📊 Setting rate for row 324: 84.17
   📊 Setting rate for row 330: 101.16
   📊 Setting rate for row 332: 101.16
   📊 Setting rate for row 338: 36.38
   📊 Setting rate for row 340: 19.1
   📊 Setting rate for row 342: 368.75
   📊 Setting rate for row 348: 5.26
   📊 Setting rate for row 354: 244.66
   📊 Setting rate for row 356: 20.2
   📊 Setting rate for row 362: 19.1
   📊 Setting rate for row 375: 7.5
   📊 Setting rate for row 377: 7.5
   📊 Setting rate for row 379: 3.8
   📊 Setting rate for row 381: 7.5
   📊 Setting rate for row 383: 7.5
   📊 Setting rate for row 385: 7.5
   📊 Setting rate for row 387: 20.2
   📊 Setting rate for row 400: 306.96
   📊 Setting rate for row 402: 596.62
   📊 Setting rate for row 404: 2.98
   📊 Setting rate for row 406: 306.96
   📊 Setting rate for row 408: 36.77
   📊 Setting rate for row 414: 3.15
   📊 Setting rate for row 420: 5823.54
   📊 Setting rate for row 422: 5823.54
   📊 Setting rate for row 428: 306.96
   📊 Setting rate for row 430: 183
   📊 Setting rate for row 443: 422.95
   📊 Setting rate for row 445: 183
   📊 Setting rate for row 451: 20.81
   📊 Setting rate for row 457: 306.96
   📊 Setting rate for row 459: 172.01
   📊 Setting rate for row 461: 337.71
   📊 Setting rate for row 467: 198.22
   📊 Setting rate for row 469: 198.22
   📊 Setting rate for row 471: 198.22
   📊 Setting rate for row 473: 306.96
   📊 Setting rate for row 479: 1383.75
   📊 Setting rate for row 481: 20.81
   📊 Setting rate for row 494: 20.81
   📊 Setting rate for row 496: 20.81
   📊 Setting rate for row 498: 115.7
   📊 Setting rate for row 500: 56.83
   📊 Setting rate for row 506: 888.1
   📊 Setting rate for row 508: 888.1
   📊 Setting rate for row 514: 18.12
   📊 Setting rate for row 516: 25.08
   📊 Setting rate for row 518: 25.08
   📊 Setting rate for row 520: 20.9
   📊 Setting rate for row 522: 18.12
   📊 Setting rate for row 524: 18.12
   📊 Setting rate for row 526: 20.9
   📊 Setting rate for row 532: 18.12
   📊 Setting rate for row 545: 19.75
   📊 Setting rate for row 547: 18.12
   📊 Setting rate for row 549: 18.12
   📊 Setting rate for row 551: 18.12
   📊 Setting rate for row 553: 18.12
   📊 Setting rate for row 555: 18.12
   📊 Setting rate for row 557: 18.12
   📊 Setting rate for row 559: 18.12
   📊 Setting rate for row 565: 198.22
   📊 Setting rate for row 567: 428.91
   📊 Setting rate for row 569: 60.7
   📊 Setting rate for row 575: 521.69
   📊 Setting rate for row 581: 18.12
   📊 Setting rate for row 583: 18.12
   📊 Setting rate for row 585: 18.12
   📊 Setting rate for row 587: 18.12
   📊 Setting rate for row 600: 1722.47
   📊 Setting rate for row 602: 888.1
   📊 Setting rate for row 604: 189.32
   📊 Setting rate for row 606: 198.22
   📊 Setting rate for row 608: 3634.33
   📊 Setting rate for row 610: 3634.33
   📊 Setting rate for row 612: 39.15
   📊 Setting rate for row 614: 24.38
   📊 Setting rate for row 620: 316.02
   📊 Setting rate for row 622: 316.02
   📊 Setting rate for row 628: 307.64
   📊 Setting rate for row 641: 24.38
   📊 Setting rate for row 643: 24.38
   📊 Setting rate for row 645: 18.72
   📊 Setting rate for row 647: 24.38
   📊 Setting rate for row 649: 24.38
   📊 Setting rate for row 651: 48
   📊 Setting rate for row 653: 307.64
   📊 Setting rate for row 655: 24.38
   📊 Setting rate for row 657: 24.38
   📊 Setting rate for row 659: 48
   📊 Setting rate for row 661: 48
   📊 Setting rate for row 663: 24.38
   📊 Setting rate for row 665: 24.38
   📊 Setting rate for row 667: 48
   📊 Setting rate for row 669: 48
   📊 Setting rate for row 671: 24.38
   📊 Setting rate for row 673: 24.38
   📊 Setting rate for row 679: 14.16
   📊 Setting rate for row 681: 171.79
   📊 Setting rate for row 694: 7
   📊 Setting rate for row 696: 7
   📊 Setting rate for row 698: 7
   📊 Setting rate for row 704: 58.98
   📊 Setting rate for row 706: 11.2
   📊 Setting rate for row 708: 208.43
   📊 Setting rate for row 714: 74.29
   📊 Setting rate for row 716: 7
   📊 Setting rate for row 718: 1.6
   📊 Setting rate for row 720: 261.44
   📊 Setting rate for row 722: 1180
   📊 Setting rate for row 728: 58.98
   📊 Setting rate for row 730: 24.97
   📊 Setting rate for row 743: 26.61
   📊 Setting rate for row 745: 26.61
   📊 Setting rate for row 747: 26.61
   📊 Setting rate for row 753: 25.08
   📊 Setting rate for row 755: 25.08
   📊 Setting rate for row 757: 25.08
   📊 Setting rate for row 763: 7
   📊 Setting rate for row 765: 7
   📊 Setting rate for row 767: 7
   📊 Setting rate for row 780: 37.04
   📊 Setting rate for row 782: 67.17
   📊 Setting rate for row 784: 25.08
   📊 Setting rate for row 790: 44.92
   📊 Setting rate for row 792: 25.08
   📊 Setting rate for row 794: 7
   📊 Setting rate for row 796: 7
   📊 Setting rate for row 798: 25.08
   📊 Setting rate for row 800: 7
   📊 Setting rate for row 802: 25.08
   📊 Setting rate for row 804: 37.04
   📊 Setting rate for row 806: 20.9
   📊 Setting rate for row 808: 25.08
   📊 Setting rate for row 821: 171.79
   📊 Setting rate for row 823: 7
   📊 Setting rate for row 825: 7
   📊 Setting rate for row 831: 10.81
   📊 Setting rate for row 833: 7
   📊 Setting rate for row 835: 7
   📊 Setting rate for row 837: 7
   📊 Setting rate for row 839: 7
   📊 Setting rate for row 852: 88.37
   📊 Setting rate for row 854: 39.79
   📊 Setting rate for row 856: 1489.21
   📊 Setting rate for row 858: 11.2
   📊 Setting rate for row 864: 39.79
   📊 Setting rate for row 877: 291.09
   📊 Setting rate for row 879: 54.73
   📊 Setting rate for row 881: 54.73
   📊 Setting rate for row 883: 11.2
   📊 Setting rate for row 889: 20.07
   📊 Setting rate for row 895: 15.3
   📊 Setting rate for row 897: 516.25
   📊 Setting rate for row 903: 19.1
   📊 Setting rate for row 905: 15.6
   📊 Setting rate for row 907: 4.73
   📊 Setting rate for row 909: 300.3
   📊 Setting rate for row 922: 19.1
   📊 Setting rate for row 924: 404.02
   📊 Setting rate for row 926: 11.2
   📊 Setting rate for row 928: 11.2
   📊 Setting rate for row 930: 281.92
   📊 Setting rate for row 932: 132.11
   📊 Setting rate for row 934: 11.2
   📊 Setting rate for row 940: 281.92
   📊 Setting rate for row 942: 281.92
   📊 Setting rate for row 948: 94.97
   📊 Setting rate for row 950: 21.28
   📊 Setting rate for row 952: 368.75
   📊 Setting rate for row 965: 12.09
   📊 Setting rate for row 967: 195.06
   📊 Setting rate for row 973: 12.09
   📊 Setting rate for row 975: 46.32
   📊 Setting rate for row 981: 7.5
   📊 Setting rate for row 983: 10.2
   📊 Setting rate for row 985: 19.1
   📊 Setting rate for row 987: 7.5
   📊 Setting rate for row 989: 7.5
   📊 Setting rate for row 991: 3.39
   📊 Setting rate for row 1004: 16.16
   📊 Setting rate for row 1010: 48.42
   📊 Setting rate for row 1012: 4162.76
   📊 Setting rate for row 1018: 50.86
   📊 Setting rate for row 1024: 45.6
   📊 Setting rate for row 1030: 45.6
   📊 Setting rate for row 1036: 90.99
   📊 Setting rate for row 1042: 11.2
   📊 Setting rate for row 1055: 11.2
   📊 Setting rate for row 1061: 11.2
   📊 Setting rate for row 1067: 11.2
   📊 Setting rate for row 1073: 11.2
   📊 Setting rate for row 1075: 11.2
   📊 Setting rate for row 1081: 11.2
   📊 Setting rate for row 1087: 11.2
   📊 Setting rate for row 1093: 405.24
   📊 Setting rate for row 1099: 199.5
   📊 Setting rate for row 1112: 730.77
   📊 Setting rate for row 1118: 1722.47
   📊 Setting rate for row 1120: 48
   📊 Setting rate for row 1126: 5.58
   📊 Setting rate for row 1139: 99.48
   📊 Setting rate for row 1141: 596.62
   📊 Setting rate for row 1143: 306.96
   📊 Setting rate for row 1145: 14.33
   📊 Setting rate for row 1147: 19.29
   📊 Setting rate for row 1153: 240.07
   📊 Setting rate for row 1159: 240.07
   📊 Setting rate for row 1165: 183
   📊 Setting rate for row 1167: 185.17
   📊 Setting rate for row 1169: 77.5
   📊 Setting rate for row 1182: 262.58
   📊 Setting rate for row 1184: 171.79
   📊 Setting rate for row 1190: 198.22
   📊 Setting rate for row 1192: 198.22
   📊 Setting rate for row 1194: 198.22
   📊 Setting rate for row 1196: 198.22
   📊 Setting rate for row 1202: 18.12
   📊 Setting rate for row 1204: 18.12
   📊 Setting rate for row 1210: 20.9
   📊 Setting rate for row 1212: 20.9
   📊 Setting rate for row 1214: 25.08
   📊 Setting rate for row 1227: 25.08
   📊 Setting rate for row 1233: 198.22
   📊 Setting rate for row 1235: 199.5
   📊 Setting rate for row 1237: 18.12
   📊 Setting rate for row 1239: 284.19
   📊 Setting rate for row 1241: 18.72
   📊 Setting rate for row 1247: 275.2
   📊 Setting rate for row 1249: 275.2
   📊 Setting rate for row 1251: 199.5
   📊 Setting rate for row 1253: 275.2
   📊 Setting rate for row 1255: 18.12
   📊 Setting rate for row 1261: 18.12
   📊 Setting rate for row 1274: 1722.47
   📊 Setting rate for row 1276: 189.32
   📊 Setting rate for row 1278: 1722.47
   📊 Setting rate for row 1280: 198.22
   📊 Setting rate for row 1286: 316.02
   📊 Setting rate for row 1288: 316.02
   📊 Setting rate for row 1294: 77.07
   📊 Setting rate for row 1296: 48
   📊 Setting rate for row 1302: 30.6
   📊 Setting rate for row 1315: 9.44
   📊 Setting rate for row 1317: 1.54
   📊 Setting rate for row 1319: 7.29
   📊 Setting rate for row 1321: 7
   📊 Setting rate for row 1327: 63.59
   📊 Setting rate for row 1329: 58.98
   📊 Setting rate for row 1331: 11.2
   📊 Setting rate for row 1337: 64.4
   📊 Setting rate for row 1339: 115.7
   📊 Setting rate for row 1345: 38.11
   📊 Setting rate for row 1347: 58.98
   📊 Setting rate for row 1353: 1.54
   📊 Setting rate for row 1366: 521.69
   📊 Setting rate for row 1372: 14.1
   📊 Setting rate for row 1374: 36.77
   📊 Setting rate for row 1376: 14.83
   📊 Setting rate for row 1389: 14.16
   📊 Setting rate for row 1391: 54.82
   📊 Setting rate for row 1393: 1.94
   📊 Setting rate for row 1399: 11.2
   📊 Setting rate for row 1401: 7
   📊 Setting rate for row 1403: 14.16
   📊 Setting rate for row 1416: 2645.49
   📊 Setting rate for row 1418: 4.3
   📊 Setting rate for row 1424: 17.37
   📊 Setting rate for row 1426: 4.3
   📊 Setting rate for row 1428: 4.3
   📊 Setting rate for row 1430: 596.62
   📊 Setting rate for row 1432: 43.99
   📊 Setting rate for row 1445: 14160
   📊 Setting rate for row 1458: 1489.21
   📊 Setting rate for row 1464: 2500
   📊 Setting rate for row 1470: 2173.21
   📊 Setting rate for row 1472: 2.28
   📊 Setting rate for row 1478: 19.67
   📊 Setting rate for row 1484: 6.29
   📊 Setting rate for row 1490: 272.98
   📊 Setting rate for row 1496: 104.23
   📊 Setting rate for row 1498: 39.3
   📊 Setting rate for row 1511: 104.23
   📊 Setting rate for row 1513: 116.37
   📊 Setting rate for row 1519: 269.6
   📊 Setting rate for row 1521: 18.08
   📊 Setting rate for row 1527: 269.6
   📊 Setting rate for row 1529: 73.57
   📊 Setting rate for row 1535: 126.18
   📊 Setting rate for row 1548: 405.24
   📊 Setting rate for row 1550: 32.18
   📊 Setting rate for row 1556: 126.18
   📊 Setting rate for row 1558: 52.09
   📊 Setting rate for row 1560: 76.21
   📊 Setting rate for row 1566: 126.18
   📊 Setting rate for row 1572: 126.18
   📊 Setting rate for row 1574: 126.18
   📊 Setting rate for row 1587: 126.18
   📊 Setting rate for row 1593: 5.53
   📊 Setting rate for row 1595: 20.2
   📊 Setting rate for row 1601: 8.33
   📊 Setting rate for row 1607: 8.33
   📊 Setting rate for row 1620: 64.03
   📊 Setting rate for row 1626: 173.73
   📊 Setting rate for row 1632: 87.63
   📊 Setting rate for row 1634: 87.63
   📊 Setting rate for row 1636: 87.63
   📊 Setting rate for row 1642: 173.73
   📊 Setting rate for row 1655: 87.63
   📊 Setting rate for row 1661: 56.22
   📊 Setting rate for row 1667: 87.63
   📊 Setting rate for row 1673: 65.52
   📊 Setting rate for row 1675: 65.52
   📊 Setting rate for row 1681: 39.15
   📊 Setting rate for row 1694: 48
   📊 Setting rate for row 1700: 1.6
   📊 Setting rate for row 1706: 1.6
   📊 Setting rate for row 1712: 26.61
   📊 Setting rate for row 1725: 240.07
   📊 Setting rate for row 1731: 230.6
   📊 Setting rate for row 1737: 200.25
   📊 Setting rate for row 1743: 106.5
   📊 Setting rate for row 1756: 446.39
   📊 Setting rate for row 1762: 431.17
   📊 Setting rate for row 1768: 268.34
   📊 Setting rate for row 1770: 112.63
   📊 Setting rate for row 1776: 460.6
   📊 Setting rate for row 1778: 460.6
   📊 Setting rate for row 1784: 431.17
   📊 Setting rate for row 1786: 431.17
   📊 Setting rate for row 1792: 431.17
   📊 Setting rate for row 1794: 431.17
   📊 Setting rate for row 1800: 252.06
   📊 Setting rate for row 1806: 20.14
   📊 Setting rate for row 1819: 405.24
   📊 Setting rate for row 1825: 19.29
   📊 Setting rate for row 1831: 121.3
   📊 Setting rate for row 1837: 186.26
   📊 Setting rate for row 1843: 30.6
   📊 Setting rate for row 1845: 230.6
   📊 Setting rate for row 1858: 215.2
   📊 Setting rate for row 1860: 215.2
   📊 Setting rate for row 1862: 215.2
   📊 Setting rate for row 1868: 261.44
   📊 Setting rate for row 1870: 261.44
   📊 Setting rate for row 1876: 415.77
   📊 Setting rate for row 1882: 400.89
   📊 Setting rate for row 1884: 400.89
   📊 Setting rate for row 1886: 400.89
   📊 Setting rate for row 1892: 415.77
   📊 Setting rate for row 1905: 7.78
   📊 Setting rate for row 1911: 24.45
   📊 Setting rate for row 1917: 150.28
   📊 Setting rate for row 1923: 311.66
   📊 Setting rate for row 1925: 311.66
   📊 Setting rate for row 1927: 311.66
   📊 Setting rate for row 1933: 322.84
   📊 Setting rate for row 1939: 24.45
   📊 Setting rate for row 1941: 20.41
   📊 Setting rate for row 1947: 895.11
   📊 Setting rate for row 1949: 33.52
   📊 Setting rate for row 1962: 148.62
   📊 Setting rate for row 1964: 968.27
   📊 Setting rate for row 1966: 190.92
   📊 Setting rate for row 1968: 370.13
   📊 Setting rate for row 1970: 23.27
   📊 Setting rate for row 1972: 11099.93
   📊 Setting rate for row 1974: 180.84
   📊 Setting rate for row 1976: 300.3
   📊 Setting rate for row 1978: 190.92
   📊 Setting rate for row 1980: 968.27
   📊 Setting rate for row 1982: 190.92
   📊 Setting rate for row 1984: 370.13
   📊 Setting rate for row 1986: 180.84
   📊 Setting rate for row 1988: 300.3
   📊 Setting rate for row 1994: 58.98
   📊 Setting rate for row 1996: 294.98
   📊 Setting rate for row 2009: 1213.22
   📊 Setting rate for row 2015: 1213.22
   📊 Setting rate for row 2017: 1213.22
   📊 Setting rate for row 2019: 1213.22
   📊 Setting rate for row 2032: 2448.48
   📊 Setting rate for row 2038: 1213.22
   📊 Setting rate for row 2040: 111.32
   📊 Setting rate for row 2046: 277.44
   📊 Setting rate for row 2059: 1455.12
   📊 Setting rate for row 2061: 233.22
   📊 Setting rate for row 2074: 241.48
   📊 Setting rate for row 2076: 241.48
   📊 Setting rate for row 2078: 241.48
   📊 Setting rate for row 2080: 241.48
   📊 Setting rate for row 2082: 241.48
   📊 Setting rate for row 2088: 241.48
   📊 Setting rate for row 2090: 241.48
   📊 Setting rate for row 2092: 241.48
   📊 Setting rate for row 2094: 241.48
   📊 Setting rate for row 2096: 241.48
   📊 Setting rate for row 2102: 271.4
   📊 Setting rate for row 2108: 12362.47
   📊 Setting rate for row 2121: 14160
   📊 Setting rate for row 2127: 75.05
   📊 Setting rate for row 2129: 197.58
   📊 Setting rate for row 2135: 294.98
   📊 Setting rate for row 2137: 51.47
   📊 Setting rate for row 2143: 223.28
   📊 Setting rate for row 2149: 189.32
   📊 Setting rate for row 2155: 126.18
   📊 Setting rate for row 2157: 172.37
   📊 Setting rate for row 2159: 189.32
   📊 Setting rate for row 2161: 282.48
   📊 Setting rate for row 2163: 189.32
   📊 Setting rate for row 2165: 189.32
   📊 Setting rate for row 2167: 370.13
   📊 Setting rate for row 2169: 148.62
   📊 Setting rate for row 2171: 126.18
   📊 Setting rate for row 2173: 2352.47
   📊 Setting rate for row 2186: 190.92
   📊 Setting rate for row 2188: 2352.47
   📊 Setting rate for row 2190: 370.13
   📊 Setting rate for row 2192: 126.18
   📊 Setting rate for row 2198: 208.43
   📊 Setting rate for row 2200: 190.92
   📊 Setting rate for row 2206: 190.92
   📊 Setting rate for row 2212: 190.92
   📊 Setting rate for row 2214: 282.48
   📊 Setting rate for row 2227: 1069.98
   📊 Setting rate for row 2229: 1069.98
   📊 Setting rate for row 2231: 1353.87
   📊 Setting rate for row 2233: 1353.87
   📊 Setting rate for row 2239: 1213.22
   📊 Setting rate for row 2252: 111.32
   📊 Setting rate for row 2254: 111.32
   📊 Setting rate for row 2256: 2112.72
   📊 Setting rate for row 2258: 310.04
   📊 Setting rate for row 2260: 2448.48
   📊 Setting rate for row 2266: 300.3
   📊 Setting rate for row 2279: 103.46
   📊 Setting rate for row 2292: 2124
   📊 Setting rate for row 2294: 0
   📊 Setting rate for row 2307: 6
   📊 Setting rate for row 2313: 489.15
   📊 Setting rate for row 2319: 2173.21
   📊 Setting rate for row 2321: 12362.47
   📊 Setting rate for row 2327: 2.7
   📊 Setting rate for row 2333: 27.36
   📊 Setting rate for row 2339: 3
   📊 Setting rate for row 2345: 7.5
   📊 Setting rate for row 2347: 3
   📊 Setting rate for row 2353: 3
   📊 Setting rate for row 2366: 150.28
   📊 Setting rate for row 2368: 252.06
   📊 Setting rate for row 2374: 57.8
   📊 Setting rate for row 2376: 153.67
   📊 Setting rate for row 2378: 268.34
   📊 Setting rate for row 2380: 180.84
   📊 Setting rate for row 2393: 338.64
   📊 Setting rate for row 2395: 176.45
   📊 Setting rate for row 2397: 1046.37
   📊 Setting rate for row 2399: 268.34
✅ Export completed: C:\Users\abaza\OneDrive\Desktop\MJDv8\server\output\matched-b89982fc-38d6-4df9-8ea3-597bf408631b-job-b89982fc-38d6-4df9-8ea3-597bf408631b-Input - Copy.xlsx
📊 Total items processed: 523
[COHERE DEBUG] Returning result: {
  outputPath: 'C:\\Users\\abaza\\OneDrive\\Desktop\\MJDv8\\server\\output\\matched-b89982fc-38d6-4df9-8ea3-597bf408631b-job-b89982fc-38d6-4df9-8ea3-597bf408631b-Input - Copy.xlsx',
  totalMatched: 523,
  averageConfidence: 53,
  matchesLength: 523
}
📊 Cohere Results: 523/523 matched
📊 OpenAI Results: 0/523 matched
🔄 [DATABASE] ENTERING updateJobStatus for job b89982fc-38d6-4df9-8ea3-597bf408631b: status=processing, progress=85
🔄 [DATABASE] Message: Combining AI results...
🔄 [DATABASE] Current job status before update: {
  status: 'processing',
  progress: 70,
  updated_at: '2025-06-27T23:26:40.619142+00:00'
}
   Stack trace for unexpected progress:     at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async updateJobStatusWithThrottle (file:///C:/Users/abaza/OneDrive/Desktop/MJDv8/server/services/PriceMatchingService.js:889:7)
🔄 [DATABASE] Attempting to update job b89982fc-38d6-4df9-8ea3-597bf408631b with data: {
  "status": "processing",
  "updated_at": "2025-06-27T23:27:06.569Z",
  "progress": 85,
  "error_message": "Combining AI results..."
}
✅ [DATABASE] Successfully updated job b89982fc-38d6-4df9-8ea3-597bf408631b: processing 85% - "Combining AI results..."
📊 Hybrid Matching Summary:
   - Agreement: 0 items (0.0%)
   - Cohere only: 523 items
   - OpenAI only: 0 items
   - Average confidence: 47.7%
✅ Hybrid matching completed: 523/523 matched
📊 Average confidence: 47.7%
📄 Creating export with original format for: job-b89982fc-38d6-4df9-8ea3-597bf408631b-Input - Copy.xlsx
📊 Processing 523 match results
📋 Processing sheet: PAGES
   🎯 Found 523 matches for sheet PAGES
   📊 Created match lookup with 523 entries
   📊 Row numbers in matches: 13, 19, 21, 27, 29...
   📍 Found quantity column at index 4 in row 8
   📍 Found rate column at index 6 in row 8
   📍 Quantity column: 4, Rate column: 6, Max column: 8
   📍 Adding new columns starting at column 5
   📊 Setting rate for row 13: 46.32
   📊 Setting rate for row 19: 116.33
   📊 Setting rate for row 21: 516.25
   📊 Setting rate for row 27: 74930
   📊 Setting rate for row 29: 12.09
   📊 Setting rate for row 35: 19.22
   📊 Setting rate for row 48: 15.3
   📊 Setting rate for row 50: 81.49
   📊 Setting rate for row 56: 24.03
   📊 Setting rate for row 58: 516.25
   📊 Setting rate for row 64: 16.16
   📊 Setting rate for row 70: 16.16
   📊 Setting rate for row 76: 16.16
   📊 Setting rate for row 78: 16.16
   📊 Setting rate for row 84: 75.2
   📊 Setting rate for row 90: 8.33
   📊 Setting rate for row 103: 14.42
   📊 Setting rate for row 116: 75.2
   📊 Setting rate for row 129: 19.22
   📊 Setting rate for row 135: 116.33
   📊 Setting rate for row 137: 160
   📊 Setting rate for row 143: 77.5
   📊 Setting rate for row 145: 12.09
   📊 Setting rate for row 151: 15.3
   📊 Setting rate for row 164: 81.49
   📊 Setting rate for row 170: 24.03
   📊 Setting rate for row 176: 16.16
   📊 Setting rate for row 182: 16.16
   📊 Setting rate for row 184: 16.16
   📊 Setting rate for row 190: 75.2
   📊 Setting rate for row 196: 16.16
   📊 Setting rate for row 198: 14.42
   📊 Setting rate for row 211: 20.2
   📊 Setting rate for row 213: 20.2
   📊 Setting rate for row 215: 20.2
   📊 Setting rate for row 217: 20.2
   📊 Setting rate for row 219: 20.2
   📊 Setting rate for row 221: 20.2
   📊 Setting rate for row 227: 20.2
   📊 Setting rate for row 240: 75.2
   📊 Setting rate for row 242: 31.06
   📊 Setting rate for row 244: 75.2
   📊 Setting rate for row 246: 31.06
   📊 Setting rate for row 248: 75.2
   📊 Setting rate for row 250: 31.06
   📊 Setting rate for row 252: 31.06
   📊 Setting rate for row 254: 75.2
   📊 Setting rate for row 256: 31.06
   📊 Setting rate for row 258: 20.2
   📊 Setting rate for row 260: 20.2
   📊 Setting rate for row 262: 31.06
   📊 Setting rate for row 275: 1770
   📊 Setting rate for row 281: 300.3
   📊 Setting rate for row 283: 516.25
   📊 Setting rate for row 289: 19.1
   📊 Setting rate for row 291: 41.05
   📊 Setting rate for row 293: 19.1
   📊 Setting rate for row 295: 84.17
   📊 Setting rate for row 301: 19.1
   📊 Setting rate for row 303: 19.1
   📊 Setting rate for row 305: 281.92
   📊 Setting rate for row 307: 281.92
   📊 Setting rate for row 309: 19.1
   📊 Setting rate for row 322: 19.1
   📊 Setting rate for row 324: 84.17
   📊 Setting rate for row 330: 101.16
   📊 Setting rate for row 332: 101.16
   📊 Setting rate for row 338: 36.38
   📊 Setting rate for row 340: 19.1
   📊 Setting rate for row 342: 368.75
   📊 Setting rate for row 348: 5.26
   📊 Setting rate for row 354: 244.66
   📊 Setting rate for row 356: 20.2
   📊 Setting rate for row 362: 19.1
   📊 Setting rate for row 375: 7.5
   📊 Setting rate for row 377: 7.5
   📊 Setting rate for row 379: 3.8
   📊 Setting rate for row 381: 7.5
   📊 Setting rate for row 383: 7.5
   📊 Setting rate for row 385: 7.5
   📊 Setting rate for row 387: 20.2
   📊 Setting rate for row 400: 306.96
   📊 Setting rate for row 402: 596.62
   📊 Setting rate for row 404: 2.98
   📊 Setting rate for row 406: 306.96
   📊 Setting rate for row 408: 36.77
   📊 Setting rate for row 414: 3.15
   📊 Setting rate for row 420: 5823.54
   📊 Setting rate for row 422: 5823.54
   📊 Setting rate for row 428: 306.96
   📊 Setting rate for row 430: 183
   📊 Setting rate for row 443: 422.95
   📊 Setting rate for row 445: 183
   📊 Setting rate for row 451: 20.81
   📊 Setting rate for row 457: 306.96
   📊 Setting rate for row 459: 172.01
   📊 Setting rate for row 461: 337.71
   📊 Setting rate for row 467: 198.22
   📊 Setting rate for row 469: 198.22
   📊 Setting rate for row 471: 198.22
   📊 Setting rate for row 473: 306.96
   📊 Setting rate for row 479: 1383.75
   📊 Setting rate for row 481: 20.81
   📊 Setting rate for row 494: 20.81
   📊 Setting rate for row 496: 20.81
   📊 Setting rate for row 498: 115.7
   📊 Setting rate for row 500: 56.83
   📊 Setting rate for row 506: 888.1
   📊 Setting rate for row 508: 888.1
   📊 Setting rate for row 514: 18.12
   📊 Setting rate for row 516: 25.08
   📊 Setting rate for row 518: 25.08
   📊 Setting rate for row 520: 20.9
   📊 Setting rate for row 522: 18.12
   📊 Setting rate for row 524: 18.12
   📊 Setting rate for row 526: 20.9
   📊 Setting rate for row 532: 18.12
   📊 Setting rate for row 545: 19.75
   📊 Setting rate for row 547: 18.12
   📊 Setting rate for row 549: 18.12
   📊 Setting rate for row 551: 18.12
   📊 Setting rate for row 553: 18.12
   📊 Setting rate for row 555: 18.12
   📊 Setting rate for row 557: 18.12
   📊 Setting rate for row 559: 18.12
   📊 Setting rate for row 565: 198.22
   📊 Setting rate for row 567: 428.91
   📊 Setting rate for row 569: 60.7
   📊 Setting rate for row 575: 521.69
   📊 Setting rate for row 581: 18.12
   📊 Setting rate for row 583: 18.12
   📊 Setting rate for row 585: 18.12
   📊 Setting rate for row 587: 18.12
   📊 Setting rate for row 600: 1722.47
   📊 Setting rate for row 602: 888.1
   📊 Setting rate for row 604: 189.32
   📊 Setting rate for row 606: 198.22
   📊 Setting rate for row 608: 3634.33
   📊 Setting rate for row 610: 3634.33
   📊 Setting rate for row 612: 39.15
   📊 Setting rate for row 614: 24.38
   📊 Setting rate for row 620: 316.02
   📊 Setting rate for row 622: 316.02
   📊 Setting rate for row 628: 307.64
   📊 Setting rate for row 641: 24.38
   📊 Setting rate for row 643: 24.38
   📊 Setting rate for row 645: 18.72
   📊 Setting rate for row 647: 24.38
   📊 Setting rate for row 649: 24.38
   📊 Setting rate for row 651: 48
   📊 Setting rate for row 653: 307.64
   📊 Setting rate for row 655: 24.38
   📊 Setting rate for row 657: 24.38
   📊 Setting rate for row 659: 48
   📊 Setting rate for row 661: 48
   📊 Setting rate for row 663: 24.38
   📊 Setting rate for row 665: 24.38
   📊 Setting rate for row 667: 48
   📊 Setting rate for row 669: 48
   📊 Setting rate for row 671: 24.38
   📊 Setting rate for row 673: 24.38
   📊 Setting rate for row 679: 14.16
   📊 Setting rate for row 681: 171.79
   📊 Setting rate for row 694: 7
   📊 Setting rate for row 696: 7
   📊 Setting rate for row 698: 7
   📊 Setting rate for row 704: 58.98
   📊 Setting rate for row 706: 11.2
   📊 Setting rate for row 708: 208.43
   📊 Setting rate for row 714: 74.29
   📊 Setting rate for row 716: 7
   📊 Setting rate for row 718: 1.6
   📊 Setting rate for row 720: 261.44
   📊 Setting rate for row 722: 1180
   📊 Setting rate for row 728: 58.98
   📊 Setting rate for row 730: 24.97
   📊 Setting rate for row 743: 26.61
   📊 Setting rate for row 745: 26.61
   📊 Setting rate for row 747: 26.61
   📊 Setting rate for row 753: 25.08
   📊 Setting rate for row 755: 25.08
   📊 Setting rate for row 757: 25.08
   📊 Setting rate for row 763: 7
   📊 Setting rate for row 765: 7
   📊 Setting rate for row 767: 7
   📊 Setting rate for row 780: 37.04
   📊 Setting rate for row 782: 67.17
   📊 Setting rate for row 784: 25.08
   📊 Setting rate for row 790: 44.92
   📊 Setting rate for row 792: 25.08
   📊 Setting rate for row 794: 7
   📊 Setting rate for row 796: 7
   📊 Setting rate for row 798: 25.08
   📊 Setting rate for row 800: 7
   📊 Setting rate for row 802: 25.08
   📊 Setting rate for row 804: 37.04
   📊 Setting rate for row 806: 20.9
   📊 Setting rate for row 808: 25.08
   📊 Setting rate for row 821: 171.79
   📊 Setting rate for row 823: 7
   📊 Setting rate for row 825: 7
   📊 Setting rate for row 831: 10.81
   📊 Setting rate for row 833: 7
   📊 Setting rate for row 835: 7
   📊 Setting rate for row 837: 7
   📊 Setting rate for row 839: 7
   📊 Setting rate for row 852: 88.37
   📊 Setting rate for row 854: 39.79
   📊 Setting rate for row 856: 1489.21
   📊 Setting rate for row 858: 11.2
   📊 Setting rate for row 864: 39.79
   📊 Setting rate for row 877: 291.09
   📊 Setting rate for row 879: 54.73
   📊 Setting rate for row 881: 54.73
   📊 Setting rate for row 883: 11.2
   📊 Setting rate for row 889: 20.07
   📊 Setting rate for row 895: 15.3
   📊 Setting rate for row 897: 516.25
   📊 Setting rate for row 903: 19.1
   📊 Setting rate for row 905: 15.6
   📊 Setting rate for row 907: 4.73
   📊 Setting rate for row 909: 300.3
   📊 Setting rate for row 922: 19.1
   📊 Setting rate for row 924: 404.02
   📊 Setting rate for row 926: 11.2
   📊 Setting rate for row 928: 11.2
   📊 Setting rate for row 930: 281.92
   📊 Setting rate for row 932: 132.11
   📊 Setting rate for row 934: 11.2
   📊 Setting rate for row 940: 281.92
   📊 Setting rate for row 942: 281.92
   📊 Setting rate for row 948: 94.97
   📊 Setting rate for row 950: 21.28
   📊 Setting rate for row 952: 368.75
   📊 Setting rate for row 965: 12.09
   📊 Setting rate for row 967: 195.06
   📊 Setting rate for row 973: 12.09
   📊 Setting rate for row 975: 46.32
   📊 Setting rate for row 981: 7.5
   📊 Setting rate for row 983: 10.2
   📊 Setting rate for row 985: 19.1
   📊 Setting rate for row 987: 7.5
   📊 Setting rate for row 989: 7.5
   📊 Setting rate for row 991: 3.39
   📊 Setting rate for row 1004: 16.16
   📊 Setting rate for row 1010: 48.42
   📊 Setting rate for row 1012: 4162.76
   📊 Setting rate for row 1018: 50.86
   📊 Setting rate for row 1024: 45.6
   📊 Setting rate for row 1030: 45.6
   📊 Setting rate for row 1036: 90.99
   📊 Setting rate for row 1042: 11.2
   📊 Setting rate for row 1055: 11.2
   📊 Setting rate for row 1061: 11.2
   📊 Setting rate for row 1067: 11.2
   📊 Setting rate for row 1073: 11.2
   📊 Setting rate for row 1075: 11.2
   📊 Setting rate for row 1081: 11.2
   📊 Setting rate for row 1087: 11.2
   📊 Setting rate for row 1093: 405.24
   📊 Setting rate for row 1099: 199.5
   📊 Setting rate for row 1112: 730.77
   📊 Setting rate for row 1118: 1722.47
   📊 Setting rate for row 1120: 48
   📊 Setting rate for row 1126: 5.58
   📊 Setting rate for row 1139: 99.48
   📊 Setting rate for row 1141: 596.62
   📊 Setting rate for row 1143: 306.96
   📊 Setting rate for row 1145: 14.33
   📊 Setting rate for row 1147: 19.29
   📊 Setting rate for row 1153: 240.07
   📊 Setting rate for row 1159: 240.07
   📊 Setting rate for row 1165: 183
   📊 Setting rate for row 1167: 185.17
   📊 Setting rate for row 1169: 77.5
   📊 Setting rate for row 1182: 262.58
   📊 Setting rate for row 1184: 171.79
   📊 Setting rate for row 1190: 198.22
   📊 Setting rate for row 1192: 198.22
   📊 Setting rate for row 1194: 198.22
   📊 Setting rate for row 1196: 198.22
   📊 Setting rate for row 1202: 18.12
   📊 Setting rate for row 1204: 18.12
   📊 Setting rate for row 1210: 20.9
   📊 Setting rate for row 1212: 20.9
   📊 Setting rate for row 1214: 25.08
   📊 Setting rate for row 1227: 25.08
   📊 Setting rate for row 1233: 198.22
   📊 Setting rate for row 1235: 199.5
   📊 Setting rate for row 1237: 18.12
   📊 Setting rate for row 1239: 284.19
   📊 Setting rate for row 1241: 18.72
   📊 Setting rate for row 1247: 275.2
   📊 Setting rate for row 1249: 275.2
   📊 Setting rate for row 1251: 199.5
   📊 Setting rate for row 1253: 275.2
   📊 Setting rate for row 1255: 18.12
   📊 Setting rate for row 1261: 18.12
   📊 Setting rate for row 1274: 1722.47
   📊 Setting rate for row 1276: 189.32
   📊 Setting rate for row 1278: 1722.47
   📊 Setting rate for row 1280: 198.22
   📊 Setting rate for row 1286: 316.02
   📊 Setting rate for row 1288: 316.02
   📊 Setting rate for row 1294: 77.07
   📊 Setting rate for row 1296: 48
   📊 Setting rate for row 1302: 30.6
   📊 Setting rate for row 1315: 9.44
   📊 Setting rate for row 1317: 1.54
   📊 Setting rate for row 1319: 7.29
   📊 Setting rate for row 1321: 7
   📊 Setting rate for row 1327: 63.59
   📊 Setting rate for row 1329: 58.98
   📊 Setting rate for row 1331: 11.2
   📊 Setting rate for row 1337: 64.4
   📊 Setting rate for row 1339: 115.7
   📊 Setting rate for row 1345: 38.11
   📊 Setting rate for row 1347: 58.98
   📊 Setting rate for row 1353: 1.54
   📊 Setting rate for row 1366: 521.69
   📊 Setting rate for row 1372: 14.1
   📊 Setting rate for row 1374: 36.77
   📊 Setting rate for row 1376: 14.83
   📊 Setting rate for row 1389: 14.16
   📊 Setting rate for row 1391: 54.82
   📊 Setting rate for row 1393: 1.94
   📊 Setting rate for row 1399: 11.2
   📊 Setting rate for row 1401: 7
   📊 Setting rate for row 1403: 14.16
   📊 Setting rate for row 1416: 2645.49
   📊 Setting rate for row 1418: 4.3
   📊 Setting rate for row 1424: 17.37
   📊 Setting rate for row 1426: 4.3
   📊 Setting rate for row 1428: 4.3
   📊 Setting rate for row 1430: 596.62
   📊 Setting rate for row 1432: 43.99
   📊 Setting rate for row 1445: 14160
   📊 Setting rate for row 1458: 1489.21
   📊 Setting rate for row 1464: 2500
   📊 Setting rate for row 1470: 2173.21
   📊 Setting rate for row 1472: 2.28
   📊 Setting rate for row 1478: 19.67
   📊 Setting rate for row 1484: 6.29
   📊 Setting rate for row 1490: 272.98
   📊 Setting rate for row 1496: 104.23
   📊 Setting rate for row 1498: 39.3
   📊 Setting rate for row 1511: 104.23
   📊 Setting rate for row 1513: 116.37
   📊 Setting rate for row 1519: 269.6
   📊 Setting rate for row 1521: 18.08
   📊 Setting rate for row 1527: 269.6
   📊 Setting rate for row 1529: 73.57
   📊 Setting rate for row 1535: 126.18
   📊 Setting rate for row 1548: 405.24
   📊 Setting rate for row 1550: 32.18
   📊 Setting rate for row 1556: 126.18
   📊 Setting rate for row 1558: 52.09
   📊 Setting rate for row 1560: 76.21
   📊 Setting rate for row 1566: 126.18
   📊 Setting rate for row 1572: 126.18
   📊 Setting rate for row 1574: 126.18
   📊 Setting rate for row 1587: 126.18
   📊 Setting rate for row 1593: 5.53
   📊 Setting rate for row 1595: 20.2
   📊 Setting rate for row 1601: 8.33
   📊 Setting rate for row 1607: 8.33
   📊 Setting rate for row 1620: 64.03
   📊 Setting rate for row 1626: 173.73
   📊 Setting rate for row 1632: 87.63
   📊 Setting rate for row 1634: 87.63
   📊 Setting rate for row 1636: 87.63
   📊 Setting rate for row 1642: 173.73
   📊 Setting rate for row 1655: 87.63
   📊 Setting rate for row 1661: 56.22
   📊 Setting rate for row 1667: 87.63
   📊 Setting rate for row 1673: 65.52
   📊 Setting rate for row 1675: 65.52
   📊 Setting rate for row 1681: 39.15
   📊 Setting rate for row 1694: 48
   📊 Setting rate for row 1700: 1.6
   📊 Setting rate for row 1706: 1.6
   📊 Setting rate for row 1712: 26.61
   📊 Setting rate for row 1725: 240.07
   📊 Setting rate for row 1731: 230.6
   📊 Setting rate for row 1737: 200.25
   📊 Setting rate for row 1743: 106.5
   📊 Setting rate for row 1756: 446.39
   📊 Setting rate for row 1762: 431.17
   📊 Setting rate for row 1768: 268.34
   📊 Setting rate for row 1770: 112.63
   📊 Setting rate for row 1776: 460.6
   📊 Setting rate for row 1778: 460.6
   📊 Setting rate for row 1784: 431.17
   📊 Setting rate for row 1786: 431.17
   📊 Setting rate for row 1792: 431.17
   📊 Setting rate for row 1794: 431.17
   📊 Setting rate for row 1800: 252.06
   📊 Setting rate for row 1806: 20.14
   📊 Setting rate for row 1819: 405.24
   📊 Setting rate for row 1825: 19.29
   📊 Setting rate for row 1831: 121.3
   📊 Setting rate for row 1837: 186.26
   📊 Setting rate for row 1843: 30.6
   📊 Setting rate for row 1845: 230.6
   📊 Setting rate for row 1858: 215.2
   📊 Setting rate for row 1860: 215.2
   📊 Setting rate for row 1862: 215.2
   📊 Setting rate for row 1868: 261.44
   📊 Setting rate for row 1870: 261.44
   📊 Setting rate for row 1876: 415.77
   📊 Setting rate for row 1882: 400.89
   📊 Setting rate for row 1884: 400.89
   📊 Setting rate for row 1886: 400.89
   📊 Setting rate for row 1892: 415.77
   📊 Setting rate for row 1905: 7.78
   📊 Setting rate for row 1911: 24.45
   📊 Setting rate for row 1917: 150.28
   📊 Setting rate for row 1923: 311.66
   📊 Setting rate for row 1925: 311.66
   📊 Setting rate for row 1927: 311.66
   📊 Setting rate for row 1933: 322.84
   📊 Setting rate for row 1939: 24.45
   📊 Setting rate for row 1941: 20.41
   📊 Setting rate for row 1947: 895.11
   📊 Setting rate for row 1949: 33.52
   📊 Setting rate for row 1962: 148.62
   📊 Setting rate for row 1964: 968.27
   📊 Setting rate for row 1966: 190.92
   📊 Setting rate for row 1968: 370.13
   📊 Setting rate for row 1970: 23.27
   📊 Setting rate for row 1972: 11099.93
   📊 Setting rate for row 1974: 180.84
   📊 Setting rate for row 1976: 300.3
   📊 Setting rate for row 1978: 190.92
   📊 Setting rate for row 1980: 968.27
   📊 Setting rate for row 1982: 190.92
   📊 Setting rate for row 1984: 370.13
   📊 Setting rate for row 1986: 180.84
   📊 Setting rate for row 1988: 300.3
   📊 Setting rate for row 1994: 58.98
   📊 Setting rate for row 1996: 294.98
   📊 Setting rate for row 2009: 1213.22
   📊 Setting rate for row 2015: 1213.22
   📊 Setting rate for row 2017: 1213.22
   📊 Setting rate for row 2019: 1213.22
   📊 Setting rate for row 2032: 2448.48
   📊 Setting rate for row 2038: 1213.22
   📊 Setting rate for row 2040: 111.32
   📊 Setting rate for row 2046: 277.44
   📊 Setting rate for row 2059: 1455.12
   📊 Setting rate for row 2061: 233.22
   📊 Setting rate for row 2074: 241.48
   📊 Setting rate for row 2076: 241.48
   📊 Setting rate for row 2078: 241.48
   📊 Setting rate for row 2080: 241.48
   📊 Setting rate for row 2082: 241.48
   📊 Setting rate for row 2088: 241.48
   📊 Setting rate for row 2090: 241.48
   📊 Setting rate for row 2092: 241.48
   📊 Setting rate for row 2094: 241.48
   📊 Setting rate for row 2096: 241.48
   📊 Setting rate for row 2102: 271.4
   📊 Setting rate for row 2108: 12362.47
   📊 Setting rate for row 2121: 14160
   📊 Setting rate for row 2127: 75.05
   📊 Setting rate for row 2129: 197.58
   📊 Setting rate for row 2135: 294.98
   📊 Setting rate for row 2137: 51.47
   📊 Setting rate for row 2143: 223.28
   📊 Setting rate for row 2149: 189.32
   📊 Setting rate for row 2155: 126.18
   📊 Setting rate for row 2157: 172.37
   📊 Setting rate for row 2159: 189.32
   📊 Setting rate for row 2161: 282.48
   📊 Setting rate for row 2163: 189.32
   📊 Setting rate for row 2165: 189.32
   📊 Setting rate for row 2167: 370.13
   📊 Setting rate for row 2169: 148.62
   📊 Setting rate for row 2171: 126.18
   📊 Setting rate for row 2173: 2352.47
   📊 Setting rate for row 2186: 190.92
   📊 Setting rate for row 2188: 2352.47
   📊 Setting rate for row 2190: 370.13
   📊 Setting rate for row 2192: 126.18
   📊 Setting rate for row 2198: 208.43
   📊 Setting rate for row 2200: 190.92
   📊 Setting rate for row 2206: 190.92
   📊 Setting rate for row 2212: 190.92
   📊 Setting rate for row 2214: 282.48
   📊 Setting rate for row 2227: 1069.98
   📊 Setting rate for row 2229: 1069.98
   📊 Setting rate for row 2231: 1353.87
   📊 Setting rate for row 2233: 1353.87
   📊 Setting rate for row 2239: 1213.22
   📊 Setting rate for row 2252: 111.32
   📊 Setting rate for row 2254: 111.32
   📊 Setting rate for row 2256: 2112.72
   📊 Setting rate for row 2258: 310.04
   📊 Setting rate for row 2260: 2448.48
   📊 Setting rate for row 2266: 300.3
   📊 Setting rate for row 2279: 103.46
   📊 Setting rate for row 2292: 2124
   📊 Setting rate for row 2294: 0
   📊 Setting rate for row 2307: 6
   📊 Setting rate for row 2313: 489.15
   📊 Setting rate for row 2319: 2173.21
   📊 Setting rate for row 2321: 12362.47
   📊 Setting rate for row 2327: 2.7
   📊 Setting rate for row 2333: 27.36
   📊 Setting rate for row 2339: 3
   📊 Setting rate for row 2345: 7.5
   📊 Setting rate for row 2347: 3
   📊 Setting rate for row 2353: 3
   📊 Setting rate for row 2366: 150.28
   📊 Setting rate for row 2368: 252.06
   📊 Setting rate for row 2374: 57.8
   📊 Setting rate for row 2376: 153.67
   📊 Setting rate for row 2378: 268.34
   📊 Setting rate for row 2380: 180.84
   📊 Setting rate for row 2393: 338.64
   📊 Setting rate for row 2395: 176.45
   📊 Setting rate for row 2397: 1046.37
   📊 Setting rate for row 2399: 268.34
✅ Export completed: C:\Users\abaza\OneDrive\Desktop\MJDv8\server\output\matched-b89982fc-38d6-4df9-8ea3-597bf408631b-job-b89982fc-38d6-4df9-8ea3-597bf408631b-Input - Copy.xlsx
📊 Total items processed: 523
🛡️ [PROGRESS] Blocking backward progress: 85% <= 85%
🔥 [MATCHING] CRITICAL: Matching completed successfully
[PRICE MATCHING DEBUG] Received matching result: {
  method: 'hybrid',
  totalMatched: 523,
  averageConfidence: 48,
  matchesLength: 523,
  outputPath: 'C:\\Users\\abaza\\OneDrive\\Desktop\\MJDv8\\server\\output\\matched-b89982fc-38d6-4df9-8ea3-597bf408631b-job-b89982fc-38d6-4df9-8ea3-597bf408631b-Input - Copy.xlsx'
}
✅ Matching completed: 523 matches found
💾 Saving results to database...
🔄 [DATABASE] ENTERING updateJobStatus for job b89982fc-38d6-4df9-8ea3-597bf408631b: status=processing, progress=86
🔄 [DATABASE] Message: Found 523 matches
🔄 [DATABASE] Current job status before update: {
  status: 'processing',
  progress: 85,
  updated_at: '2025-06-27T23:27:07.429077+00:00'
}
   Stack trace for unexpected progress:     at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async PriceMatchingService.processFile (file:///C:/Users/abaza/OneDrive/Desktop/MJDv8/server/services/PriceMatchingService.js:391:7)
🔄 [DATABASE] Attempting to update job b89982fc-38d6-4df9-8ea3-597bf408631b with data: {
  "status": "processing",
  "updated_at": "2025-06-27T23:27:12.764Z",
  "progress": 86,
  "error_message": "Found 523 matches",
  "matched_items": 523,
  "total_items": 523
}
✅ [DATABASE] Successfully updated job b89982fc-38d6-4df9-8ea3-597bf408631b: processing 86% - "Found 523 matches"
Saving 523 matches to database...
✅ Saved batch 1/2 successfully with match_mode
✅ Saved batch 2/2 successfully with match_mode
Successfully saved 523 matches to database
✅ Results saved to database
🔄 [DATABASE] ENTERING updateJobStatus for job b89982fc-38d6-4df9-8ea3-597bf408631b: status=processing, progress=90
🔄 [DATABASE] Message: Saving results...
🔄 [DATABASE] Current job status before update: {
  status: 'processing',
  progress: 86,
  updated_at: '2025-06-27T23:27:13.622511+00:00'
}
🔄 [DATABASE] Attempting to update job b89982fc-38d6-4df9-8ea3-597bf408631b with data: {
  "status": "processing",
  "updated_at": "2025-06-27T23:27:18.728Z",
  "progress": 90,
  "error_message": "Saving results...",
  "matched_items": 523,
  "total_items": 523
}
✅ [DATABASE] Successfully updated job b89982fc-38d6-4df9-8ea3-597bf408631b: processing 90% - "Saving results..."
📄 Generating output Excel file...
[PRICE MATCHING DEBUG] Updating job with final stats: {
  matched_items: 523,
  total_items: 523,
  confidence_score: 48,
  output_file_path: 'C:\\Users\\abaza\\OneDrive\\Desktop\\MJDv8\\server\\output\\matched-b89982fc-38d6-4df9-8ea3-597bf408631b-job-b89982fc-38d6-4df9-8ea3-597bf408631b-Input - Copy.xlsx'
}
🔄 [DATABASE] ENTERING updateJobStatus for job b89982fc-38d6-4df9-8ea3-597bf408631b: status=processing, progress=95
🔄 [DATABASE] Message: Finalizing results...
🔄 [DATABASE] Current job status before update: {
  status: 'processing',
  progress: 90,
  updated_at: '2025-06-27T23:27:19.591913+00:00'
}
🔄 [DATABASE] Attempting to update job b89982fc-38d6-4df9-8ea3-597bf408631b with data: {
  "status": "processing",
  "updated_at": "2025-06-27T23:27:19.133Z",
  "progress": 95,
  "error_message": "Finalizing results...",
  "matched_items": 523,
  "total_items": 523
}
✅ [DATABASE] Successfully updated job b89982fc-38d6-4df9-8ea3-597bf408631b: processing 95% - "Finalizing results..."
[PRICE MATCHING DEBUG] Error updating job: {
  code: 'PGRST204',
  details: null,
  hint: null,
  message: "Could not find the 'output_file_path' column of 'ai_matching_jobs' in the schema cache"
}
🔄 [DATABASE] ENTERING updateJobStatus for job b89982fc-38d6-4df9-8ea3-597bf408631b: status=completed, progress=100
🔄 [DATABASE] Current job status before update: {
  status: 'processing',
  progress: 95,
  updated_at: '2025-06-27T23:27:19.99617+00:00'
}
🛡️ [DATABASE] Final status update for job b89982fc-38d6-4df9-8ea3-597bf408631b: completed
✅ [DATABASE] Final status update successful for job b89982fc-38d6-4df9-8ea3-597bf408631b: completed
🎉 Job b89982fc-38d6-4df9-8ea3-597bf408631b COMPLETED successfully
🧹 Cleaning up temp files...
🧹 Checking file for cleanup: C:\Users\abaza\OneDrive\Desktop\MJDv8\server\temp\job-b89982fc-38d6-4df9-8ea3-597bf408631b-Input - Copy.xlsx
📄 Preserving original input file for export: C:\Users\abaza\OneDrive\Desktop\MJDv8\server\temp\job-b89982fc-38d6-4df9-8ea3-597bf408631b-Input - Copy.xlsx
✅ Cleanup completed
✅ Job b89982fc-38d6-4df9-8ea3-597bf408631b completed successfully
✅ [PROCESSING] SYNCHRONOUS processing completed for job b89982fc-38d6-4df9-8ea3-597bf408631b
📁 [PROCESSING] Uploading output file to storage...
✅ [PROCESSING] Output uploaded to storage successfully
✅ [VERCEL DEBUG] Returning success response after SYNCHRONOUS processing
::1 - - [27/Jun/2025:23:27:20 +0000] "POST /price-matching/process-base64 HTTP/1.1" 200 317 "http://localhost:8080/" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36"
[2025-06-27T23:27:22.120Z] GET /price-matching/status/b89982fc-38d6-4df9-8ea3-597bf408631b
📊 Status check requested for job: b89982fc-38d6-4df9-8ea3-597bf408631b
📊 Status found for job b89982fc-38d6-4df9-8ea3-597bf408631b: { status: 'completed', progress: 100, matched_items: 523 }
::1 - - [27/Jun/2025:23:27:22 +0000] "GET /price-matching/status/b89982fc-38d6-4df9-8ea3-597bf408631b HTTP/1.1" 200 1345 "http://localhost:8080/" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36"