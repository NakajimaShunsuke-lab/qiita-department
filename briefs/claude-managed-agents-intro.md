# 企画書: Claude Managed Agents入門 — インフラ不要でAIエージェントを本番デプロイする実践ガイド

## 基本情報
- テーマ: Claude Managed Agents入門
- ターゲット: AIエージェントを業務に導入したいエンジニア（中級者）
- 難易度: 中級
- 推定文字数: 4,500文字（コードブロック除く）

## 記事タイトル案
1. Claude Managed Agents入門 — 3つのAPIコールでAIエージェントを本番デプロイする
2. Claude Managed Agents実践ガイド — インフラ不要でAIエージェントを本番運用する方法
3. Claude Managed Agentsで社内FAQ Botを作る — セットアップから本番デプロイまで

## 推奨タグ
- AI, ClaudeCode, AIエージェント, Python, 生成AI

## 見出し構成案

### 導入: この記事で得られること
- 対象読者: AIエージェントを業務に導入したいエンジニア（Python基礎知識あり）
- 前提知識: Claude API の基本的な使い方、Python 3.10以上
- ゴール: Claude Managed Agentsの仕組みを理解し、実際にエージェントを作成・デプロイできるようになる
- 環境情報: Python 3.12 / anthropic SDK / 2026年4月時点（パブリックベータ）

### Claude Managed Agentsとは何か
- Messages APIとの違いを比較表で整理
- 4つのコアコンセプト（Agent → Environment → Session → Events）を図解的に説明
- どんなユースケースに向いているか（長時間実行、非同期タスク、クラウドインフラ必要時）
- ポイント: 「自前でエージェントループを構築する必要がない」というメリットを強調

### セットアップ: SDKとCLIの導入
- anthropic SDKのインストール
- ant CLIのインストール手順（Homebrew / curl）
- APIキーの設定
- ポイント: ant CLIの紹介は既存記事にない差別化要素

### 3ステップで始めるManaged Agents
- ステップ1: エージェントの作成（model, system prompt, tools定義）
  - agent_toolset_20260401 の説明
  - Pythonコード例
- ステップ2: 環境（Environment）の作成
  - クラウドコンテナの設定（ネットワーク、パッケージ）
  - Pythonコード例
- ステップ3: セッションの起動とストリーミング
  - イベント送信→SSEでリアルタイム受信
  - Pythonコード例（完全動作するスクリプト）
- ポイント: 各ステップのコード例を連結すると1つの動作するスクリプトになる構成

### 実践: 社内FAQ Botを作ってみる
- ユースケース: 社内ドキュメントを読み込んでFAQに回答するエージェント
- system promptの設計
- ファイルマウントで社内ドキュメントを渡す方法
- セッション内でのマルチターン会話
- Pythonコード例（完全版）
- ポイント: 実践的なユースケースは既存記事にない最大の差別化要素

### 知っておきたい料金と制限
- 料金体系: トークン料金 + 実行時間課金（$0.08/分）
- レート制限: 作成60req/min、読み取り600req/min
- ベータ制限: managed-agents-2026-04-01 ヘッダー必須
- コスト最適化のTips（セッション再利用、適切なモデル選択）

### Messages API・Claude Codeとの使い分け
- 比較表: Messages API vs Managed Agents vs Claude Code
  - 制御の粒度、インフラ管理、ユースケース、コスト
- どの場面でManaged Agentsを選ぶべきか判断フローを提示
- ポイント: 読者が「自分のケースではどれを使うべきか」を判断できるようにする

### まとめ
- Claude Managed Agentsの要点を箇条書きで整理
- 今後の展望（マルチエージェント、メモリ機能のGA化）
- 公式ドキュメントへのリンク

## サンプルコード要件
- コード1: Python — エージェント作成（Agent定義）
- コード2: Python — 環境作成（Environment定義）
- コード3: Python — セッション起動とストリーミング（完全動作スクリプト）
- コード4: Python — 社内FAQ Bot実装（実践ユースケース）
- コード5: bash — ant CLIでのエージェント作成（CLI版）

## 差別化ポイント
- **ant CLI の紹介**: 既存Qiita記事（kai_kou氏）では未カバー。CLIツールの存在と使い方を紹介
- **実践ユースケース（社内FAQ Bot）**: 既存記事はクイックスタートレベルで終わっている。具体的なビジネスユースケースの実装例を提供
- **3サービスの使い分けガイド**: Messages API・Managed Agents・Claude Codeの比較表と判断フロー。読者が「自分はどれを使うべきか」を即座に判断できる
- **コスト最適化Tips**: 料金体系の詳細と、セッション再利用等のコスト削減テクニック
- **結論ファースト構成**: レビュー教訓を活かし、各セクション冒頭で要点を先に述べる

## 参考URL
- 公式Overview: https://platform.claude.com/docs/en/managed-agents/overview
- 公式Quickstart: https://platform.claude.com/docs/en/managed-agents/quickstart
- 公式ブログ: https://claude.com/blog/claude-managed-agents
- 既存Qiita記事（kai_kou氏）: https://qiita.com/kai_kou/items/23e12c143a094de28b84
- Techgym解説: https://techgym.jp/column/claude-managed-agents/
- 完全ガイド（jinrai）: https://jinrai.co.jp/blog/2026/04/09/claude-managed-agents-guide/

## 注意事項
- パブリックベータであることを記事冒頭に明記する（API仕様変更の可能性）
- ベータヘッダー（managed-agents-2026-04-01）が必須であることを強調する
- マルチエージェント・メモリ機能は「リサーチプレビュー」であり、一般利用不可であることを注記する
- コード例は公式ドキュメントのPython SDKベースとし、未検証である旨を明記する
- 料金情報は2026年4月時点のものであり、変更の可能性がある旨を注記する
