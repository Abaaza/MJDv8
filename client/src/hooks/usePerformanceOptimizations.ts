import { useEffect, useCallback, useRef, useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

/**
 * Hook for optimized image loading with lazy loading and caching
 */
export function useOptimizedImageLoader() {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement
            const src = img.dataset.src
            if (src && !loadedImages.has(src)) {
              img.src = src
              setLoadedImages(prev => new Set([...prev, src]))
              observerRef.current?.unobserve(img)
            }
          }
        })
      },
      { threshold: 0.1 }
    )

    return () => observerRef.current?.disconnect()
  }, [loadedImages])

  const observeImage = useCallback((element: HTMLImageElement | null) => {
    if (element && observerRef.current) {
      observerRef.current.observe(element)
    }
  }, [])

  return { observeImage, loadedImages }
}

/**
 * Hook for memory-efficient virtual scrolling
 */
export function useVirtualScrolling<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan = 5
) {
  const [scrollTop, setScrollTop] = useState(0)

  const startIndex = useMemo(() => {
    return Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  }, [scrollTop, itemHeight, overscan])

  const endIndex = useMemo(() => {
    const visibleItems = Math.ceil(containerHeight / itemHeight)
    return Math.min(items.length - 1, startIndex + visibleItems + overscan * 2)
  }, [startIndex, containerHeight, itemHeight, items.length, overscan])

  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index,
      offsetY: (startIndex + index) * itemHeight
    }))
  }, [items, startIndex, endIndex, itemHeight])

  const totalHeight = items.length * itemHeight

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop)
  }, [])

  return {
    visibleItems,
    totalHeight,
    startIndex,
    endIndex,
    handleScroll
  }
}

/**
 * Hook for optimized data prefetching
 */
export function usePrefetch() {
  const prefetchQueue = useRef<Map<string, Promise<any>>>(new Map())

  const prefetch = useCallback(async (key: string, queryFn: () => Promise<any>) => {
    if (prefetchQueue.current.has(key)) {
      return prefetchQueue.current.get(key)
    }

    const promise = queryFn()
    prefetchQueue.current.set(key, promise)

    try {
      const result = await promise
      // Cache result for a short time
      setTimeout(() => {
        prefetchQueue.current.delete(key)
      }, 5 * 60 * 1000) // 5 minutes
      
      return result
    } catch (error) {
      prefetchQueue.current.delete(key)
      throw error
    }
  }, [])

  const clearCache = useCallback(() => {
    prefetchQueue.current.clear()
  }, [])

  return { prefetch, clearCache }
}

/**
 * Hook for optimized event handling with debouncing and throttling
 */
export function useOptimizedEventHandlers() {
  const debounceTimers = useRef<Map<string, NodeJS.Timeout>>(new Map())
  const throttleTimers = useRef<Map<string, boolean>>(new Map())

  const debounce = useCallback((
    key: string,
    fn: Function,
    delay: number = 300
  ) => {
    return (...args: any[]) => {
      const existingTimer = debounceTimers.current.get(key)
      if (existingTimer) {
        clearTimeout(existingTimer)
      }

      const timer = setTimeout(() => {
        fn(...args)
        debounceTimers.current.delete(key)
      }, delay)

      debounceTimers.current.set(key, timer)
    }
  }, [])

  const throttle = useCallback((
    key: string,
    fn: Function,
    delay: number = 100
  ) => {
    return (...args: any[]) => {
      if (!throttleTimers.current.get(key)) {
        fn(...args)
        throttleTimers.current.set(key, true)
        
        setTimeout(() => {
          throttleTimers.current.set(key, false)
        }, delay)
      }
    }
  }, [])

  useEffect(() => {
    return () => {
      // Cleanup timers
      debounceTimers.current.forEach(timer => clearTimeout(timer))
      debounceTimers.current.clear()
      throttleTimers.current.clear()
    }
  }, [])

  return { debounce, throttle }
}

/**
 * Hook for memory usage monitoring
 */
export function useMemoryMonitor(componentName: string) {
  const [memoryInfo, setMemoryInfo] = useState<{
    used: number
    total: number
    percentage: number
  } | null>(null)

  useEffect(() => {
    const checkMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        const used = Math.round(memory.usedJSHeapSize / 1024 / 1024)
        const total = Math.round(memory.totalJSHeapSize / 1024 / 1024)
        const percentage = Math.round((used / total) * 100)

        setMemoryInfo({ used, total, percentage })

        // Warn if memory usage is high
        if (percentage > 80) {
          console.warn(
            `⚠️ High memory usage in ${componentName}: ${used}MB/${total}MB (${percentage}%)`
          )
        }
      }
    }

    checkMemory()
    const interval = setInterval(checkMemory, 10000) // Check every 10 seconds

    return () => clearInterval(interval)
  }, [componentName])

  return memoryInfo
}

