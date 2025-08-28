-- clients_v2テーブルの問題を調査・修正するSQL

-- 1. clients_v2のトリガーを確認
SELECT 
    tg.trigger_name,
    tg.event_manipulation,
    tg.action_statement,
    pg_get_functiondef(p.oid) as function_definition
FROM 
    information_schema.triggers tg
    LEFT JOIN pg_proc p ON p.proname = tg.action_statement
WHERE 
    tg.event_object_table = 'clients_v2';

-- 2. clients_v2のRLSポリシーを確認
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM 
    pg_policies
WHERE 
    tablename = 'clients_v2';

-- 3. clients_v2のカラムを確認
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM 
    information_schema.columns
WHERE 
    table_name = 'clients_v2'
ORDER BY 
    ordinal_position;

-- 4. 問題のあるトリガーやポリシーを削除（必要に応じて実行）
-- 例: DROP TRIGGER IF EXISTS [trigger_name] ON public.clients_v2;
-- 例: DROP POLICY IF EXISTS [policy_name] ON public.clients_v2;

-- 5. シンプルなupdated_atトリガーのみ再作成
DROP TRIGGER IF EXISTS update_clients_v2_updated_at ON public.clients_v2;

CREATE OR REPLACE FUNCTION update_updated_at_simple()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clients_v2_updated_at 
  BEFORE UPDATE ON public.clients_v2
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_simple();

-- 6. 権限を再設定
GRANT ALL ON public.clients_v2 TO anon;
GRANT ALL ON public.clients_v2 TO authenticated;
GRANT ALL ON public.clients_v2 TO service_role;

-- 7. RLSを無効化（念のため）
ALTER TABLE public.clients_v2 DISABLE ROW LEVEL SECURITY;

-- 8. 使用していないテーブルを削除
-- DROP TABLE IF EXISTS public.projects CASCADE;
-- DROP TABLE IF EXISTS public.tasks CASCADE;
-- DROP TABLE IF EXISTS public.users CASCADE;
-- DROP TABLE IF EXISTS public.clients CASCADE;
-- DROP TABLE IF EXISTS public.clients_v3 CASCADE;  -- clients_v2を修正後に削除