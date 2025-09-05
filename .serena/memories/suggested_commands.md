# Recipe SLM - 開発・実行コマンド

## プロジェクト起動コマンド

### 1. 開発サーバー起動
```bash
# プロジェクトフォルダに移動
cd C:\Users\tomon\dev\projects\Recipe_SLM

# PythonのHTTPサーバーを起動（ポート8000）
python -m http.server 8000

# ブラウザで http://localhost:8000 にアクセス
```

### 2. LM Studio API サーバー
- LM Studioを起動
- ローカルサーバーを開始（通常: http://192.168.2.107:1234）
- ブラウザで `chat.html` を開く
- 「モデル一覧取得」→「接続テスト」で動作確認

## Windows システムコマンド

### 基本ファイル操作
```cmd
# ディレクトリ一覧表示
dir

# ディレクトリ移動
cd パス

# ファイル内容表示
type ファイル名

# ファイル検索
findstr /s "検索文字" *.js

# コピー
copy 元ファイル 先ファイル
```

### Git操作
```bash
git status
git add .
git commit -m "コミットメッセージ"
git push
git pull
```

## 開発フローコマンド

### デバッグ・テスト
1. **ブラウザ開発者ツール**: F12でConsoleタブを開く
2. **ネットワーク監視**: NetworkタブでAPI通信確認
3. **PWAテスト**: ApplicationタブでService Worker確認

### コード検証
- **HTML検証**: W3C Markup Validator使用
- **CSS検証**: W3C CSS Validator使用  
- **JavaScript**: ブラウザConsoleでエラー確認

## ファイル管理コマンド

### ファイル検索・編集
```cmd
# JavaScript関数検索
findstr /n "function" script.js

# CSS セレクタ検索
findstr /n "class\|id" styles.css

# APIエンドポイント検索
findstr /n "API_CONFIG\|fetch" script.js
```

### 設定確認
```cmd
# manifest.json確認
type manifest.json

# Service Worker確認
type sw.js

# システムプロンプト確認
type "システムプロンプトの例.md"
```

## 実行環境セットアップ

### 初回セットアップ
1. LM Studioインストール・設定
2. プロジェクトフォルダに移動
3. HTTPサーバー起動
4. LM Studio APIサーバー起動
5. ブラウザでアプリアクセス

### 日常的な開発フロー
1. LM Studio API起動確認
2. `python -m http.server 8000` でサーバー起動
3. ブラウザで http://localhost:8000/chat.html にアクセス
4. 機能テスト・デバッグ
5. コード修正・ブラウザリロードで確認