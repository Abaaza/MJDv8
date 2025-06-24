import React, { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  placeholder?: string
  className?: string
  onError?: () => void
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2U1ZTdlYiIvPjwvc3ZnPg==',
  className,
  onError,
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder)
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (!imageRef || !('IntersectionObserver' in window)) {
      // Fallback for browsers that don't support IntersectionObserver
      setImageSrc(src)
      return
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Load the actual image
            const img = new Image()
            img.src = src
            
            img.onload = () => {
              setImageSrc(src)
              setIsLoaded(true)
            }
            
            img.onerror = () => {
              setHasError(true)
              onError?.()
            }

            // Stop observing once loaded
            if (observerRef.current) {
              observerRef.current.disconnect()
            }
          }
        })
      },
      {
        // Load images when they're within 50px of the viewport
        rootMargin: '50px',
      }
    )

    observerRef.current.observe(imageRef)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [imageRef, src, onError])

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <img
        ref={setImageRef}
        src={imageSrc}
        alt={alt}
        className={cn(
          'transition-all duration-300',
          isLoaded ? 'opacity-100 blur-0' : 'opacity-70 blur-sm',
          hasError && 'opacity-50',
          className
        )}
        {...props}
      />
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100/50">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-primary" />
        </div>
      )}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center text-gray-500">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="mt-2 text-sm">Failed to load image</p>
          </div>
        </div>
      )}
    </div>
  )
} 