import React, { useEffect, useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, Clock, Cpu, Gauge } from 'lucide-react'

interface PerformanceMetrics {
  renderTime: number
  componentCount: number
  memoryUsage?: number
  fps: number
  lastUpdate: number
}

interface PerformanceMonitorProps {
  enabled?: boolean
  showDetails?: boolean
  componentName?: string
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  enabled = process.env.NODE_ENV === 'development',
  showDetails = false,
  componentName = 'Component'
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    componentCount: 0,
    fps: 60,
    lastUpdate: Date.now()
  })
  
  const frameRef = useRef<number>()
  const startTimeRef = useRef<number>()
  const renderCountRef = useRef(0)
  const fpsCounterRef = useRef({ frames: 0, lastTime: Date.now() })

  useEffect(() => {
    if (!enabled) return

    startTimeRef.current = performance.now()
    renderCountRef.current++

    // Measure render time
    const measureRenderTime = () => {
      if (startTimeRef.current) {
        const renderTime = performance.now() - startTimeRef.current
        
        setMetrics(prev => ({
          ...prev,
          renderTime,
          componentCount: renderCountRef.current,
          lastUpdate: Date.now()
        }))
      }
    }

    // FPS counter
    const updateFPS = () => {
      const now = Date.now()
      fpsCounterRef.current.frames++
      
      if (now - fpsCounterRef.current.lastTime >= 1000) {
        const fps = Math.round((fpsCounterRef.current.frames * 1000) / (now - fpsCounterRef.current.lastTime))
        fpsCounterRef.current = { frames: 0, lastTime: now }
        
        setMetrics(prev => ({ ...prev, fps }))
      }
      
      frameRef.current = requestAnimationFrame(updateFPS)
    }

    // Start FPS monitoring
    frameRef.current = requestAnimationFrame(updateFPS)

    // Measure render time after DOM update
    const timeoutId = setTimeout(measureRenderTime, 0)

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
      clearTimeout(timeoutId)
    }
  })

  // Memory usage (if available)
  useEffect(() => {
    if (!enabled || !('memory' in performance)) return

    const updateMemory = () => {
      const memory = (performance as any).memory
      if (memory) {
        setMetrics(prev => ({
          ...prev,
          memoryUsage: Math.round(memory.usedJSHeapSize / 1024 / 1024)
        }))
      }
    }

    const interval = setInterval(updateMemory, 2000)
    return () => clearInterval(interval)
  }, [enabled])

  if (!enabled) return null

  const getRenderTimeColor = (time: number) => {
    if (time < 16) return 'bg-green-500'
    if (time < 33) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getFPSColor = (fps: number) => {
    if (fps >= 55) return 'bg-green-500'
    if (fps >= 30) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  if (!showDetails) {
    return (
      <div className="fixed bottom-4 right-4 z-50 bg-background/80 backdrop-blur-sm border rounded-lg p-2 shadow-lg">
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${getRenderTimeColor(metrics.renderTime)}`} />
            <span>{metrics.renderTime.toFixed(1)}ms</span>
          </div>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${getFPSColor(metrics.fps)}`} />
            <span>{metrics.fps}fps</span>
          </div>
          {metrics.memoryUsage && (
            <div className="flex items-center gap-1">
              <Cpu className="w-3 h-3" />
              <span>{metrics.memoryUsage}MB</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-80 bg-background/95 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Performance Monitor - {componentName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Render Time
          </span>
          <Badge variant={metrics.renderTime < 16 ? 'default' : metrics.renderTime < 33 ? 'secondary' : 'destructive'}>
            {metrics.renderTime.toFixed(1)}ms
          </Badge>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Gauge className="w-3 h-3" />
            FPS
          </span>
          <Badge variant={metrics.fps >= 55 ? 'default' : metrics.fps >= 30 ? 'secondary' : 'destructive'}>
            {metrics.fps}
          </Badge>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Renders</span>
          <Badge variant="outline">{metrics.componentCount}</Badge>
        </div>

        {metrics.memoryUsage && (
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Cpu className="w-3 h-3" />
              Memory
            </span>
            <Badge variant="outline">{metrics.memoryUsage}MB</Badge>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          Last update: {new Date(metrics.lastUpdate).toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  )
}

// Performance wrapper HOC
export function withPerformanceMonitoring<T extends object>(
  Component: React.ComponentType<T>,
  componentName?: string
) {
  const WrappedComponent = React.forwardRef<any, T>((props, ref) => {
    return (
      <>
        <Component {...props} ref={ref} />
        <PerformanceMonitor 
          componentName={componentName || Component.displayName || Component.name} 
        />
      </>
    )
  })
  
  WrappedComponent.displayName = `withPerformanceMonitoring(${componentName || Component.displayName || Component.name})`
  return WrappedComponent
}

// Hook for measuring component performance
export function usePerformanceMetrics(componentName: string) {
  const renderCountRef = useRef(0)
  const mountTimeRef = useRef(Date.now())

  useEffect(() => {
    renderCountRef.current++
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${componentName} rendered ${renderCountRef.current} times`)
    }
  })

  const logPerformance = (operation: string, startTime: number) => {
    const duration = performance.now() - startTime
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${componentName}: ${operation} took ${duration.toFixed(2)}ms`)
    }
    return duration
  }

  return {
    renderCount: renderCountRef.current,
    mountTime: mountTimeRef.current,
    logPerformance
  }
}