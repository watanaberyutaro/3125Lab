'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, Search, X, Check, User, Settings, LogOut, ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { DropdownPortal } from '@/components/ui/dropdown-portal'

const notifications = [
  { id: '1', title: 'ドメイン更新期限', message: 'example.comの更新期限が3日後です', time: '2時間前', read: false, type: 'warning' },
  { id: '2', title: 'タスク完了', message: '「ユーザー認証の実装」が完了しました', time: '5時間前', read: true, type: 'success' },
  { id: '3', title: '新しいコメント', message: 'ECプラットフォームにコメントが追加されました', time: '1日前', read: true, type: 'info' },
]

export function Header() {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [notificationList, setNotificationList] = useState(notifications)
  const [userProfile, setUserProfile] = useState<any>(null)
  const router = useRouter()
  const userMenuRef = useRef<HTMLDivElement>(null)
  const notificationRef = useRef<HTMLDivElement>(null)
  
  const unreadCount = notificationList.filter(n => !n.read).length
  
  useEffect(() => {
    fetchUserProfile()
  }, [])
  
  useEffect(() => {
    // クリック外で閉じる
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  const fetchUserProfile = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (profile) {
        setUserProfile({
          ...profile,
          email: user.email
        })
      }
    }
  }
  
  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }
  
  const markAsRead = (id: string) => {
    setNotificationList(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
    // 通知をクリックしたらメニューを閉じる
    setShowNotifications(false)
    
    // 通知タイプに応じて遷移先を決定
    const notification = notificationList.find(n => n.id === id)
    if (notification) {
      // プロジェクト関連の通知ならプロジェクトページへ
      if (notification.message.includes('プラットフォーム')) {
        router.push('/projects')
      }
      // タスク関連の通知ならタスクページへ
      else if (notification.title.includes('タスク')) {
        router.push('/tasks')
      }
      // ドメイン関連の通知なら設定ページへ
      else if (notification.title.includes('ドメイン')) {
        router.push('/domains')
      }
    }
  }
  
  const markAllAsRead = () => {
    setNotificationList(prev => 
      prev.map(n => ({ ...n, read: true }))
    )
  }
  
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-gray-50 text-gray-700'
      case 'success': return 'bg-gray-100 text-gray-800'
      case 'error': return 'bg-gray-100 text-gray-900'
      default: return 'bg-gray-50 text-black'
    }
  }

  return (
    <header className="h-16 bg-white/95 backdrop-blur-sm border-b border-black">
      <div className="flex h-full items-center justify-between px-3 md:px-6">
        <div className="flex items-center gap-2 md:hidden">
          <h1 className="text-lg font-bold">3125Lab</h1>
        </div>
        <div className="hidden md:flex items-center flex-1 max-w-xl">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder="プロジェクト、クライアント、タスクを検索..."
              className="pl-10 w-full"
            />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative" ref={notificationRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-600 hover:text-gray-900"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 bg-gray-900 rounded-full"></span>
              )}
            </button>
            
            <DropdownPortal targetRef={notificationRef} isOpen={showNotifications}>
              <Card className="w-80 shadow-lg">
                <div className="p-4 border-b border-black">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">通知</h3>
                    <div className="flex gap-2">
                      {unreadCount > 0 && (
                        <button 
                          onClick={markAllAsRead}
                          className="text-xs text-black hover:text-gray-700"
                        >
                          すべて既読にする
                        </button>
                      )}
                      <button 
                        onClick={() => setShowNotifications(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notificationList.length === 0 ? (
                    <p className="p-4 text-center text-gray-500 text-sm">通知はありません</p>
                  ) : (
                    <div className="divide-y">
                      {notificationList.map((notification) => (
                        <div 
                          key={notification.id}
                          className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.read ? 'bg-gray-50' : ''}`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className={`text-xs px-2 py-0.5 rounded ${getNotificationColor(notification.type)}`}>
                                  {notification.type === 'warning' ? '警告' : notification.type === 'success' ? '完了' : '情報'}
                                </span>
                                <p className="text-sm font-medium">{notification.title}</p>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                              <p className="text-xs text-gray-400 mt-2">{notification.time}</p>
                            </div>
                            {notification.read && (
                              <Check className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </DropdownPortal>
          </div>
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center hover:bg-gray-400 transition-colors"
            >
              {userProfile ? (
                userProfile.avatar_url ? (
                  <img 
                    src={userProfile.avatar_url} 
                    alt={userProfile.full_name || userProfile.username || 'User'}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-medium text-gray-700">
                    {(userProfile.full_name || userProfile.username || userProfile.email || 'U')[0].toUpperCase()}
                  </span>
                )
              ) : (
                <User className="h-4 w-4 text-gray-600" />
              )}
            </button>
            
            <DropdownPortal targetRef={userMenuRef} isOpen={showUserMenu}>
              <Card className="w-48 shadow-lg">
                <div className="py-1">
                  {userProfile && (
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-medium truncate">{userProfile.full_name || userProfile.username || 'ユーザー'}</p>
                      <p className="text-xs text-gray-500 truncate">{userProfile.email}</p>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setShowUserMenu(false)
                      router.push('/settings')
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 transition-colors w-full text-left"
                  >
                    <Settings className="h-4 w-4" />
                    設定
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 transition-colors w-full text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    ログアウト
                  </button>
                </div>
              </Card>
            </DropdownPortal>
          </div>
        </div>
      </div>
    </header>
  )
}