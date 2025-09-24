-- ドメイン管理テーブル
CREATE TABLE IF NOT EXISTS public.domains_v2 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects_v2(id) ON DELETE CASCADE,
  domain_name TEXT NOT NULL,
  contract_date DATE NOT NULL,
  contract_period INTEGER NOT NULL DEFAULT 1, -- 契約期間（年単位）
  renewal_date DATE GENERATED ALWAYS AS (contract_date + (contract_period || ' years')::INTERVAL) STORED,
  domain_user_id TEXT, -- ドメイン管理画面のID
  domain_password TEXT, -- ドメイン管理画面のパスワード（暗号化推奨）
  registrar TEXT, -- レジストラ（お名前.com等）
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 更新トリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 更新トリガーの設定
DROP TRIGGER IF EXISTS update_domains_v2_updated_at ON public.domains_v2;
CREATE TRIGGER update_domains_v2_updated_at
  BEFORE UPDATE ON public.domains_v2
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_domains_v2_project_id ON public.domains_v2(project_id);
CREATE INDEX IF NOT EXISTS idx_domains_v2_renewal_date ON public.domains_v2(renewal_date);

-- サンプルデータの挿入（オプション - 不要な場合はコメントアウト）
-- INSERT INTO public.domains_v2 (project_id, domain_name, contract_date, contract_period, domain_user_id, registrar, notes)
-- VALUES
--   ('your-project-id', 'example.com', '2024-01-01', 1, 'user123', 'お名前.com', '本番環境用ドメイン'),
--   ('your-project-id', 'example.jp', '2024-06-15', 2, 'user456', 'ムームードメイン', '日本向けドメイン');