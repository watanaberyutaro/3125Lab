'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestSupabasePage() {
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    
    try {
      const supabase = createClient()
      
      // 1. 接続テスト
      const { error: testError } = await supabase
        .from('projects')
        .select('count')
        .single()
      
      if (testError) {
        setError(`接続エラー: ${testError.message}`)
        return
      }
      
      // 2. データ取得テスト
      const { data: projects, error: fetchError } = await supabase
        .from('projects')
        .select('*')
        .limit(5)
      
      if (fetchError) {
        setError(`データ取得エラー: ${fetchError.message}`)
        return
      }
      
      // 3. 挿入テスト
      const testProject = {
        name: `テストプロジェクト ${Date.now()}`,
        description: 'Supabase接続テスト',
        client_name: 'テスト企業',
        status: 'planning',
        priority: 'low',
        progress: 0
      }
      
      const { data: insertedData, error: insertError } = await supabase
        .from('projects')
        .insert([testProject])
        .select()
        .single()
      
      if (insertError) {
        setError(`挿入エラー: ${insertError.message}\n詳細: ${JSON.stringify(insertError)}`)
        return
      }
      
      setResult({
        connection: '成功',
        projectsCount: projects?.length || 0,
        projects: projects,
        inserted: insertedData
      })
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      setError(`エラー: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const checkAuth = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    
    try {
      const supabase = createClient()
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        setError(`認証エラー: ${error.message}`)
        return
      }
      
      setResult({
        authenticated: !!user,
        user: user
      })
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      setError(`エラー: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Supabase接続テスト</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>接続状態の確認</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={testConnection} disabled={loading}>
              {loading ? '実行中...' : 'データベース接続テスト'}
            </Button>
            <Button onClick={checkAuth} disabled={loading} variant="outline">
              {loading ? '確認中...' : '認証状態確認'}
            </Button>
          </div>
          
          {error && (
            <div className="p-4 bg-gray-50 text-gray-900 rounded whitespace-pre-wrap">
              <strong>エラー:</strong><br />
              {error}
            </div>
          )}
          
          {result && (
            <div className="p-4 bg-gray-100 text-gray-800 rounded">
              <strong>結果:</strong>
              <pre className="mt-2 text-sm">{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
          
          <div className="text-sm text-gray-600">
            <p>環境変数:</p>
            <ul className="list-disc list-inside ml-4">
              <li>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ 設定済み' : '✗ 未設定'}</li>
              <li>NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ 設定済み' : '✗ 未設定'}</li>
            </ul>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>トラブルシューティング</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>1. Supabase SQL Editorで以下を実行してRLSを無効化:</p>
          <pre className="p-2 bg-gray-100 rounded overflow-x-auto">
            ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;
          </pre>
          
          <p>2. projectsテーブルが存在することを確認:</p>
          <pre className="p-2 bg-gray-100 rounded overflow-x-auto">
            SELECT * FROM public.projects LIMIT 1;
          </pre>
          
          <p>3. 必要なカラムが存在することを確認:</p>
          <pre className="p-2 bg-gray-100 rounded overflow-x-auto">
{`SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'projects';`}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}