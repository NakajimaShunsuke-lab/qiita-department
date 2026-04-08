# Qiita部門 — エージェント一覧

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
/qiita-trend：HOTトピック調査 → AIがテーマ選定
        ↓ 自動
/qiita-director：情報収集・構成案作成・タグ選定 → briefs/
        ↓ 自動
/qiita-write：Markdown執筆 → public/（private: false）
        ↓ 自動
/qiita-review：品質管理・テクニカルチェック（不合格→自動差し戻し→再執筆、最大3回）
        ↓ 自動
/qiita-ops：公開前チェック → publish
        ↓ 自動
/qiita-report：レポート作成 → context/report/ → Notion同期

【一括実行: /qiita-full（全フェーズ自動実行）】
```
