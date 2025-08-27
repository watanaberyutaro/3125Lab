'use client'

import { useEffect, useState } from 'react'

interface LoadingProps {
  fullScreen?: boolean
  text?: string
}

export function Loading({ fullScreen = true, text = 'Loading...' }: LoadingProps) {
  const [dots, setDots] = useState('')

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.')
    }, 500)
    return () => clearInterval(interval)
  }, [])

  const content = (
    <div className="flex flex-col items-center justify-center space-y-8">
      {/* 3125Lab Logo - Minimal Monochrome */}
      <div className="relative">
        <div className="text-6xl font-thin text-black tracking-[0.2em]">
          3125Lab
        </div>
        <div className="absolute inset-0 text-6xl font-thin text-gray-400 tracking-[0.2em] animate-pulse opacity-30">
          3125Lab
        </div>
      </div>

      {/* Minimal Geometric Spinner */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border border-black rounded-full"></div>
        <div className="absolute inset-0 border-2 border-black rounded-full animate-spin border-t-transparent"></div>
        <div className="absolute inset-[6px] border border-gray-400 rounded-full"></div>
        <div className="absolute inset-[6px] border border-gray-800 rounded-full animate-spin animation-delay-150 border-r-transparent"></div>
        <div className="absolute inset-3 border border-black rounded-full"></div>
        <div className="absolute inset-3 border border-black rounded-full animate-spin animation-delay-300 border-l-transparent"></div>
      </div>

      {/* Loading Text - Minimal */}
      <div className="text-gray-700 text-sm tracking-widest font-light">
        {text}{dots}
      </div>

      {/* Minimal Progress Bar */}
      <div className="w-48 h-[1px] bg-black">
        <div className="h-full bg-black animate-progress"></div>
      </div>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* 方眼紙背景を含む白背景 */}
        <div className="absolute inset-0 bg-white/95">
          <div 
            className="w-full h-full opacity-50"
            style={{
              backgroundImage: `
                linear-gradient(rgba(128, 128, 128, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(128, 128, 128, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0'
            }}
          />
        </div>
        <div className="relative z-10">
          {content}
        </div>
      </div>
    )
  }

  return content
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const handleStart = () => setIsLoading(true)
    const handleComplete = () => setIsLoading(false)

    // Listen to route changes
    const handleRouteChange = () => {
      handleStart()
      setTimeout(handleComplete, 500) // Minimum loading time for smooth transition
    }

    // For Next.js App Router, we need to observe DOM changes
    const observer = new MutationObserver(() => {
      handleRouteChange()
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    })

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <>
      {isLoading && <Loading />}
      <div className={isLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}>
        {children}
      </div>
    </>
  )
}

// Skeleton Loading Components
export function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg border border-black p-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
      <div className="flex space-x-2">
        <div className="h-8 bg-gray-200 rounded w-20"></div>
        <div className="h-8 bg-gray-200 rounded w-20"></div>
      </div>
    </div>
  )
}

export function SkeletonTable() {
  return (
    <div className="bg-white rounded-lg border border-black overflow-hidden">
      <div className="p-4 border-b border-black">
        <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
      </div>
      <div className="divide-y divide-black">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 flex space-x-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded flex-1"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
        ))}
      </div>
    </div>
  )
}