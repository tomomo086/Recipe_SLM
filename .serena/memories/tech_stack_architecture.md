# Recipe SLM - 技術スタックとアーキテクチャ（2025年9月最新版）

## 技術スタック

### フロントエンド技術
- **バニラJavaScript**: フレームワーク依存なし・軽量実装
- **HTML5**: PWA対応マークアップ、セマンティック構造
- **CSS3 Advanced**: グラデーション・アニメーション・レスポンシブ
- **PWA Core**: Service Worker + Web App Manifest + インストール促進

### バックエンド環境
- **LM Studio API Server**: http://192.168.2.107:1234
- **OpenAI互換API**: `/v1/chat/completions` エンドポイント
- **ストリーミング対応**: Server-Sent Events による文字単位配信

### システムアーキテクチャ
```
chat.html (UI) ←→ script.js (ストリーミング処理) ←→ LM Studio API
      ↓                    ↓
 sw.js (キャッシュ)    fetch API (リアルタイム通信)
      ↓                    ↓
詳細モーダル (📖ボタン)    タッチ最適化 (Android対応)
```

## コードアーキテクチャ

### ファイル構成
```
Recipe_SLM/
├── chat.html              # メインUI（PWA対応・モーダル追加）
├── script.js              # 主要JavaScript機能
├── styles.css             # スタイルシート（レスポンシブ対応・モーダル追加）
├── sw.js                  # Service Worker（PWAキャッシュ）
├── manifest.json          # PWA マニフェスト
├── icon.svg               # アプリアイコン
├── システムプロンプトの例.md  # AI設定例
├── README.md              # プロジェクト説明（詳細表示機能追加）
└── images/                # スクリーンショット・説明画像
    ├── 詳細ボタン付きメッセージ画面.png
    ├── 詳細モーダル表示画面.png
    └── その他のスクリーンショット
```

### 主要コンポーネント

#### JavaScript 主要関数（最新版）
- `sendMessage()`: ストリーミングAPI通信、完了後詳細ボタン追加処理
- `addMessage()`: チャット表示、詳細表示ボタン付きメッセージ作成
- `showMessageModal()`: モーダル表示機能
- `hideMessageModal()`: モーダル非表示・スクロール復元
- `optimizeForMobile()`: モバイル最適化（Android 3本指対応）
- `startTypingAnimation()`: プレースホルダーアニメーション（5種類ローテーション）
- `clearChat()`: チャット履歴クリア

#### PWA機能
- **Service Worker**: オフラインキャッシュ戦略
- **Web App Manifest**: スタンドアローン表示設定
- **beforeinstallprompt**: インストール促進UI

#### 新機能（2025年9月追加）
- **詳細表示ボタン**: AIメッセージ右上📖ボタン
- **モーダルウィンドウ**: アニメーション付き全文表示
- **Android対応**: 3本指スクリーンショット操作対応
- **テキスト選択**: コンテキストメニューとの競合回避

## システム要件

### 開発環境
- **OS**: Windows（主要開発環境）
- **言語**: TypeScript指定（実装はJavaScript）
- **HTTPサーバー**: Python内蔵サーバー（`python -m http.server 8000`）
- **APIサーバー**: LM Studio（ポート1234）

### 実行環境
- **ブラウザ**: モダンブラウザ（Chrome、Firefox、Safari、Edge）
- **デバイス**: スマートフォン・タブレット・PC
- **ネットワーク**: ローカルネットワーク内での通信
- **特別対応**: Android Chrome（スクリーンショット操作対応済み）

## 開発で使用したツール
- **Claude Code**: AI支援開発、コード生成・デバッグ
- **serenaメモリ機能**: プロジェクト情報の永続化
- **LM Studio**: ローカルLLM実行環境
- **VS Code**: 補助的な開発ツール

## 今後の拡張可能性
- **音声対話機能**: Speech API統合
- **オフライン完全対応**: ローカルレシピDB
- **テーマ機能**: ダークモード・カラーテーマ
- **レシピ管理**: お気に入り・履歴機能