/**
 * Hook for optimized component re-renders
 */
export function useRenderOptimization(dependencies: any[], debugName?: string) {
  const previousDeps = useRef(dependencies)
  const renderCount = useRef(0)

  const hasChanged = useMemo(() => {
    const changed = dependencies.some((dep, index) => 
      !Object.is(dep, previousDeps.current[index])
    )
    
    if (changed) {
      renderCount.current++
      if (debugName && process.env.NODE_ENV === 'development') {
        console.log(`🔄 ${debugName} re-rendered (${renderCount.current}) due to:`, {
          oldDeps: previousDeps.current,
          newDeps: dependencies
        })
      }
    }
    
    previousDeps.current = dependencies
    return changed
  }, dependencies)

  return { hasChanged, renderCount: renderCount.current }
}

/**
 * Hook for background task processing
 */
export function useBackgroundTasks() {
  const taskQueue = useRef<Array<{ id: string; task: () => Promise<any>; priority: number }>>([])
  const isProcessing = useRef(false)

  const addTask = useCallback((
    id: string,
    task: () => Promise<any>,
    priority: number = 1
  ) => {
    taskQueue.current.push({ id, task, priority })
    taskQueue.current.sort((a, b) => b.priority - a.priority) // Higher priority first
    
    if (!isProcessing.current) {
      processQueue()
    }
  }, [])

  const processQueue = useCallback(async () => {
    if (isProcessing.current || taskQueue.current.length === 0) return

    isProcessing.current = true

    while (taskQueue.current.length > 0) {
      const { id, task } = taskQueue.current.shift()!
      
      try {
        // Use requestIdleCallback if available for non-critical tasks
        if ('requestIdleCallback' in window) {
          await new Promise(resolve => {
            window.requestIdleCallback(async () => {
              await task()
              resolve(void 0)
            })
          })
        } else {
          await task()
        }
        
        console.log(`✅ Background task ${id} completed`)
      } catch (error) {
        console.error(`❌ Background task ${id} failed:`, error)
      }
    }

    isProcessing.current = false
  }, [])

  return { addTask }
}

/**
 * Hook for connection quality monitoring
 */
export function useConnectionMonitor() {
  const [connectionInfo, setConnectionInfo] = useState<{
    effectiveType: string
    downlink: number
    rtt: number
    saveData: boolean
  } | null>(null)

  useEffect(() => {
    const updateConnection = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection
        setConnectionInfo({
          effectiveType: connection.effectiveType || 'unknown',
          downlink: connection.downlink || 0,
          rtt: connection.rtt || 0,
          saveData: connection.saveData || false
        })
      }
    }

    updateConnection()

    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      connection.addEventListener('change', updateConnection)
      
      return () => {
        connection.removeEventListener('change', updateConnection)
      }
    }
  }, [])

  const isSlowConnection = useMemo(() => {
    return connectionInfo ? 
      connectionInfo.effectiveType === 'slow-2g' || 
      connectionInfo.effectiveType === '2g' ||
      connectionInfo.downlink < 1.5 : false
  }, [connectionInfo])

  return { connectionInfo, isSlowConnection }
}

/**
 * Hook for component performance metrics
 */
export function usePerformanceMetrics(componentName: string) {
  const renderTimes = useRef<number[]>([])
  const startTime = useRef<number>(0)

  useEffect(() => {
    startTime.current = performance.now()
    
    return () => {
      const endTime = performance.now()
      const renderTime = endTime - startTime.current
      
      renderTimes.current.push(renderTime)
      
      // Keep only last 10 render times
      if (renderTimes.current.length > 10) {
        renderTimes.current.shift()
      }
      
      // Calculate average render time
      const avgRenderTime = renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`⚡ ${componentName} render metrics:`, {
          current: `${renderTime.toFixed(2)}ms`,
          average: `${avgRenderTime.toFixed(2)}ms`,
          samples: renderTimes.current.length
        })
      }
    }
  })

  const logPerformance = useCallback((operation: string, startTime: number) => {
    const duration = performance.now() - startTime
    if (duration > 100) { // Log slow operations
      console.warn(`🐢 Slow ${operation} in ${componentName}: ${duration.toFixed(2)}ms`)
    }
  }, [componentName])

  return { logPerformance }
}