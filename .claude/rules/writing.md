---
description: Qiita記事の執筆時に適用されるガイドラインルール
paths: ["public/**/*.md"]
---

# Qiita記事 執筆ルール

## 必須参照
- `CONTRIBUTING_QIITA.md` — 全ガイドラインを遵守すること
- `context/knowledge/` — 過去の執筆ナレッジを参照すること

## フロントマター
- Qiita CLI形式のフロントマターを必ず含める
- タグは最大5つ、Qiita既存タグを優先
- `private: false` で作成（pushと同時に公開）

## 記事構成
- H1は使用しない（Qiitaではタイトルが H1 扱い）
- H2 → H3 → H4 の階層を守る
- 導入セクション（対象読者・前提知識・ゴール）を必ず含める
- まとめセクションを必ず含める

## コードブロック
- 言語指定とファイル名を必ず記載する（例: ```typescript:src/example.ts）
- コピペで動作するコードを心がける
- コードの前後に解説文を配置する

## Qiita独自記法
- ノート記法（:::note info/warn/alert）を適切に活用する
- 折りたたみ（details/summary）で長いコードを整理する
