-- 既存のprojectsテーブルを削除して再作成する場合（注意：データが削除されます）
-- このスクリプトは必要な場合のみ実行してください

-- Drop existing table if you want to reset (WARNING: This will delete all data!)
-- DROP TABLE IF EXISTS public.projects CASCADE;

-- 既存データを保持したまま、カラムを追加する場合はこちらを使用
-- Add missing columns to existing projects table
DO $$ 
BEGIN
    -- client_name カラムが存在しない場合は追加
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'projects' 
                   AND column_name = 'client_name') THEN
        ALTER TABLE public.projects ADD COLUMN client_name TEXT;
    END IF;
    
    -- progress カラムが存在しない場合は追加
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'projects' 
                   AND column_name = 'progress') THEN
        ALTER TABLE public.projects ADD COLUMN progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100);
    END IF;
    
    -- staging_url カラムが存在しない場合は追加
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'projects' 
                   AND column_name = 'staging_url') THEN
        ALTER TABLE public.projects ADD COLUMN staging_url TEXT;
    END IF;
    
    -- development_url カラムが存在しない場合は追加
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'projects' 
                   AND column_name = 'development_url') THEN
        ALTER TABLE public.projects ADD COLUMN development_url TEXT;
    END IF;
    
    -- repository_url カラムが存在しない場合は追加
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'projects' 
                   AND column_name = 'repository_url') THEN
        ALTER TABLE public.projects ADD COLUMN repository_url TEXT;
    END IF;
END $$;