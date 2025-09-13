# 🍽️ Recipe SLM - ポケット献立アシスタント

LM Studio Function Callingを活用したインテリジェントな料理レシピ検索システム

## ✨ 主要機能

### 🤖 AI駆動のレシピ検索
- **Function Calling**: LM Studioと連携したリアルタイムレシピ検索
- **柔軟な検索**: 複数キーワード、材料名、料理カテゴリに対応
- **インテリジェントマッチング**: スコアリングシステムによる最適な結果表示

### 🎬 リアルタイム表示
- **Function Calling可視化**: 実行中の関数とパラメータをリアルタイム表示
- **タイピングアニメーション**: AIの応答が1文字ずつ自然に表示 (15ms/文字)
- **実行結果サマリー**: 検索結果の件数と完了ステータス表示

### 📱 PWA対応
- **オフライン利用**: Service Worker対応（httpsサーバー必要）
- **モバイル最適化**: レスポンシブデザインとタッチ操作対応
- **インストール可能**: ホーム画面への追加が可能

## 🚀 セットアップと起動

### 必要要件
- **LM Studio**: http://192.168.2.107:1234 で動作中
- **モダンブラウザ**: Chrome, Firefox, Safari, Edge
- **Node.js**: サーバーモード使用時（オプション）

### 起動方法

#### 方法1: 直接ブラウザで開く（推奨）
```bash
# chat.htmlをブラウザで直接開く
file:///C:/Users/tomon/dev/projects/Recipe_SLM/chat.html
```

#### 方法2: Node.jsサーバー経由
```bash
cd C:\Users\tomon\dev\projects\Recipe_SLM
npm start
# http://localhost:3000 でアクセス
```

## 🔍 使用方法

### 基本的な検索例
```
「豚肉の料理教えて」
「なすの照り焼きの作り方教えて」  
「いつものレシピ見せて」（お気に入り検索）
「野菜料理のレシピある？」
```

### Function Calling動作確認
1. 上記のような質問を入力
2. 🔧 Function Calling実行表示を確認
3. ⚙️ 実行中の関数詳細を確認  
4. ✅ 実行完了と取得件数を確認
5. 🎬 AIの応答がタイピング表示されることを確認

## 📝 レシピの追加

新しいレシピを追加する方法は [RECIPE_GUIDE.md](./RECIPE_GUIDE.md) を参照してください。

### クイック追加手順
1. `script.js` を開く
2. `RECIPE_DATA` 配列を見つける
3. 既存レシピの形式に従って新しいレシピを追加
4. ブラウザでリロードしてテスト

## 🏗️ アーキテクチャ

### フロントエンド
- **Pure JavaScript**: フレームワーク不使用のシンプル構成
- **CSS3**: モダンなレスポンシブデザイン
- **PWA**: マニフェスト + Service Worker

### バックエンド
- **LM Studio**: ローカルLLM + Function Calling API
- **Node.js Express**: プロキシサーバー（オプション）
- **ローカルレシピDB**: JavaScript配列ベースの軽量データベース

### Function Calling フロー
```
ユーザー入力 → LM Studio → Function検出 → ローカル実行 → 結果統合 → 最終応答
```

## 📊 検索スコアリングシステム

### スコア計算
- **タイトルマッチ**: 各キーワード +20点
- **完全一致ボーナス**: +10点  
- **メイン材料マッチ**: 各キーワード +15点
- **材料マッチ**: 各材料 +10点
- **カテゴリマッチ**: +10点

### 検索の仕組み
1. キーワードを空白で分割
2. 各単語で部分一致検索
3. スコア計算して降順ソート
4. 上位10件を返却

## 🛠️ 開発情報

### ファイル構成
```
Recipe_SLM/
├── chat.html              # メインのWebアプリ
├── script.js              # 核となるJavaScript（Function Calling含む）
├── styles.css             # スタイルシート
├── manifest.json          # PWAマニフェスト
├── server/
│   ├── server.js          # Express プロキシサーバー
│   └── recipe-tools.js    # サーバー側ツール実装
├── README.md              # このファイル
├── RECIPE_GUIDE.md        # レシピ追加ガイド
└── Function_Calling_Features.md  # 機能詳細説明
```

### 主要コンポーネント

#### Function Tools定義
```javascript
const FUNCTION_TOOLS = [
    {
        type: "function",
        function: {
            name: "search_recipes",
            description: "材料やキーワードでレシピを検索します",
            parameters: { /* ... */ }
        }
    }
    // ... 他のツール
];
```

#### 検索エンジン
```javascript
function searchRecipes(parameters) {
    // 柔軟なキーワードマッチング
    // スコアリングシステム
    // 結果ランキング
}
```

## 🎯 現在のレシピデータベース

- **豚のしょうが焼き** (teiban, meat)
- **なすの照り焼き** (yasai, teiban)  
- **鶏の唐揚げ** (teiban, fried)

## 🚨 トラブルシューティング

### よくある問題

#### 「Failed to fetch」エラー
- LM Studioが http://192.168.2.107:1234 で起動しているか確認
- CORSエラーの場合はブラウザの開発者モードで起動

#### Function Callingが動作しない
- LM StudioでFunction Calling対応モデルを使用
- コンソールログでエラー確認（F12）
- ツール定義の構文確認

#### レシピが検索されない
- ブラウザコンソールで検索ログ確認
- レシピデータのmain_ingredientsとcategories確認
- JSON構文エラーチェック

### デバッグ情報
開発者ツール（F12）のコンソールで詳細なログが確認できます：
- 🔍 検索ワード分析
- 📊 スコア計算過程
- 📈 検索結果一覧

## 📈 今後の改善予定

- [ ] レシピデータの外部ファイル化
- [ ] 画像対応
- [ ] 栄養情報表示
- [ ] レシピの評価機能
- [ ] より多くのレシピデータ

## 📄 ライセンス

このプロジェクトは学習・研究目的で作成されています。

---

🍽️ **美味しい料理作りをAIがサポートします！**