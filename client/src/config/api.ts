// Centralized API configuration
export const getApiUrl = () => {
  // If VITE_API_URL is explicitly set, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  
  // In production (Vercel), use relative URLs - they'll automatically use the same domain
  if (import.meta.env.PROD) {
    return ''
  }
  
  // In development, use localhost
  return 'http://localhost:3001'
}

export const API_BASE_URL = getApiUrl()

// Helper function to build API endpoints
export const apiEndpoint = (path: string) => {
  const base = API_BASE_URL
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  
  // If base is empty (production), just return the path
  if (!base) {
    return normalizedPath
  }
  
  // Otherwise, combine base and path
  return `${base}${normalizedPath}`
} 