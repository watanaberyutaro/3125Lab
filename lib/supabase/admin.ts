import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Service Role Keyを使用（RLSをバイパス）
// 注意: これはサーバーサイドでのみ使用してください。クライアントサイドで使用しないでください。
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  // Service Role Keyが設定されていない場合は、通常のanon keyを使用
  const supabaseKey = supabaseServiceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}