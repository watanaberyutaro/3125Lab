-- 新しいテーブルを作成（RLSなし）
-- 既存のprojectsテーブルに問題がある場合の代替案

-- 1. 新しいテーブルを作成（別の名前）
CREATE TABLE IF NOT EXISTS public.projects_v2 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  client_name TEXT,
  status TEXT DEFAULT 'planning',
  priority TEXT DEFAULT 'medium',
  start_date DATE,
  end_date DATE,
  production_url TEXT,
  staging_url TEXT,
  development_url TEXT,
  repository_url TEXT,
  progress INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. RLSは最初から無効にしておく
ALTER TABLE public.projects_v2 DISABLE ROW LEVEL SECURITY;

-- 3. 全権限を付与
GRANT ALL ON public.projects_v2 TO anon;
GRANT ALL ON public.projects_v2 TO authenticated;
GRANT ALL ON public.projects_v2 TO service_role;

-- 4. トリガーを設定
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_projects_v2_updated_at ON public.projects_v2;
CREATE TRIGGER update_projects_v2_updated_at 
  BEFORE UPDATE ON public.projects_v2
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at();

-- 5. テストデータを挿入
INSERT INTO public.projects_v2 (name, description, status, priority) 
VALUES 
  ('新テーブルテスト', 'projects_v2テーブルのテスト', 'planning', 'medium'),
  ('サンプルプロジェクト', 'これは動作確認用です', 'development', 'high');

-- 6. 確認
SELECT * FROM public.projects_v2;