-- 最終的な修正: clients_v2テーブルを完全にクリーンアップ

-- 1. すべてのトリガーを削除
DROP TRIGGER IF EXISTS update_clients_v2_updated_at ON public.clients_v2 CASCADE;
DROP TRIGGER IF EXISTS handle_clients_v2_insert ON public.clients_v2 CASCADE;
DROP TRIGGER IF EXISTS handle_clients_v2_update ON public.clients_v2 CASCADE;
DROP TRIGGER IF EXISTS clients_v2_before_insert ON public.clients_v2 CASCADE;
DROP TRIGGER IF EXISTS clients_v2_before_update ON public.clients_v2 CASCADE;

-- 2. すべてのトリガー関数を削除
DROP FUNCTION IF EXISTS update_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_simple() CASCADE;
DROP FUNCTION IF EXISTS simple_update_updated_at() CASCADE;
DROP FUNCTION IF EXISTS handle_clients_v2_changes() CASCADE;

-- 3. RLSを無効化
ALTER TABLE public.clients_v2 DISABLE ROW LEVEL SECURITY;

-- 4. すべてのポリシーを削除
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.clients_v2;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.clients_v2;
DROP POLICY IF EXISTS "Enable select for authenticated users" ON public.clients_v2;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.clients_v2;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.clients_v2;

-- 5. statusカラムが存在する場合は削除
ALTER TABLE public.clients_v2 DROP COLUMN IF EXISTS status;

-- 6. 新しいシンプルなトリガー関数を作成
CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. 新しいトリガーを作成
CREATE TRIGGER update_clients_v2_modified 
BEFORE UPDATE ON public.clients_v2 
FOR EACH ROW 
EXECUTE FUNCTION public.update_modified_column();

-- 8. 権限を再設定
GRANT ALL ON public.clients_v2 TO anon;
GRANT ALL ON public.clients_v2 TO authenticated;
GRANT ALL ON public.clients_v2 TO service_role;

-- 9. テーブルの構造を確認
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'clients_v2'
ORDER BY ordinal_position;

-- 10. トリガーの確認（何もないはず）
SELECT trigger_name 
FROM information_schema.triggers 
WHERE event_object_table = 'clients_v2';