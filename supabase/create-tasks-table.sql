-- tasks_v2テーブルを作成（RLSなし）
CREATE TABLE IF NOT EXISTS public.tasks_v2 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects_v2(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'completed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('urgent', 'high', 'medium', 'low')),
  due_date DATE,
  assignee TEXT, -- 担当者名
  assignee_email TEXT, -- 担当者メール
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  tags TEXT[] DEFAULT '{}',
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100)
);

-- RLSを無効化
ALTER TABLE public.tasks_v2 DISABLE ROW LEVEL SECURITY;

-- 権限を付与
GRANT ALL ON public.tasks_v2 TO anon;
GRANT ALL ON public.tasks_v2 TO authenticated;
GRANT ALL ON public.tasks_v2 TO service_role;

-- updated_atのトリガーを設定
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  -- ステータスがcompletedになった時にcompleted_atを設定
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = now();
  END IF;
  -- ステータスがcompletedから変更された時にcompleted_atをクリア
  IF NEW.status != 'completed' AND OLD.status = 'completed' THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_tasks_v2_updated_at ON public.tasks_v2;
CREATE TRIGGER update_tasks_v2_updated_at 
  BEFORE UPDATE ON public.tasks_v2
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at();

-- インデックスを作成（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_tasks_v2_project_id ON public.tasks_v2(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_v2_status ON public.tasks_v2(status);
CREATE INDEX IF NOT EXISTS idx_tasks_v2_due_date ON public.tasks_v2(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_v2_assignee_email ON public.tasks_v2(assignee_email);

-- テストデータを挿入（オプション）
-- 注意: projects_v2テーブルにプロジェクトが存在する必要があります
/*
INSERT INTO public.tasks_v2 (
  project_id,
  title, 
  description, 
  status, 
  priority, 
  due_date,
  assignee,
  assignee_email,
  progress
) VALUES 
  (
    (SELECT id FROM public.projects_v2 LIMIT 1),
    'ユーザー認証の実装', 
    'ログイン・ログアウト機能を実装する', 
    'in_progress', 
    'high', 
    CURRENT_DATE + INTERVAL '7 days',
    '山田太郎',
    'yamada@example.com',
    50
  ),
  (
    (SELECT id FROM public.projects_v2 LIMIT 1),
    'データベース設計', 
    'ER図を作成してテーブル構造を決定する', 
    'completed', 
    'urgent', 
    CURRENT_DATE + INTERVAL '3 days',
    '佐藤花子',
    'sato@example.com',
    100
  );
*/

-- 確認
SELECT COUNT(*) as total_tasks FROM public.tasks_v2;