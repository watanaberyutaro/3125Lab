-- users_v2テーブルを作成（RLSなし）
CREATE TABLE IF NOT EXISTS public.users_v2 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'member',
  department TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLSを無効化
ALTER TABLE public.users_v2 DISABLE ROW LEVEL SECURITY;

-- 権限を付与
GRANT ALL ON public.users_v2 TO anon;
GRANT ALL ON public.users_v2 TO authenticated;
GRANT ALL ON public.users_v2 TO service_role;

-- updated_atのトリガーを設定
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_v2_updated_at ON public.users_v2;
CREATE TRIGGER update_users_v2_updated_at 
  BEFORE UPDATE ON public.users_v2
  FOR EACH ROW 
  EXECUTE FUNCTION update_users_updated_at();

-- インデックスを作成
CREATE INDEX IF NOT EXISTS idx_users_v2_email ON public.users_v2(email);
CREATE INDEX IF NOT EXISTS idx_users_v2_name ON public.users_v2(name);

-- サンプルユーザーを追加
INSERT INTO public.users_v2 (name, email, role, department) VALUES
  ('山田太郎', 'yamada@example.com', 'manager', '開発部'),
  ('佐藤花子', 'sato@example.com', 'developer', '開発部'),
  ('田中次郎', 'tanaka@example.com', 'designer', 'デザイン部'),
  ('鈴木三郎', 'suzuki@example.com', 'developer', '開発部')
ON CONFLICT (email) DO NOTHING;

-- 確認
SELECT COUNT(*) as total_users FROM public.users_v2;