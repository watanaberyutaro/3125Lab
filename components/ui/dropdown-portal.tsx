'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface DropdownPortalProps {
  children: React.ReactNode
  targetRef: React.RefObject<HTMLElement | null>
  isOpen: boolean
}

export function DropdownPortal({ children, targetRef, isOpen }: DropdownPortalProps) {
  const [mounted, setMounted] = useState(false)
  const [position, setPosition] = useState({ top: 0, right: 0 })

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (!targetRef.current || !isOpen) return

    const updatePosition = () => {
      if (!targetRef.current) return
      const rect = targetRef.current.getBoundingClientRect()
      const windowWidth = window.innerWidth
      
      // 右端からの距離を計算（通知とユーザーメニューは右寄せ）
      setPosition({
        top: rect.bottom + window.scrollY + 8, // 8px gap
        right: windowWidth - rect.right - window.scrollX
      })
    }

    updatePosition()
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)

    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [targetRef, isOpen])

  if (!mounted || !isOpen) return null

  return createPortal(
    <div
      style={{
        position: 'absolute',
        top: `${position.top}px`,
        right: `${position.right}px`,
        zIndex: 9999,
      }}
    >
      {children}
    </div>,
    document.body
  )
}