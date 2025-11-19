import React, { useState } from 'react'
import { Camera } from 'lucide-react'

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

export function ImageWithFallback(props) {
  const [didError, setDidError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const handleError = () => {
    setDidError(true)
    setIsLoading(false)
  }

  const handleLoad = () => {
    setIsLoading(false)
  }

  const { src, alt, style, className, ...rest } = props

  // If no src provided, show placeholder
  if (!src || src.trim() === '') {
    return (
      <div
        className={`inline-flex items-center justify-center bg-gradient-to-br from-orange-100 to-yellow-100 dark:from-slate-700 dark:to-slate-800 text-center align-middle ${className ?? ''}`}
        style={style}
      >
        <Camera className="w-8 h-8 text-gray-400 dark:text-gray-500" />
      </div>
    )
  }

  if (didError) {
    return (
      <div
        className={`inline-flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-800 text-center align-middle ${className ?? ''}`}
        style={style}
      >
        <div className="flex flex-col items-center justify-center w-full h-full p-4">
          <Camera className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2" />
          <span className="text-xs text-gray-500 dark:text-gray-400">Image not available</span>
        </div>
      </div>
    )
  }

  return (
    <div className="relative" style={{ display: 'inline-block', width: '100%', height: '100%' }}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-slate-700 animate-pulse rounded" />
      )}
      <img
        src={src}
        alt={alt}
        className={`${className ?? ''} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        style={{ ...style, position: 'relative', zIndex: 1 }}
        {...rest}
        onError={handleError}
        onLoad={handleLoad}
        loading="lazy"
      />
    </div>
  )
}

