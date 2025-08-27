-- 別の解決方法: RLSを有効にしたまま、すべてのアクセスを許可するポリシーを作成

-- Option 1: RLSを無効化する（推奨 - テスト環境）
ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;

-- Option 2: RLSを有効にしたまま、フルアクセスポリシーを作成（代替案）
-- RLSを有効化
-- ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- すべての既存ポリシーを削除
-- DROP POLICY IF EXISTS "Allow all" ON public.projects;
-- DROP POLICY IF EXISTS "Enable read access for all users" ON public.projects;
-- DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.projects;
-- DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.projects;
-- DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.projects;

-- すべての操作を全員に許可する新しいポリシー
-- CREATE POLICY "Allow all" ON public.projects
--   FOR ALL 
--   USING (true)
--   WITH CHECK (true);

-- テスト: 挿入を試みる
INSERT INTO public.projects (
    name,
    description,
    status,
    priority,
    progress
) VALUES (
    'テストプロジェクト_' || TO_CHAR(NOW(), 'YYYYMMDD_HH24MISS'),
    'このプロジェクトが挿入できれば成功',
    'planning',
    'medium',
    0
) RETURNING *;

-- 結果を確認
SELECT COUNT(*) as プロジェクト数 FROM public.projects;
SELECT * FROM public.projects ORDER BY created_at DESC LIMIT 3;