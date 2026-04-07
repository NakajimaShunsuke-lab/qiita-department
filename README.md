# 編集部 Qiita部門 — Agent Teams

Qiita技術記事の企画・執筆・レビュー・公開を行うAIエージェントチームです。

## 概要

本プロジェクトは、Claude Codeのスキル（スラッシュコマンド）として実装された複数のAIエージェントが協調し、Qiita技術記事の制作ワークフローを自動化します。

## チーム構成

| エージェント | コマンド | 役割 |
|---|---|---|
| トレンドリサーチAI | `/qiita-trend` | QiitaのHOTトピック調査・テーマ選定 |
| リサーチャーAI | `/qiita-director` | 企画・情報収集・構成案作成 |
| ライターAI | `/qiita-write` | Markdown執筆・サンプルコード作成 |
| レビュアー・校正AI | `/qiita-review` | 品質管理・テクニカルチェック |
| 公開オペレーション | `/qiita-ops` | 公開前チェック・published切り替え |
| レポートAI | `/qiita-report` | 記事作成レポートの作成 |
| ナレッジAI | `/qiita-knowledge` | レポート＋アナリティクスからナレッジ管理 |
| 統括エージェント | `/qiita-full` | 全フェーズ一括実行 |

## ワークフロー

```
/qiita-trend → /qiita-director → /qiita-write → /qiita-review → /qiita-ops → /qiita-report → /qiita-knowledge
```

全フェーズを一括で実行する場合は `/qiita-full` を使用します。各フェーズ完了時にユーザー確認があります。

## ディレクトリ構成

```
Qiita/
├── .claude/
│   ├── settings.json          # ツール権限設定
│   ├── rules/                 # コンテキストルール（自動適用）
│   └── skills/                # スラッシュコマンド（スキル）
├── qiita-repo/
│   ├── public/                # 記事ファイル（Qiita CLI標準）
│   ├── briefs/                # 企画書
│   └── .templates/            # テンプレート
├── context/
│   ├── report/                # 作業レポート（未処理）
│   ├── analytics/             # アナリティクスデータ
│   ├── knowledge/             # ナレッジ集
│   └── old_report/            # 処理済みアーカイブ
├── scripts/                   # 自動化スクリプト
├── prompt/                    # 設立プロンプト
├── CLAUDE.md                  # プロジェクト指示書
├── AGENTS.md                  # エージェント一覧
├── CONTRIBUTING_QIITA.md      # 執筆ガイドライン
└── package.json               # スクリプト定義
```

## 始め方

### 前提条件

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) がインストール済み
- [Qiita CLI](https://github.com/increments/qiita-cli) がインストール済み
- Node.js 18+

### セットアップ

```bash
# 依存関係のインストール
npm install

# Qiita CLIの初期化（初回のみ）
cd qiita-repo && npx qiita init
```

### 記事作成（一括実行）

```bash
# Claude Codeを起動し、以下のコマンドを実行
/qiita-full
```

### 記事作成（個別実行）

```bash
/qiita-trend        # Step 1: トレンド調査・テーマ選定
/qiita-director     # Step 2: 企画・構成案作成
/qiita-write        # Step 3: 記事執筆
/qiita-review       # Step 4: レビュー・校正
/qiita-ops          # Step 5: 公開
/qiita-report       # Step 6: レポート作成
/qiita-knowledge    # Step 7: ナレッジ更新
```

## 外部連携

- **Notion同期:** `npm run sync-notion` でレポートをNotionデータベースに同期
- **Qiitaデプロイ:** `npx qiita publish` で記事を公開、または mainブランチへのpushでGitHub Actions経由で反映

## 管理者の役割

AIチームが全フェーズを自律的に実行するため、人間の役割は以下に限定されます:

- **運用監督:** プロンプトのチューニング、ワークフロー全体の品質監視
- **エンゲージメント対応:** 公開後の読者コメント対応・SNSでのエンゲージメント対応
