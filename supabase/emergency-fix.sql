-- 緊急修正: clients_v2テーブルのすべてのトリガーを削除

-- 1. 現在のトリガーをすべて表示（確認用）
SELECT trigger_name FROM information_schema.triggers WHERE event_object_table = 'clients_v2';

-- 2. すべてのトリガーを削除
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    FOR trigger_record IN 
        SELECT trigger_name 
        FROM information_schema.triggers 
        WHERE event_object_table = 'clients_v2'
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || trigger_record.trigger_name || ' ON public.clients_v2';
    END LOOP;
END $$;

-- 3. シンプルなupdated_atトリガーのみ再作成
CREATE OR REPLACE FUNCTION simple_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clients_v2_updated_at
BEFORE UPDATE ON public.clients_v2
FOR EACH ROW
EXECUTE FUNCTION simple_update_updated_at();

-- 4. RLSを完全に無効化
ALTER TABLE public.clients_v2 DISABLE ROW LEVEL SECURITY;

-- 5. すべてのポリシーを削除
DROP POLICY IF EXISTS ALL ON public.clients_v2;

-- 6. 権限を再設定
GRANT ALL ON public.clients_v2 TO anon;
GRANT ALL ON public.clients_v2 TO authenticated;
GRANT ALL ON public.clients_v2 TO service_role;