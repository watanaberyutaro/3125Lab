-- テストデータを挿入するSQL
-- Supabaseで実行してプロジェクトが正しく表示されるか確認

INSERT INTO public.projects (
  name,
  description,
  client_name,
  status,
  priority,
  start_date,
  end_date,
  production_url,
  progress
) VALUES 
(
  'テストプロジェクト1',
  'これはテスト用のプロジェクトです',
  'テスト株式会社',
  'development',
  'high',
  '2025-01-01',
  '2025-12-31',
  'https://test.example.com',
  50
),
(
  'サンプルWebサイト',
  'サンプル企業のコーポレートサイト',
  'サンプル企業',
  'production',
  'medium',
  '2024-06-01',
  '2024-12-31',
  'https://sample.example.com',
  100
),
(
  '新規ECサイト',
  'ECサイトの構築プロジェクト',
  'ECショップ株式会社',
  'planning',
  'urgent',
  '2025-02-01',
  '2025-06-30',
  null,
  10
);

-- 挿入されたデータを確認
SELECT * FROM public.projects ORDER BY created_at DESC;