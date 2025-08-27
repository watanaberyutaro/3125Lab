-- profilesテーブルの構造を確認
SELECT 
    column_name, 
    data_type,
    is_nullable,
    column_default
FROM 
    information_schema.columns 
WHERE 
    table_schema = 'public' 
    AND table_name = 'profiles'
ORDER BY 
    ordinal_position;

-- profilesテーブルの既存データを確認
SELECT * FROM public.profiles LIMIT 5;

-- 権限の確認
SELECT 
    grantee, 
    privilege_type
FROM 
    information_schema.table_privileges
WHERE 
    table_schema = 'public'
    AND table_name = 'profiles';

-- RLSの状態を確認
SELECT 
    tablename, 
    rowsecurity
FROM 
    pg_tables
WHERE 
    schemaname = 'public'
    AND tablename = 'profiles';