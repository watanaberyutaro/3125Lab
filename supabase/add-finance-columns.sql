-- プロジェクトテーブルに財務情報カラムを追加
ALTER TABLE public.projects_v2 
ADD COLUMN IF NOT EXISTS development_fee DECIMAL(15, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS monthly_revenue DECIMAL(15, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS monthly_cost DECIMAL(15, 2) DEFAULT 0;

-- 財務履歴テーブルの作成
CREATE TABLE IF NOT EXISTS public.finance_history_v2 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects_v2(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'revenue', 'cost', 'development_fee'
  amount DECIMAL(15, 2) NOT NULL,
  description TEXT,
  recorded_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_finance_history_project_id ON finance_history_v2(project_id);
CREATE INDEX IF NOT EXISTS idx_finance_history_recorded_date ON finance_history_v2(recorded_date);

COMMENT ON COLUMN projects_v2.development_fee IS '制作費用（一括）';
COMMENT ON COLUMN projects_v2.monthly_revenue IS '月額収入（クライアントから）';
COMMENT ON COLUMN projects_v2.monthly_cost IS '月額支出（維持費）';