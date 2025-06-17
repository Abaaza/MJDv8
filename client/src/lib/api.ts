import { useMutation } from '@tanstack/react-query'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

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