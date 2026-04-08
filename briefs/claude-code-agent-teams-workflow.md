# 企画書: Claude Code Agent Teams実践ガイド — マルチエージェントで開発ワークフローを自動化する

## 基本情報
- テーマ: Claude Code Agent Teamsを活用した開発ワークフロー自動化
- ターゲット: Claude Codeの基本操作に慣れた中級エンジニア（Agent Teamsはまだ未経験の層）
- 難易度: 中級
- 推定文字数: 5,000〜6,000文字（コードブロック除く）

## 記事タイトル案
1. Claude Code Agent Teams実践ガイド — 3つのワークフローパターンで開発を並列化する
2. Claude Code Agent Teamsで開発ワークフローを自動化する — セットアップから実践パターンまで
3. 【実践】Claude Code Agent Teamsで複数AIが協調する開発フローを構築する

## 推奨タグ
- ClaudeCode, AI, AIエージェント, マルチエージェント, 開発効率化

## 見出し構成案

### H2: この記事について
- 対象読者: Claude Codeの基本操作（チャット、ファイル編集、コマンド実行）ができるエンジニア
- 前提知識: Claude Code v2.1.32以降がインストール済み、基本的なCLI操作ができること
- ゴール: Agent Teamsの仕組みを理解し、3つの実践ワークフローパターンを自分のプロジェクトに適用できるようになる
- 検証環境: Claude Code v2.x.x / macOS or Windows（WSL）/ Node.js 20+

### H2: Agent Teamsとは — サブエージェントとの違い
- Agent Teamsの概要（Team Lead + Teammates + 共有タスクリスト + メールボックス）
- サブエージェントとの比較表（通信モデル・コンテキスト・コスト・適用場面）
- 判断基準: 「結果だけ欲しい→サブエージェント」「議論・協調が必要→Agent Teams」
- 図解: サブエージェント vs Agent Teamsのアーキテクチャ

### H2: セットアップ
- settings.jsonでの有効化手順（CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS）
- 表示モード選択（in-process vs split panes）
- バージョン確認コマンド

### H2: 実践ワークフロー① — 並列コードレビュー
- ユースケース: PRレビューを3視点（セキュリティ・パフォーマンス・テストカバレッジ）で同時実行
- 具体的なプロンプト例
- Team Leadがレビュー結果を統合する流れ
- 期待される成果と所要時間の目安

### H2: 実践ワークフロー② — 機能実装の並列化
- ユースケース: フロントエンド・バックエンド・テストを3人のTeammateに分担
- ファイル競合を避けるためのタスク設計のコツ
- タスク依存関係の設定（バックエンドAPI完成後にフロントエンド結合）
- 具体的なプロンプト例

### H2: 実践ワークフロー③ — 競合仮説デバッグ
- ユースケース: 原因不明のバグを複数仮説で並列調査
- Teammateに仮説を割り当て、互いに反証させるプロンプト設計
- 具体的なプロンプト例
- 実際のデバッグセッションの流れ

### H2: Hooksで品質ゲートを設ける
- TeammateIdle / TaskCreated / TaskCompleted フックの活用
- 例: TaskCompletedフックでテスト実行を強制する設定
- hooks設定のJSONサンプル

### H2: ベストプラクティスとコスト最適化
- チームサイズの目安（3〜5人、タスク数は1人あたり5〜6個）
- コンテキスト設計: CLAUDE.mdに共通指示を書いてTeammateに自動読み込みさせる
- コスト意識: トークン消費はチーム人数に比例。ルーチンタスクは単一セッションの方が効率的
- よくある失敗パターンと対処法（ファイル競合、リードの早期終了、タスクステータスの遅延）

### H2: まとめ
- Agent Teamsは「並列探索に価値がある」タスクで真価を発揮する
- 3つのワークフローパターンの使い分け整理
- 小さく始めて段階的にスケールするアプローチを推奨
- 関連リソース（公式ドキュメント、サブエージェントドキュメント）へのリンク

## サンプルコード要件
- コード1: JSON — settings.jsonでのAgent Teams有効化設定
- コード2: JSON — .claude.jsonでのteammateMode設定
- コード3: テキスト — 並列コードレビューのプロンプト例
- コード4: テキスト — 機能並列実装のプロンプト例（タスク依存関係付き）
- コード5: テキスト — 競合仮説デバッグのプロンプト例
- コード6: JSON — TaskCompletedフックの設定例

## 差別化ポイント
- **Hooks活用セクション**: 既存記事にないTeammateIdle/TaskCreated/TaskCompletedフックの実践例を提示
- **コスト最適化の具体的ガイドライン**: 「いつAgent Teamsを使うべきか」の判断フローを明示
- **失敗パターンと対処法**: 既存記事で不足が指摘されている「失敗事例」をカバー
- **3パターンの段階的難易度設計**: レビュー（読むだけ）→実装（書く）→デバッグ（探索）と難易度を上げていく構成
- **CLAUDE.mdとの連携**: プロジェクト設定からAgent Teams活用までの一貫した流れを示す

## 参考URL
- 公式ドキュメント: https://code.claude.com/docs/en/agent-teams
- Agent Teams実践ガイド（SeckeyJP）: https://qiita.com/SeckeyJP/items/2639ae22b85e04a98c9c
- サブエージェントとAgent Teamsの違い（nogataka）: https://qiita.com/nogataka/items/df6c43496b2da9d41311
- Claude Code Agent Teamsの衝撃と実際（gihyo.jp）: https://gihyo.jp/article/2026/02/get-started-claude-code-07
- Claude Code × MCP実践活用ガイド: https://www.aquallc.jp/claude-code-mcp-guide/

## 注意事項
- Agent Teamsは実験的機能（Research Preview）であることを記事冒頭で明記する
- バージョン要件（v2.1.32以降）を必ず記載する
- split panesモードはVS Code統合ターミナルでは非対応であることに言及する
- トークンコストがチーム人数に比例して増加することを注意喚起する
- プロンプト例は英語で記載する（Claude Codeのインターフェースが英語のため）
