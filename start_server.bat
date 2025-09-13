@echo off
chcp 65001
echo 🍽️ Recipe SLM Function Calling サーバー起動中...
echo.

REM 依存関係のインストール
echo 📦 依存関係をインストール中...
npm install

echo.
echo 🧪 関数テスト実行中...
npm run test

echo.
echo 🚀 サーバー起動中...
echo 📡 http://localhost:3000 でアクセス可能
echo 🔧 Function Calling機能が有効です
echo.
echo Ctrl+C でサーバーを停止できます
echo.

npm start