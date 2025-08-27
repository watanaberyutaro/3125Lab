'use client'

import { useLoading } from '@/hooks/use-loading'
import { Loading } from '@/components/ui/loading'

export function LoadingWrapper({ children }: { children: React.ReactNode }) {
  const { isLoading } = useLoading()

  return (
    <>
      {isLoading && <Loading fullScreen text="読み込み中" />}
      <div className={`transition-all duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        {children}
      </div>
    </>
  )
}