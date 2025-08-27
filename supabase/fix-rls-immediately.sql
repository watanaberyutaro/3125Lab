-- RLSを完全に無効化する（即座に実行してください）

-- 1. projectsテーブルのRLSを無効化
ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;

-- 2. 念のため、すべての既存ポリシーを削除
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'projects' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.projects', pol.policyname);
    END LOOP;
END $$;

-- 3. 確認: RLSが無効になっているかチェック
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM 
    pg_tables
WHERE 
    schemaname = 'public' 
    AND tablename = 'projects';

-- 4. テスト: データを挿入してみる
INSERT INTO public.projects (
    name, 
    description, 
    client_name, 
    status, 
    priority, 
    progress
) VALUES (
    'RLSテストプロジェクト',
    'RLSが無効化されているか確認',
    'テスト会社',
    'planning',
    'medium',
    0
);

-- 5. 挿入されたデータを確認
SELECT * FROM public.projects WHERE name = 'RLSテストプロジェクト';