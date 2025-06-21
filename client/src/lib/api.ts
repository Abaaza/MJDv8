import { useMutation } from '@tanstack/react-query'

// Smart API URL detection
const getApiUrl = () => {
  // If VITE_API_URL is explicitly set, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  
  // In production (Vercel), use the same domain
  if (import.meta.env.PROD) {
    // Use relative URLs in production - they'll automatically use the same domain
    return ''
  }
  
  // In development, use localhost
  return 'http://localhost:3001'
}

const API_BASE_URL = getApiUrl()

interface MatchRequest {
  jobId: string
  fileData: any
}

interface MatchResponse {
  success: boolean
  error?: string
}

async function processMatch(data: MatchRequest): Promise<MatchResponse> {
  const response = await fetch(`${API_BASE_URL}/match`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to process match')
  }

  return response.json()
}

export function useProcessMatch() {
  return useMutation({
    mutationFn: processMatch,
  })
} 