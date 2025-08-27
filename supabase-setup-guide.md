# Supabase プロジェクト作成機能の設定ガイド

## 現在の問題
プロジェクトテーブルへのデータ挿入時にRLS（Row Level Security）エラーが発生しています。

## 解決方法

### 方法1: Supabaseダッシュボードから直接設定（推奨）

1. **Supabaseダッシュボードにアクセス**
   - https://supabase.com/dashboard にアクセス
   - プロジェクトを選択

2. **SQL Editorで新しいテーブル（projects_v2）を作成**
   - 左メニューから「SQL Editor」を選択
   - 以下のSQLを実行：

```sql
-- projects_v2テーブルを作成（RLSなし）
CREATE TABLE IF NOT EXISTS public.projects_v2 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  client_name TEXT,
  status TEXT DEFAULT 'planning',
  priority TEXT DEFAULT 'medium',
  start_date DATE,
  end_date DATE,
  production_url TEXT,
  staging_url TEXT,
  development_url TEXT,
  repository_url TEXT,
  progress INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLSを無効化
ALTER TABLE public.projects_v2 DISABLE ROW LEVEL SECURITY;

-- 権限を付与
GRANT ALL ON public.projects_v2 TO anon;
GRANT ALL ON public.projects_v2 TO authenticated;
```

3. **テーブルの確認**
   - 左メニューから「Table Editor」を選択
   - `projects_v2`テーブルが表示されることを確認
   - テーブル名の横にある盾アイコンが**グレー**（RLS無効）であることを確認

### 方法2: 既存のprojectsテーブルのRLSを無効化

1. **Table Editorにアクセス**
   - Supabaseダッシュボード → Table Editor
   - `projects`テーブルを選択

2. **RLSを無効化**
   - テーブル名の横にある盾アイコン（緑色）をクリック
   - 「Disable RLS」を選択
   - 確認ダイアログで「Disable」をクリック

## アプリケーションの設定確認

現在、アプリケーションは`projects_v2`テーブルを使用するように設定されています。

### 設定ファイル: `/lib/supabase/projects.ts`
- すべての関数が`projects_v2`テーブルを使用
- 元の`projects`テーブルに戻す場合は、`TABLE_NAME`を変更

## 動作確認

1. **開発サーバーを起動**
```bash
npm run dev
```

2. **ブラウザでアクセス**
   - http://localhost:3000/projects
   - 「新規プロジェクト」ボタンをクリック

3. **テストデータを入力**
   - プロジェクト名: テストプロジェクト
   - 説明: 動作確認用
   - ステータス: 開発中
   - 優先度: 高

4. **保存ボタンをクリック**
   - エラーが表示されずにプロジェクト一覧に追加されれば成功

## トラブルシューティング

### エラーが続く場合

1. **Supabaseダッシュボードで直接データを確認**
   - Table Editor → projects_v2
   - データが保存されているか確認

2. **ブラウザのコンソールを確認**
   - F12キーでデベロッパーツールを開く
   - Consoleタブでエラーメッセージを確認

3. **Supabase接続を確認**
   - http://localhost:3000/test-supabase
   - 接続状態とテーブル情報を確認

## 注意事項

- `projects_v2`テーブルはRLSが無効なため、本番環境では適切なセキュリティ設定が必要
- 開発・テスト環境でのみこの設定を使用することを推奨