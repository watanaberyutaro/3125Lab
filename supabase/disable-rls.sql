-- RLS（Row Level Security）を一時的に無効にしてテスト
-- 本番環境では適切なRLSポリシーを設定してください

-- projectsテーブルのRLSを無効にする
ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;

-- または、すべてのユーザーに対してフルアクセスを許可するポリシーを作成
-- ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Enable read access for all users" ON public.projects;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.projects;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.projects;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.projects;
DROP POLICY IF EXISTS "Enable all operations for all users" ON public.projects;

-- すべての操作を許可する新しいポリシー（テスト用）
-- CREATE POLICY "Enable all operations for all users" ON public.projects
--   FOR ALL USING (true) WITH CHECK (true);

-- テストが完了したら、以下を実行して適切なセキュリティを設定
-- ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
-- そして適切なポリシーを作成してください