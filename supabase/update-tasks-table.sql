-- tasks_v2テーブルから不要なカラムを削除
ALTER TABLE public.tasks_v2 
DROP COLUMN IF EXISTS assignee_email,
DROP COLUMN IF EXISTS progress;

-- 確認
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'tasks_v2'
ORDER BY ordinal_position;