-- RLSの状態を確認するクエリ

-- 1. テーブルのRLS設定を確認
SELECT 
    schemaname AS スキーマ,
    tablename AS テーブル名,
    CASE 
        WHEN rowsecurity = true THEN '✗ 有効（これが問題の原因）'
        ELSE '✓ 無効（正常）'
    END AS RLS状態
FROM 
    pg_tables
WHERE 
    schemaname = 'public' 
    AND tablename = 'projects';

-- 2. 既存のポリシーを確認
SELECT 
    schemaname AS スキーマ,
    tablename AS テーブル名,
    policyname AS ポリシー名,
    permissive AS 許可型,
    roles AS 対象ロール,
    cmd AS 操作,
    qual AS 条件,
    with_check AS チェック条件
FROM 
    pg_policies
WHERE 
    tablename = 'projects' 
    AND schemaname = 'public';

-- 3. 現在のユーザー権限を確認
SELECT 
    current_user AS 現在のユーザー,
    session_user AS セッションユーザー,
    current_role AS 現在のロール;

-- 4. テーブルへのアクセス権限を確認
SELECT 
    grantee AS 権限付与先,
    privilege_type AS 権限タイプ
FROM 
    information_schema.table_privileges
WHERE 
    table_schema = 'public' 
    AND table_name = 'projects';
    
-- 5. Supabaseのサービスロールキーを使用しているか確認
-- （anon keyではなくservice role keyを使うと、RLSをバイパスできます）
SELECT 
    CASE 
        WHEN current_setting('request.jwt.claim.role', true) = 'anon' THEN '匿名キー使用中（RLSの影響を受ける）'
        WHEN current_setting('request.jwt.claim.role', true) = 'service_role' THEN 'サービスロールキー使用中（RLSバイパス）'
        ELSE 'その他: ' || coalesce(current_setting('request.jwt.claim.role', true), 'null')
    END AS 使用中のキー;