import { createClient as createSupabaseClient } from '@/lib/supabase/client'

export interface AuthUser {
  id: string
  email?: string
  user_metadata?: {
    name?: string
    full_name?: string
    avatar_url?: string
  }
  created_at?: string
  last_sign_in_at?: string
}

// Supabase Authからユーザー一覧を取得
export async function getAuthUsers() {
  const supabase = createSupabaseClient()
  
  try {
    // auth.users テーブルから取得（Admin APIが必要）
    // 代替案：profilesテーブルを使用
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name', { ascending: true })
    
    if (error) {
      console.error('Error fetching profiles:', error)
      // profilesテーブルがない場合は空配列を返す
      return []
    }
    
    return profiles || []
  } catch (error) {
    console.error('Error fetching auth users:', error)
    return []
  }
}

// 現在のユーザー情報を取得
export async function getCurrentUser() {
  const supabase = createSupabaseClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }
  
  // プロファイル情報も取得
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  return {
    ...user,
    profile
  }
}

// profilesテーブルと連携したユーザー管理
export async function createProfile(userId: string, profileData: any) {
  const supabase = createSupabaseClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .upsert([
      {
        id: userId,
        ...profileData,
        updated_at: new Date().toISOString()
      }
    ])
    .select()
    .single()
  
  if (error) {
    console.error('Error creating/updating profile:', error)
    throw error
  }
  
  return data
}