'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  Home,
  FolderOpen,
  CheckSquare,
  Calendar,
  Menu,
  X,
  Users,
  FileText,
  DollarSign,
  Settings,
  LogOut,
  Globe
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

const mobileNavigation = [
  { name: 'ホーム', href: '/', icon: Home },
  { name: 'プロジェクト', href: '/projects', icon: FolderOpen },
  { name: 'タスク', href: '/tasks', icon: CheckSquare },
  { name: 'カレンダー', href: '/calendar', icon: Calendar },
]

const menuItems = [
  { name: 'ダッシュボード', href: '/', icon: Home },
  { name: 'プロジェクト', href: '/projects', icon: FolderOpen },
  { name: 'クライアント', href: '/clients', icon: Users },
  { name: 'タスク', href: '/tasks', icon: CheckSquare },
  { name: 'ドメイン', href: '/domains', icon: Globe },
  { name: 'ドキュメント', href: '/documents', icon: FileText },
  { name: '財務管理', href: '/finance', icon: DollarSign },
  { name: 'カレンダー', href: '/calendar', icon: Calendar },
  { name: '設定', href: '/settings', icon: Settings },
]

export function MobileNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <>
      {/* ボトムナビゲーション */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-black md:hidden">
        <div className="flex justify-around items-center h-16">
          {mobileNavigation.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <button
                key={item.name}
                onClick={() => router.push(item.href)}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full px-2 transition-colors",
                  isActive ? "text-black" : "text-gray-400"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive && "mb-1")} />
                {isActive && (
                  <span className="text-xs font-medium">{item.name}</span>
                )}
              </button>
            )
          })}
          <button
            onClick={() => setMenuOpen(true)}
            className="flex flex-col items-center justify-center flex-1 h-full px-2 text-gray-400"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </nav>

      {/* フルスクリーンメニュー */}
      {menuOpen && (
        <div className="fixed inset-0 z-[100] bg-white md:hidden">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-black">
              <h2 className="text-xl font-bold">メニュー</h2>
              <button onClick={() => setMenuOpen(false)}>
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <nav className="px-4 py-2">
                {menuItems.map((item) => {
                  const isActive = pathname.startsWith(item.href)
                  return (
                    <button
                      key={item.name}
                      onClick={() => {
                        router.push(item.href)
                        setMenuOpen(false)
                      }}
                      className={cn(
                        "flex items-center gap-3 w-full px-3 py-3 text-left rounded-lg transition-colors",
                        isActive ? "bg-gray-100 text-black font-medium" : "text-gray-600"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </button>
                  )
                })}
              </nav>
            </div>
            
            <div className="border-t border-gray-200 p-4">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-3 py-3 text-left text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>ログアウト</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}