# 編集部 Qiita部門 — Agent Teams

Qiita技術記事の企画・執筆・レビュー・公開を行うAIエージェントチームです。
記事の管理は Qiita CLI を使用して行います。

## プロジェクト構成

- `public/` — 記事ファイル（{slug}.md）— Qiita CLIの標準ディレクトリ
- `briefs/` — 企画書（{テーマ名}.md）
- `.templates/` — 記事・企画書テンプレート
- `context/report/` — 作業レポートの蓄積ディレクトリ（未処理）
- `context/analytics/` — アナリティクスデータ（CSV等）
- `context/knowledge/` — レポート＋アナリティクスから抽出したナレッジ集
- `context/old_report/` — `/qiita-knowledge` で処理済みのアーカイブ
- `scripts/` — 自動化スクリプト（Notion同期、GA Analytics取得等）
- `docs/` — セットアップ手順等のドキュメント
- `CONTRIBUTING_QIITA.md` — 全エージェントが遵守するガイドライン

## 共通ルール

- 記事作成時は必ず `CONTRIBUTING_QIITA.md` のガイドラインに従うこと
- **記事ファイルは必ず `npx qiita new` で作成する**（`public/` に手動でファイルを作成しないこと）
- 記事は `public/` に配置する
- レポートは `context/report/` に `report_YYYYMMDD_{テーマ名}.md` の形式で保存する
- `context/report/` に蓄積されたレポートは作業時にナレッジとして参照すること
- `context/knowledge/` のナレッジファイルは作業時に参照すること
- ナレッジの作成・更新は `/qiita-knowledge` コマンドで実行する
- 記事は `private: false` で作成し、pushと同時に公開する

## ワークフロー

各フェーズのスラッシュコマンドで実行する:

1. `/qiita-trend` — トレンドリサーチ・テーマ選定
2. `/qiita-director` — リサーチ・構成案作成
3. `/qiita-write` — Markdown執筆
4. `/qiita-review` — レビュー・校正
5. `/qiita-ops` — 公開前チェック
6. `/qiita-report` — レポート作成

全フェーズを一括実行する場合は `/qiita-full` を使用する（ユーザー確認なしで全フェーズ自動実行）。

### ナレッジ管理

- `/qiita-knowledge` — レポート＋アナリティクスデータからナレッジを作成・更新

### 外部連携

- Notion同期: `npm run sync-notion`（レポート作成後に実行）
- Qiitaデプロイ: `npx qiita publish` または mainブランチへのpush
- GA Analytics取得: `npm run fetch-analytics`（手動） / GitHub Actionsで毎週日曜自動実行
- `context/analytics/` にはGoogle AnalyticsのCSVエクスポートを配置する（ファイル名は計測期間: `YYYYMMDD-YYYYMMDD.csv`）
- `npm run sync-notion:update` でアナリティクスデータを含めたNotion更新が可能
