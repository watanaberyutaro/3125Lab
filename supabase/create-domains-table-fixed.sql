-- ドメイン管理テーブル（修正版）
CREATE TABLE IF NOT EXISTS public.domains_v2 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects_v2(id) ON DELETE CASCADE,
  domain_name TEXT NOT NULL,
  contract_date DATE NOT NULL,
  contract_period INTEGER NOT NULL DEFAULT 1, -- 契約期間（年単位）
  renewal_date DATE, -- 次回更新日（トリガーで自動計算）
  domain_user_id TEXT, -- ドメイン管理画面のID
  domain_password TEXT, -- ドメイン管理画面のパスワード（暗号化推奨）
  registrar TEXT, -- レジストラ（お名前.com等）
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 更新日を自動計算する関数
CREATE OR REPLACE FUNCTION calculate_renewal_date()
RETURNS TRIGGER AS $$
BEGIN
  -- contract_dateとcontract_periodから renewal_date を計算
  NEW.renewal_date := NEW.contract_date + (NEW.contract_period || ' years')::INTERVAL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 挿入時のトリガー
DROP TRIGGER IF EXISTS calculate_renewal_date_on_insert ON public.domains_v2;
CREATE TRIGGER calculate_renewal_date_on_insert
  BEFORE INSERT ON public.domains_v2
  FOR EACH ROW
  EXECUTE FUNCTION calculate_renewal_date();

-- 更新時のトリガー（contract_dateまたはcontract_periodが変更された場合）
DROP TRIGGER IF EXISTS calculate_renewal_date_on_update ON public.domains_v2;
CREATE TRIGGER calculate_renewal_date_on_update
  BEFORE UPDATE ON public.domains_v2
  FOR EACH ROW
  WHEN (OLD.contract_date IS DISTINCT FROM NEW.contract_date
        OR OLD.contract_period IS DISTINCT FROM NEW.contract_period)
  EXECUTE FUNCTION calculate_renewal_date();

-- 更新時刻を自動更新する関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 更新時刻トリガーの設定
DROP TRIGGER IF EXISTS update_domains_v2_updated_at ON public.domains_v2;
CREATE TRIGGER update_domains_v2_updated_at
  BEFORE UPDATE ON public.domains_v2
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_domains_v2_project_id ON public.domains_v2(project_id);
CREATE INDEX IF NOT EXISTS idx_domains_v2_renewal_date ON public.domains_v2(renewal_date);
CREATE INDEX IF NOT EXISTS idx_domains_v2_domain_name ON public.domains_v2(domain_name);

-- 権限設定（必要に応じて調整）
GRANT ALL ON public.domains_v2 TO authenticated;
GRANT ALL ON public.domains_v2 TO service_role;

-- サンプルデータの挿入（オプション - 不要な場合はコメントアウト）
-- INSERT INTO public.domains_v2 (domain_name, contract_date, contract_period, domain_user_id, registrar, notes)
-- VALUES
--   ('example.com', CURRENT_DATE, 1, 'user123', 'お名前.com', '本番環境用ドメイン'),
--   ('example.jp', CURRENT_DATE - INTERVAL '6 months', 2, 'user456', 'ムームードメイン', '日本向けドメイン');