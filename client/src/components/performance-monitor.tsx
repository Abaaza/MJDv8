import { useEffect, useRef } from 'react'

export const usePerformanceMonitor = (componentName: string) => {
  const renderCount = useRef(0)
  const renderTime = useRef<number | null>(null)

  useEffect(() => {
    renderCount.current += 1
    const startTime = performance.now()

    // Log render count
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 ${componentName} rendered ${renderCount.current} times`)
    }

    return () => {
      const endTime = performance.now()
      renderTime.current = endTime - startTime
      
      // Warn if component takes too long to render
      if (process.env.NODE_ENV === 'development' && renderTime.current > 16) {
        console.warn(`⚠️ ${componentName} took ${renderTime.current.toFixed(2)}ms to render`)
      }
    }
  })
}

// API Performance Interceptor
export const apiPerformanceInterceptor = {
  request: (config: any) => {
    config.metadata = { startTime: performance.now() }
    return config
  },
  
  response: (response: any) => {
    if (response.config.metadata) {
      const duration = performance.now() - response.config.metadata.startTime
      
      if (process.env.NODE_ENV === 'development') {
        const method = response.config.method?.toUpperCase() || 'GET'
        const url = response.config.url
        
        console.log(
          `📊 API ${method} ${url} - ${duration.toFixed(0)}ms`,
          duration > 1000 ? '🐢' : '🚀'
        )
      }
      
      // Track slow API calls
      if (duration > 1000) {
        console.warn(`⚠️ Slow API call detected: ${response.config.url} took ${duration.toFixed(0)}ms`)
      }
    }
    
    return response
  },
  
  error: (error: any) => {
    if (error.config?.metadata) {
      const duration = performance.now() - error.config.metadata.startTime
      console.error(`❌ API Error ${error.config.url} after ${duration.toFixed(0)}ms`)
    }
    return Promise.reject(error)
  }
} 