-- clients_v2テーブルを作成（RLSなし）
CREATE TABLE IF NOT EXISTS public.clients_v2 (
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
ALTER TABLE public.clients_v2 DISABLE ROW LEVEL SECURITY;

-- 権限を付与
GRANT ALL ON public.clients_v2 TO anon;
GRANT ALL ON public.clients_v2 TO authenticated;
GRANT ALL ON public.clients_v2 TO service_role;

-- updated_atのトリガーを設定
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_clients_v2_updated_at ON public.clients_v2;
CREATE TRIGGER update_clients_v2_updated_at 
  BEFORE UPDATE ON public.clients_v2
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at();

-- テストデータを挿入（オプション）
INSERT INTO public.clients_v2 (name, company_name, email, phone, address, notes) 
VALUES 
  ('山田太郎', '株式会社サンプル', 'yamada@example.com', '03-1234-5678', '東京都渋谷区', 'テストクライアント'),
  ('佐藤花子', 'ABC Corporation', 'sato@abc.com', '06-9876-5432', '大阪府大阪市', 'VIPクライアント');

-- 確認
SELECT * FROM public.clients_v2;