'use client'

import Link from 'next/link'
import { useLoading } from '@/hooks/use-loading'
import { useRouter } from 'next/navigation'

interface LinkWithLoadingProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  children: React.ReactNode
}

export function LinkWithLoading({ href, children, className, ...props }: LinkWithLoadingProps) {
  const { startLoading } = useLoading()
  const router = useRouter()

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    startLoading()
    setTimeout(() => {
      router.push(href)
    }, 50)
  }

  return (
    <Link href={href} className={className} onClick={handleClick} {...props}>
      {children}
    </Link>
  )
}