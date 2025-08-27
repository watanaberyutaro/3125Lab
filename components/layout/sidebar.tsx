'use client'

import { usePathname } from 'next/navigation'
import { 
  Home, 
  FolderOpen, 
  Users, 
  CheckSquare, 
  FileText,
  DollarSign,
  Calendar,
  Settings,
  LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LinkWithLoading } from '@/components/ui/link-with-loading'
import { useLoading } from '@/hooks/use-loading'

const navigation = [
  { name: 'ダッシュボード', href: '/dashboard', icon: Home },
  { name: 'プロジェクト', href: '/projects', icon: FolderOpen },
  { name: 'クライアント', href: '/clients', icon: Users },
  { name: 'タスク', href: '/tasks', icon: CheckSquare },
  { name: 'ドキュメント', href: '/documents', icon: FileText },
  { name: '財務管理', href: '/finance', icon: DollarSign },
  { name: 'カレンダー', href: '/calendar', icon: Calendar },
  { name: '設定', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { startLoading } = useLoading()

  const handleLogout = async () => {
    startLoading()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <div className="hidden md:flex h-full w-64 flex-col bg-white/95 backdrop-blur-sm border-r border-black">
      <div className="flex h-16 items-center px-6 border-b border-black">
        <h1 className="text-xl font-bold">3125Lab</h1>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <LinkWithLoading
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-gray-100 text-black'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </LinkWithLoading>
          )
        })}
      </nav>
      <div className="border-t border-black p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5" />
          ログアウト
        </button>
      </div>
    </div>
  )
}