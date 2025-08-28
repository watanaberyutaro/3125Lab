-- 既存のトリガーを確認
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM 
    information_schema.triggers
WHERE 
    event_object_table = 'clients_v2';

-- 既存のRLSポリシーを確認
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM 
    pg_policies
WHERE 
    tablename = 'clients_v2';

-- もし問題のあるトリガーが見つかったら削除
-- DROP TRIGGER IF EXISTS [trigger_name] ON public.clients_v2;

-- 新しいテーブルを作成（完全にクリーンな状態）
CREATE TABLE IF NOT EXISTS public.clients_v3 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  company_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  website TEXT,
  contact_person TEXT,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLSを無効化
ALTER TABLE public.clients_v3 DISABLE ROW LEVEL SECURITY;

-- 権限を付与
GRANT ALL ON public.clients_v3 TO anon;
GRANT ALL ON public.clients_v3 TO authenticated;
GRANT ALL ON public.clients_v3 TO service_role;

-- シンプルなupdated_atトリガーのみ設定
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_clients_v3_updated_at ON public.clients_v3;
CREATE TRIGGER update_clients_v3_updated_at 
  BEFORE UPDATE ON public.clients_v3
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 既存のデータをコピー（必要に応じて）
INSERT INTO public.clients_v3 (id, name, company_name, email, phone, address, website, contact_person, notes, created_by, created_at, updated_at)
SELECT id, name, company_name, email, phone, address, website, contact_person, notes, created_by, created_at, updated_at
FROM public.clients_v2;