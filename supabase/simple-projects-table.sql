-- シンプルなprojectsテーブルの作成（既存のテーブルを削除して再作成）
-- 警告: これを実行すると既存のデータは削除されます

-- 既存のテーブルを削除（必要な場合のみコメントを外して実行）
-- DROP TABLE IF EXISTS public.projects CASCADE;

-- UUIDエクステンションを有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- シンプルなprojectsテーブルを作成
CREATE TABLE IF NOT EXISTS public.projects (
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

-- RLSを無効化（テスト環境用）
ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;

-- 更新時にupdated_atを自動更新する関数
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガーの作成
DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
CREATE TRIGGER update_projects_updated_at 
  BEFORE UPDATE ON public.projects
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at();

-- テストデータを挿入
INSERT INTO public.projects (name, description, client_name, status, priority, progress) 
VALUES 
  ('サンプルプロジェクト', 'これはテスト用のプロジェクトです', 'テスト企業', 'development', 'high', 30)
ON CONFLICT DO NOTHING;

-- 作成したテーブルを確認
SELECT * FROM public.projects;