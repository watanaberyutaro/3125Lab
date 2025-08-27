-- 1. 現在のprofilesテーブルの制約を確認
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.profiles'::regclass;

-- 2. role列の制約を削除
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 3. roleカラムを自由な文字列が入るように修正（制約なし）
ALTER TABLE public.profiles ALTER COLUMN role TYPE TEXT;

-- 4. 確認のためテーブル構造を表示
SELECT 
    column_name, 
    data_type,
    column_default,
    is_nullable
FROM 
    information_schema.columns 
WHERE 
    table_schema = 'public' 
    AND table_name = 'profiles'
    AND column_name = 'role';

-- 5. テスト更新（現在のユーザーのroleを更新）
-- UPDATE public.profiles 
-- SET role = '責任者' 
-- WHERE email = 'r.watanabe@3125.jp';

-- 6. 更新されたデータを確認
SELECT id, email, full_name, role, department 
FROM public.profiles 
WHERE email = 'r.watanabe@3125.jp';