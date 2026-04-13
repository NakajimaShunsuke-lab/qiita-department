# 企画書: MCPサーバー自作入門 — FastMCP 3.xで業務ツールをAIに繋ぐ実践レシピ

## 基本情報
- テーマ: MCPサーバー自作入門 — FastMCP 3.xで業務AI連携ツールを30分で作る
- ターゲット: MCPに興味があるPython開発者（Pythonの基礎知識あり、MCP未経験〜初級）
- 難易度: 中級
- 推定文字数: 4,500〜5,500文字（コードブロック除く）

## 記事タイトル案
1. 「実務で使えるMCPサーバー入門 — FastMCP 3.xでSlack通知ツールを30分で作る【2026年最新】」
2. 「MCPサーバー自作入門2026 — FastMCPで業務ツールをAIに繋ぐ実践レシピ（AWS公式設計パターンも解説）」
3. 「FastMCP 3.x実践ガイド — 天気APIではなく"本番で使える"MCPサーバーを作る方法」

**推奨タイトル:** 案1（具体性と即実感が最も高い）

## 推奨タグ
- MCP, Python, AI, ClaudeCode, TypeScript

## 差別化ポイント

### 既存記事との比較
| 既存記事 | カバー範囲 | 本記事の差別化 |
|---------|-----------|--------------|
| FastMCP完全ガイド | 基礎概念・天気API例・Claude Desktop連携 | **業務ユースケース**（Slack）＋AWS設計パターン比較 |
| MCPサーバー入門（備忘録系） | 最低限のセットアップ | **30分で実際に動く**完全実装＋セキュリティ設計 |
| FastMCP 2.0でOpenAPI連携 | OpenAPI→MCPの自動変換 | 手動実装の柔軟性と制御性を重視した構成 |

### 本記事だけが提供するもの
1. **実業務ユースケース**: 天気APIではなく「Slack通知」という誰でも使える業務シナリオ
2. **FastMCP 3.x最新機能**: v3.2.3（2026年4月9日最新）の`@mcp.tool`デコレータ構文
3. **AWS公式MCPサーバー設計パターン**: 54種のAWS公式実装から学ぶ最小権限・エラー処理の設計
4. **Claude Code連携**: Claude Desktopだけでなく、Claude Code（mcp_servers設定）への接続

## 見出し構成案

### この記事でわかること（導入）
- 対象読者: Pythonが書けて「MCPって面白そう」と思っているエンジニア
- 前提知識: Python基礎・pip/uvの使用経験・Slack APIの概念知識（必須ではない）
- ゴール: FastMCP 3.xでSlack通知MCPサーバーを作り、Claude Codeから呼び出せる状態にする
- 検証環境: Python 3.12 / FastMCP 3.2.3 / uv 0.5.x / macOS 14 / Windows 11

### MCPとFastMCPを3分で理解する
- MCPとは: AIとツールを繋ぐ「USB-C規格」のプロトコル
- FastMCPとは: MCPサーバーをデコレータ数行で作れるPythonフレームワーク（MCP公式Python SDKに組み込み済み）
- 2026年4月時点の立ち位置: 全MCPサーバーの70%以上がFastMCPベース、AWS公式も採用

### 環境構築（5分）
- uvのインストール（推奨パッケージマネージャ）
- `uv pip install fastmcp` でFastMCPインストール
- Slack Botトークンの取得手順（スクリーンショット付き説明）

### 最初のMCPサーバーを作る（10分）
- `mcp = FastMCP("slack-notifier")` でサーバー初期化
- `@mcp.tool` デコレータでSlack通知ツールを定義（v3.x構文）
- 型ヒントによる自動スキーマ生成の仕組み（v1/v2との違いに注記）
- ローカル起動・動作確認コマンド

### Claude Codeから呼び出す（5分）
- `.claude/settings.json` の `mcpServers` 設定
- Claude Codeでの動作確認手順
- ツールが正しく認識されているかの確認方法

### 実装を実務レベルに磨く（10分）
- エラーハンドリング: API障害・タイムアウト時の適切な例外設計
- 入力バリデーション: Pydanticモデルで堅牢な入力チェック
- 環境変数管理: Slack Botトークンをハードコードしない（`.env` + `python-dotenv`）
- ログ設計: `logging` モジュールで呼び出し履歴を記録

### AWS公式MCPサーバーから学ぶ設計パターン
- AWSが2026年4月に公開した54種のオープンソースMCPサーバーの設計思想
- 最小権限の原則: ツールのスコープを最小限に絞る
- 読み取り専用から始める: 書き込み系ツールには慎重な設計が必要
- 参考コードリポジトリへの誘導

### 発展: 複数ツールとリソースの追加
- 「Slack通知」に「Slackチャンネル一覧取得」を追加する実装例
- `@mcp.resource` でコンテキスト情報を提供する方法
- サーバー合成（複数MCPサーバーの統合）への発展ポイント

### まとめ
- 今回作成したMCPサーバーの要点を箇条書き
- 次のステップ: HTTP/SSEトランスポートへの移行・本番デプロイ
- 参考リンク集（FastMCP公式・AWS公式MCPリポジトリ・Claude Code MCP設定ガイド）

## サンプルコード要件
- **コード1**: `python:slack_mcp_server.py` — FastMCP 3.xでSlack通知ツールを実装する基本コード（30行程度）
- **コード2**: `python:slack_mcp_server_with_validation.py` — Pydanticモデルとエラーハンドリングを追加した本番品質版（50行程度）
- **コード3**: `json:.claude/settings.json` — Claude CodeのMCPサーバー接続設定
- **コード4**: `bash` — 環境構築コマンド一覧（uv初期化〜起動まで）

## 参考URL
- FastMCP公式GitHub: https://github.com/jlowin/fastmcp — v3.2.3最新機能・インストール方法
- AWS公式MCPサーバーリスト（2026年4月）: https://blog.supica.work/entry/aws-mcp-server-list-2026-04-01 — 54種のサーバー設計パターン参考
- FastMCP完全ガイド（Qiita）: https://qiita.com/softbase/items/be07d0e71b19f0095fdf — 差別化対象記事
- MCPサーバー自作実践（Qiita）: https://qiita.com/kawabe0201/items/144ad72abe1be1473b2b — 差別化対象記事
- FastMCP公式ドキュメント: https://gofastmcp.com

## 注意事項
- FastMCP v3.x のデコレータ構文（`@mcp.tool`）とv1.x/v2.x（`@mcp.tool()`）の違いを明記する
- Slack Botトークンはサンプルコード内にハードコードしない。環境変数から読み込む実装を標準とする
- 「30分で作れる」の見出しに対応し、実際に各ステップの所要時間を記載する
- コードブロックには言語指定とファイル名を必ず付ける（CONTRIBUTING_QIITA.md準拠）
- 未検証のコードは「動作確認済み」として掲載しない旨を注記する
