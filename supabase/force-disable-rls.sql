-- スーパーユーザー権限で実行する必要があります

-- 1. すべてのポリシーを強制削除
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'projects' AND schemaname = 'public')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.projects CASCADE';
    END LOOP;
END $$;

-- 2. RLSを強制的に無効化
DO $$ 
BEGIN
    EXECUTE 'ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'RLS無効化エラー: %', SQLERRM;
END $$;

-- 3. publicスキーマに対する権限を付与
GRANT ALL ON SCHEMA public TO anon;
GRANT ALL ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 4. projectsテーブルに対する明示的な権限付与
GRANT ALL ON public.projects TO anon;
GRANT ALL ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;

-- 5. 確認
SELECT 
    n.nspname as スキーマ,
    c.relname as テーブル,
    c.relrowsecurity as RLS有効,
    CASE 
        WHEN c.relrowsecurity THEN '❌ 有効（問題あり）' 
        ELSE '✅ 無効（OK）' 
    END as 状態
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relname = 'projects';