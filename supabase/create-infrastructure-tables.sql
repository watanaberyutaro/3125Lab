-- プロジェクトのサーバー情報を管理するテーブル
CREATE TABLE IF NOT EXISTS public.project_servers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects_v2(id) ON DELETE CASCADE,
  server_name TEXT NOT NULL,
  server_type TEXT CHECK (server_type IN ('vps', 'shared', 'dedicated', 'cloud', 'other')),
  provider TEXT, -- さくら、AWS、Conoha等
  hostname TEXT,
  ip_address TEXT,
  ssh_port INTEGER DEFAULT 22,
  ssh_username TEXT,
  ssh_password TEXT, -- 暗号化して保存することを推奨
  ssh_key_info TEXT, -- SSH鍵の場所や情報
  control_panel_url TEXT, -- 管理画面URL
  control_panel_username TEXT,
  control_panel_password TEXT, -- 暗号化して保存することを推奨
  monthly_cost DECIMAL(10, 2),
  renewal_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- プロジェクトのドメイン情報を管理するテーブル
CREATE TABLE IF NOT EXISTS public.project_domains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects_v2(id) ON DELETE CASCADE,
  domain_name TEXT NOT NULL,
  registrar TEXT, -- お名前.com、ムームードメイン等
  registrar_url TEXT,
  registrar_username TEXT,
  registrar_password TEXT, -- 暗号化して保存することを推奨
  dns_provider TEXT, -- Cloudflare、Route53等
  dns_settings TEXT, -- JSON形式でDNS設定を保存
  expiry_date DATE NOT NULL,
  auto_renew BOOLEAN DEFAULT false,
  ssl_provider TEXT,
  ssl_expiry_date DATE,
  whois_privacy BOOLEAN DEFAULT true,
  yearly_cost DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- FTPアカウント情報を管理するテーブル
CREATE TABLE IF NOT EXISTS public.project_ftp_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects_v2(id) ON DELETE CASCADE,
  server_id UUID REFERENCES public.project_servers(id) ON DELETE CASCADE,
  account_type TEXT CHECK (account_type IN ('ftp', 'sftp', 'ftps')),
  host TEXT NOT NULL,
  port INTEGER DEFAULT 21,
  username TEXT NOT NULL,
  password TEXT, -- 暗号化して保存することを推奨
  root_directory TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- データベース接続情報を管理するテーブル
CREATE TABLE IF NOT EXISTS public.project_databases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects_v2(id) ON DELETE CASCADE,
  server_id UUID REFERENCES public.project_servers(id) ON DELETE CASCADE,
  db_type TEXT CHECK (db_type IN ('mysql', 'postgresql', 'mongodb', 'redis', 'other')),
  host TEXT NOT NULL,
  port INTEGER,
  database_name TEXT NOT NULL,
  username TEXT,
  password TEXT, -- 暗号化して保存することを推奨
  connection_string TEXT, -- 完全な接続文字列
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

-- 各テーブルに更新トリガーを設定
CREATE TRIGGER update_project_servers_updated_at BEFORE UPDATE ON public.project_servers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_domains_updated_at BEFORE UPDATE ON public.project_domains
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_ftp_accounts_updated_at BEFORE UPDATE ON public.project_ftp_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_databases_updated_at BEFORE UPDATE ON public.project_databases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- インデックスの作成
CREATE INDEX idx_project_servers_project_id ON public.project_servers(project_id);
CREATE INDEX idx_project_domains_project_id ON public.project_domains(project_id);
CREATE INDEX idx_project_domains_expiry_date ON public.project_domains(expiry_date);
CREATE INDEX idx_project_ftp_accounts_project_id ON public.project_ftp_accounts(project_id);
CREATE INDEX idx_project_databases_project_id ON public.project_databases(project_id);

-- RLSポリシー（必要に応じて有効化）
-- ALTER TABLE public.project_servers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.project_domains ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.project_ftp_accounts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.project_databases ENABLE ROW LEVEL SECURITY;