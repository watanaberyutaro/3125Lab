'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Database,
  Check,
  X,
  Camera,
  Upload,
  Mail
} from 'lucide-react'
import Image from 'next/image'
import { createClient as createSupabaseClient } from '@/lib/supabase/client'

const tabs = [
  { id: 'profile', label: 'プロフィール', icon: User },
  { id: 'notifications', label: '通知設定', icon: Bell },
  { id: 'security', label: 'セキュリティ', icon: Shield },
  { id: 'appearance', label: '外観', icon: Palette },
  { id: 'data', label: 'データ管理', icon: Database },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    phone: '',
    company: '',
    department: '',
    role: '',
    location: '',
    bio: '',
    avatar_url: null as string | null
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    taskDeadlines: true,
    projectUpdates: true,
    clientMessages: true,
    weeklyReports: false,
    marketingEmails: false,
  })

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: true,
    loginAlerts: true,
    sessionTimeout: '30',
    passwordChanged: '2024-07-15'
  })

  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'light',
    language: 'ja',
    dateFormat: 'YYYY-MM-DD',
    timezone: 'Asia/Tokyo'
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const supabase = createSupabaseClient()
      
      // 現在のユーザーを取得
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        // ユーザーが未認証の場合は正常な動作として処理
        console.log('User not authenticated - login required')
        setLoading(false)
        return
      }
      
      setUserId(user.id)
      
      // プロフィール情報を取得
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (profile) {
        setProfileData({
          full_name: profile.full_name || '',
          email: profile.email || user.email || '',
          phone: profile.phone || '',
          company: profile.company || '',
          department: profile.department || '',
          role: profile.role || '',
          location: profile.location || '',
          bio: profile.bio || '',
          avatar_url: profile.avatar_url || null
        })
      } else {
        // プロフィールが存在しない場合、作成
        await createProfile(user.id, user.email)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const createProfile = async (userId: string, email: string | undefined) => {
    const supabase = createSupabaseClient()
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([
          {
            id: userId,
            email: email || '',
            full_name: email?.split('@')[0] || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single()
      
      if (error) {
        console.error('Error creating profile:', error)
        // プロフィールが既に存在する場合はエラーを無視
        if (error.code !== '23505') {
          throw error
        }
      } else if (data) {
        setProfileData({
          full_name: data.full_name || '',
          email: data.email || email || '',
          phone: data.phone || '',
          company: data.company || '',
          department: data.department || '',
          role: data.role || '',
          location: data.location || '',
          bio: data.bio || '',
          avatar_url: data.avatar_url || null
        })
      }
    } catch (error) {
      console.error('Error in createProfile:', error)
    }
  }

  const handleProfileUpdate = async () => {
    if (!userId) {
      alert('ユーザー情報が取得できません。ログインしてください。')
      return
    }
    
    setSaving(true)
    try {
      const supabase = createSupabaseClient()
      
      // 環境変数の確認
      console.log('Supabase URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
      console.log('Supabase Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
      
      console.log('Updating profile for user:', userId)
      console.log('Profile data:', profileData)
      
      // まず既存のプロフィールがあるか確認
      const checkResult = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()
      
      console.log('Check profile result:', checkResult)
      const { data: existingProfile, error: checkError } = checkResult
      
      if (checkError) {
        console.error('Error checking existing profile:', checkError)
      }
      
      if (existingProfile) {
        // 既存プロフィールを更新
        console.log('Updating existing profile...')
        const updateData = {
          full_name: profileData.full_name || '',
          email: profileData.email || '',
          phone: profileData.phone || null,
          company: profileData.company || null,
          department: profileData.department || null,
          role: profileData.role || null,
          location: profileData.location || null,
          bio: profileData.bio || null,
          avatar_url: profileData.avatar_url || null,
          updated_at: new Date().toISOString()
        }
        console.log('Update data:', updateData)
        
        const result = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', userId)
          .select()
          .single()
        
        console.log('Update result:', JSON.stringify(result, null, 2))
        console.log('Result keys:', Object.keys(result || {}))
        console.log('Result data:', result?.data)
        console.log('Result error:', result?.error)
        const { data, error } = result
        
        if (error) {
          console.error('Raw error object:', error)
          console.error('Error code:', error['code'])
          console.error('Error message:', error['message'])
          console.error('Error details:', error['details'])
          console.error('Error hint:', error['hint'])
          
          // エラーを文字列化してみる
          let errorMessage = 'Unknown error'
          try {
            errorMessage = JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
          } catch (e) {
            errorMessage = String(error)
          }
          console.error('Full error:', errorMessage)
          
          alert(`プロフィールの更新に失敗しました: ${error['message'] || errorMessage}`)
        } else {
          console.log('Profile updated successfully:', data)
          alert('プロフィールを更新しました')
          // データを再取得して最新状態にする
          await fetchProfile()
        }
      } else {
        // 新規プロフィールを作成
        console.log('Creating new profile...')
        const insertData = {
          id: userId,
          full_name: profileData.full_name || '',
          email: profileData.email || '',
          phone: profileData.phone || null,
          company: profileData.company || null,
          department: profileData.department || null,
          role: profileData.role || null,
          location: profileData.location || null,
          bio: profileData.bio || null,
          avatar_url: profileData.avatar_url || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        console.log('Insert data:', insertData)
        
        const result = await supabase
          .from('profiles')
          .insert([insertData])
          .select()
          .single()
        
        console.log('Insert result:', result)
        const { data, error } = result
        
        if (error) {
          console.error('Raw error object:', error)
          console.error('Error code:', error['code'])
          console.error('Error message:', error['message'])
          console.error('Error details:', error['details'])
          console.error('Error hint:', error['hint'])
          
          // エラーを文字列化してみる
          let errorMessage = 'Unknown error'
          try {
            errorMessage = JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
          } catch (e) {
            errorMessage = String(error)
          }
          console.error('Full error:', errorMessage)
          
          alert(`プロフィールの作成に失敗しました: ${error['message'] || errorMessage}`)
        } else {
          console.log('Profile created successfully:', data)
          alert('プロフィールを作成しました')
          // データを再取得して最新状態にする
          await fetchProfile()
        }
      }
    } catch (error) {
      console.error('Error:', error)
      alert('エラーが発生しました')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileData({...profileData, avatar_url: reader.result as string})
      }
      reader.readAsDataURL(file)
    }
  }

  const handleNotificationUpdate = () => {
    // 通知設定更新処理
    console.log('Notifications updated:', notificationSettings)
  }

  const handleSecurityUpdate = () => {
    // セキュリティ設定更新処理
    console.log('Security updated:', securitySettings)
  }

  const handleAppearanceUpdate = () => {
    // 外観設定更新処理
    console.log('Appearance updated:', appearanceSettings)
  }

  const renderProfileTab = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">プロフィールを読み込み中...</div>
        </div>
      )
    }

    return (
    <div className="space-y-6">
      {/* アバターセクション */}
      <div className="flex items-center space-x-6">
        <div className="relative">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
            {profileData.avatar_url ? (
              <Image src={profileData.avatar_url} alt="Avatar" className="w-full h-full object-cover" width={96} height={96} />
            ) : (
              <User className="h-12 w-12 text-gray-400" />
            )}
          </div>
          <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-white border border-black rounded-full p-1.5 cursor-pointer hover:bg-gray-50">
            <Camera className="h-4 w-4" />
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </label>
        </div>
        <div>
          <h3 className="font-semibold text-lg">プロフィール画像</h3>
          <p className="text-sm text-gray-600">JPG、PNG、GIF形式（最大5MB）</p>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" size="sm" onClick={() => document.getElementById('avatar-upload')?.click()}>
              <Upload className="h-4 w-4 mr-1" />
              アップロード
            </Button>
            {profileData.avatar_url && (
              <Button variant="outline" size="sm" onClick={() => setProfileData({...profileData, avatar_url: null})}>
                削除
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="full_name">氏名</Label>
            <Input
              id="full_name"
              value={profileData.full_name}
              onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
              className="mt-1"
              placeholder="例: 山田太郎"
            />
          </div>
          <div>
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({...profileData, email: e.target.value})}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="phone">電話番号</Label>
            <Input
              id="phone"
              value={profileData.phone}
              onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="company">会社名</Label>
            <Input
              id="company"
              value={profileData.company}
              onChange={(e) => setProfileData({...profileData, company: e.target.value})}
              className="mt-1"
            />
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="department">部署</Label>
            <Input
              id="department"
              value={profileData.department}
              onChange={(e) => setProfileData({...profileData, department: e.target.value})}
              className="mt-1"
              placeholder="例: 開発部"
            />
          </div>
          <div>
            <Label htmlFor="role">役職</Label>
            <Input
              id="role"
              value={profileData.role}
              onChange={(e) => setProfileData({...profileData, role: e.target.value})}
              className="mt-1"
              placeholder="例: manager, developer, designer"
            />
          </div>
          <div>
            <Label htmlFor="location">所在地</Label>
            <Input
              id="location"
              value={profileData.location}
              onChange={(e) => setProfileData({...profileData, location: e.target.value})}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="bio">自己紹介</Label>
            <textarea
              id="bio"
              value={profileData.bio}
              onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
              className="mt-1 w-full p-3 border border-black rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              rows={4}
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <Button 
          onClick={handleProfileUpdate} 
          className="bg-gray-900 hover:bg-gray-700"
          disabled={saving || loading}
        >
          {saving ? '保存中...' : 'プロフィールを更新'}
        </Button>
      </div>
    </div>
    )
  }

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">通知方法</h3>
        <div className="space-y-3">
          {[
            { key: 'emailNotifications', label: 'メール通知', icon: Mail },
            { key: 'pushNotifications', label: 'プッシュ通知', icon: Bell },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-3 border border-black rounded-lg">
              <div className="flex items-center space-x-3">
                <item.icon className="h-5 w-5 text-gray-600" />
                <span>{item.label}</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={notificationSettings[item.key as keyof typeof notificationSettings] as boolean}
                  onChange={(e) => setNotificationSettings({
                    ...notificationSettings,
                    [item.key]: e.target.checked
                  })}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-black after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">通知内容</h3>
        <div className="space-y-3">
          {[
            { key: 'taskDeadlines', label: 'タスクの期限通知' },
            { key: 'projectUpdates', label: 'プロジェクトの更新通知' },
            { key: 'clientMessages', label: 'クライアントからのメッセージ' },
            { key: 'weeklyReports', label: '週次レポート' },
            { key: 'marketingEmails', label: 'マーケティングメール' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-3 border border-black rounded-lg">
              <span>{item.label}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={notificationSettings[item.key as keyof typeof notificationSettings] as boolean}
                  onChange={(e) => setNotificationSettings({
                    ...notificationSettings,
                    [item.key]: e.target.checked
                  })}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-black after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleNotificationUpdate} className="bg-gray-900 hover:bg-gray-700">
          通知設定を更新
        </Button>
      </div>
    </div>
  )

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">認証設定</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border border-black rounded-lg">
            <div>
              <div className="font-medium">二段階認証</div>
              <div className="text-sm text-gray-600">ログイン時の追加セキュリティ</div>
            </div>
            <div className="flex items-center space-x-2">
              {securitySettings.twoFactorEnabled ? (
                <span className="text-gray-800 text-sm flex items-center">
                  <Check className="h-4 w-4 mr-1" />
                  有効
                </span>
              ) : (
                <span className="text-gray-900 text-sm flex items-center">
                  <X className="h-4 w-4 mr-1" />
                  無効
                </span>
              )}
              <Button variant="outline" size="sm">
                {securitySettings.twoFactorEnabled ? '無効化' : '有効化'}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 border border-black rounded-lg">
            <div>
              <div className="font-medium">ログインアラート</div>
              <div className="text-sm text-gray-600">不審なログイン時にメール通知</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={securitySettings.loginAlerts}
                onChange={(e) => setSecuritySettings({
                  ...securitySettings,
                  loginAlerts: e.target.checked
                })}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-black after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">セッション管理</h3>
        <div className="space-y-3">
          <div>
            <Label htmlFor="sessionTimeout">セッションタイムアウト（分）</Label>
            <select
              id="sessionTimeout"
              value={securitySettings.sessionTimeout}
              onChange={(e) => setSecuritySettings({
                ...securitySettings,
                sessionTimeout: e.target.value
              })}
              className="mt-1 block w-full p-2 border border-black rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
            >
              <option value="15">15分</option>
              <option value="30">30分</option>
              <option value="60">1時間</option>
              <option value="120">2時間</option>
              <option value="480">8時間</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">パスワード</h3>
        <div className="p-3 border border-black rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">パスワード</div>
              <div className="text-sm text-gray-600">
                最終更新: {new Date(securitySettings.passwordChanged).toLocaleDateString('ja-JP')}
              </div>
            </div>
            <Button variant="outline" size="sm">
              パスワードを変更
            </Button>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSecurityUpdate} className="bg-gray-900 hover:bg-gray-700">
          セキュリティ設定を更新
        </Button>
      </div>
    </div>
  )

  const renderAppearanceTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="theme">テーマ</Label>
          <select
            id="theme"
            value={appearanceSettings.theme}
            onChange={(e) => setAppearanceSettings({
              ...appearanceSettings,
              theme: e.target.value
            })}
            className="mt-1 block w-full p-2 border border-black rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="light">ライト</option>
            <option value="dark">ダーク</option>
            <option value="system">システム設定に従う</option>
          </select>
        </div>

        <div>
          <Label htmlFor="language">言語</Label>
          <select
            id="language"
            value={appearanceSettings.language}
            onChange={(e) => setAppearanceSettings({
              ...appearanceSettings,
              language: e.target.value
            })}
            className="mt-1 block w-full p-2 border border-black rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ja">日本語</option>
            <option value="en">English</option>
          </select>
        </div>

        <div>
          <Label htmlFor="dateFormat">日付形式</Label>
          <select
            id="dateFormat"
            value={appearanceSettings.dateFormat}
            onChange={(e) => setAppearanceSettings({
              ...appearanceSettings,
              dateFormat: e.target.value
            })}
            className="mt-1 block w-full p-2 border border-black rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
          </select>
        </div>

        <div>
          <Label htmlFor="timezone">タイムゾーン</Label>
          <select
            id="timezone"
            value={appearanceSettings.timezone}
            onChange={(e) => setAppearanceSettings({
              ...appearanceSettings,
              timezone: e.target.value
            })}
            className="mt-1 block w-full p-2 border border-black rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Asia/Tokyo">Asia/Tokyo</option>
            <option value="America/New_York">America/New_York</option>
            <option value="Europe/London">Europe/London</option>
            <option value="UTC">UTC</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleAppearanceUpdate} className="bg-gray-900 hover:bg-gray-700">
          外観設定を更新
        </Button>
      </div>
    </div>
  )

  const renderDataTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">データのエクスポート</h3>
        <div className="space-y-3">
          <div className="p-4 border border-black rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">プロジェクトデータ</div>
                <div className="text-sm text-gray-600">すべてのプロジェクト情報をJSONまたはCSV形式でエクスポート</div>
              </div>
              <Button variant="outline">エクスポート</Button>
            </div>
          </div>
          
          <div className="p-4 border border-black rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">クライアントデータ</div>
                <div className="text-sm text-gray-600">クライアント情報と連絡履歴をエクスポート</div>
              </div>
              <Button variant="outline">エクスポート</Button>
            </div>
          </div>

          <div className="p-4 border border-black rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">タスクデータ</div>
                <div className="text-sm text-gray-600">すべてのタスクと完了履歴をエクスポート</div>
              </div>
              <Button variant="outline">エクスポート</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">データの削除</h3>
        <div className="p-4 border border-black rounded-lg bg-gray-50">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">すべてのデータを削除</div>
                <div className="text-sm text-gray-600">この操作は取り消すことができません。事前にデータをバックアップしてください。</div>
              </div>
              <Button variant="outline" className="border-black text-gray-700 hover:bg-gray-100">
                削除
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab()
      case 'notifications':
        return renderNotificationsTab()
      case 'security':
        return renderSecurityTab()
      case 'appearance':
        return renderAppearanceTab()
      case 'data':
        return renderDataTab()
      default:
        return renderProfileTab()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">設定</h1>
        <p className="text-gray-600 mt-1">アカウントとアプリケーションの設定を管理</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">設定メニュー</CardTitle>
          </CardHeader>
          <CardContent>
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors
                      ${activeTab === tab.id 
                        ? 'bg-gray-50 text-black border-black' 
                        : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </CardContent>
        </Card>

        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {(() => {
                  const currentTab = tabs.find(tab => tab.id === activeTab)
                  const Icon = currentTab?.icon || User
                  return (
                    <>
                      <Icon className="mr-2 h-5 w-5" />
                      {currentTab?.label}
                    </>
                  )
                })()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderTabContent()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}