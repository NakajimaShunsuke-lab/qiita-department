# 編集部Qiita部門 — Agent Teams 設立プロンプト

Qiita技術記事の企画・執筆・レビュー・公開を行うAIエージェントチームです。
記事の管理は `qiita-repo/` で Qiita CLI を使用して行います。

### 1. AIエージェントの役割分担

技術記事は正確性と構成が命となるため、執筆プロセスを専門領域ごとにAIエージェントへ分割しています。
各エージェントはスラッシュコマンド（Skill）として実装済みです。

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

#### 各エージェントの詳細

* **トレンドリサーチAI (`/qiita-trend`)**
    * **役割:** Qiitaのトレンド記事・人気タグ・急上昇テーマを調査し、AIが自律的に最適な執筆テーマを選定します。カテゴリ別トレンド分析、記事の供給と需要のギャップ分析、ナレッジとの照合を行い、HOTスコア×狙い目度×実現性の総合評価で執筆テーマを決定します。
    * **出力:** トレンドレポート（`context/report/trend_YYYYMMDD.md` に配置）。HOTトピックTOP10、カテゴリ別トレンド概況、選定テーマ（選定理由・ターゲット・切り口・推奨タグ）を含みます。
* **リサーチャーAI (`/qiita-director`)**
    * **役割:** 指定された技術テーマに基づく最新情報の収集、公式ドキュメントの読み込み、Qiita上の既存記事・トレンドタグの調査を行います。`context/knowledge/` のナレッジも参照します。
    * **出力:** 企画書（`qiita-repo/briefs/` に配置）。見出し構成案、参考URLリスト、サンプルコード要件、推奨タグ（最大5つ）などをまとめます。
* **ライターAI (`/qiita-write`)**
    * **役割:** リサーチャーが作成した構成案をもとに、`CONTRIBUTING_QIITA.md` のガイドラインに従い、Qiitaに適した論理的でわかりやすい文章をMarkdown形式で執筆します。
    * **出力:** 記事の初稿（`qiita-repo/public/` に配置、`private: true`）。必要に応じてサンプルコードの実装と解説文も生成します。
* **レビュアー・校正AI (`/qiita-review`)**
    * **役割:** 初稿の誤字脱字、論理の飛躍、コードの不備をチェックし、Qiitaの読者層に合ったトーン＆マナー（技術的な正確性、再現性、実用性など）になっているかを審査します。
    * **出力:** 自動修正済みの記事。品質基準を満たさない場合はライターAIへ自動差し戻し（最大3回）。
* **公開オペレーション (`/qiita-ops`)**
    * **役割:** 公開前チェックリスト（frontmatter、コンテンツ、品質）の確認を行い、全チェック項目パス後に `private: false` へ自動で切り替えます。
    * **出力:** チェック結果レポート、および公開済み記事。コミットメッセージは `feat(article): {記事タイトルの要約}`。
* **レポートAI (`/qiita-report`)**
    * **役割:** 記事作成プロセス全体の進捗や各AIの出力結果をまとめ、記事作成におけるレポートを作成します。
    * **出力:** 記事作成の工程・判断・修正履歴などをまとめたレポート。`context/report/report_YYYYMMDD_テーマ名.md` の形式で保存し、`npm run sync-notion` でNotionデータベースに同期します。
* **ナレッジAI (`/qiita-knowledge`)**
    * **役割:** `context/report/` のレポートと `context/analytics/` のアナリティクスデータを分析し、ナレッジを作成・更新します。処理済みファイルは `context/old_report/` にアーカイブします。
    * **出力:** `context/knowledge/` にナレッジファイルを作成・更新。今後の記事執筆における改善点・知見として各エージェントが参照します。

### 2. 人間（管理者）の役割

AIチームが全フェーズを自律的に実行するため、人間の役割は運用の監督とエンゲージメント対応に限定されます。

* **運用監督・プロンプト管理:**
    * 各AIエージェントへのプロンプト（指示内容）の継続的なチューニング、ワークフロー全体の品質監視を行います。必要に応じてレポートやナレッジを確認し、改善指示を出します。
* **エンゲージメント対応:**
    * 公開後の読者からのコメント対応やSNS等でのエンゲージメント対応は人間が直接引き受けることで、読者との適切なコミュニケーションを担保します。

### 3. ワークフロー

記事作成は以下のフェーズで進行します。全フェーズがAIエージェントにより自律的に実行され、人間の介入なしにトレンド調査から公開までを完了します。
`/qiita-full` で全フェーズを一括実行します。

#### フェーズ1: トレンドリサーチ・テーマ選定（`/qiita-trend`）
1. `/qiita-trend` を実行し、Qiitaの最新トレンドを調査する
2. HOTトピックTOP10とカテゴリ別トレンドの分析を行う
3. HOTスコア×狙い目度×実現性の総合評価により、AIが最適な執筆テーマを1本選定する
4. 選定結果（テーマ・選定理由・ターゲット・切り口・推奨タグ）をトレンドレポートに記録する
5. 選定テーマの情報を次フェーズへ自動で引き渡す

#### フェーズ2: リサーチ・構成案作成（`/qiita-director`）
> `/qiita-trend` で選定されたテーマを引き継いで実行

1. `context/knowledge/` のナレッジを参照し、選定テーマの情報を収集する
2. Qiitaのトレンドタグ・既存記事を調査し、差別化ポイントを整理する
3. 見出し構成案・参考URLリスト・サンプルコード要件・推奨タグをまとめ、企画書を `qiita-repo/briefs/` に作成する
4. 構成案を次フェーズへ自動で引き渡す

#### フェーズ3: 執筆（`/qiita-write`）
1. 構成案をもとに `CONTRIBUTING_QIITA.md` に従いMarkdown形式で記事を執筆する
2. 記事ファイルを `qiita-repo/public/` に配置する（`private: true`）
3. 記事を次フェーズへ自動で引き渡す

#### フェーズ4: レビュー・校正（`/qiita-review`）
1. 記事の誤字脱字・論理の飛躍・コードの不備をチェックする
2. Qiitaの読者層に合ったトーン＆マナーになっているか審査する
3. 問題があれば自動修正し、修正済みの記事を出力する
4. 品質基準を満たさない場合はライターAIへ自動で差し戻し、再執筆→再レビューを繰り返す（最大3回）
5. 品質基準を満たしたら次フェーズへ自動で引き渡す

#### フェーズ5: 公開前チェック・公開（`/qiita-ops`）
1. frontmatter（タグ・タイトル・private設定）・コンテンツ・品質のチェックリストを自動確認する
2. 全チェック項目をパスしたら `private: false` に変更する
3. コミットメッセージ `feat(article): {記事タイトルの要約}` でコミットする
4. `npx qiita publish` または mainブランチへのpushでQiitaに反映する

#### フェーズ6: レポート作成・ナレッジ更新（`/qiita-report` → `/qiita-knowledge`）
1. 記事作成プロセス全体の工程・判断・修正履歴をまとめたレポートを作成する
2. `context/report/report_YYYYMMDD_テーマ名.md` の形式で保存する
3. `npm run sync-notion` でNotionデータベースに同期する
4. `/qiita-knowledge` を自動実行し、ナレッジを更新する
5. 処理済みレポートを `context/old_report/` にアーカイブする

```
【ワークフロー全体図 — 完全自動化】

/qiita-trend：HOTトピック調査 → AIがテーマ選定
        ↓ 自動
/qiita-director：情報収集・構成案作成・タグ選定 → briefs/
        ↓ 自動
/qiita-write：Markdown執筆 → public/（private: true）
        ↓ 自動
/qiita-review：品質管理・テクニカルチェック（不合格→自動差し戻し→再執筆、最大3回）
        ↓ 自動
/qiita-ops：公開前チェック → private: false → publish
        ↓ 自動
/qiita-report：レポート作成 → context/report/ → Notion同期
        ↓ 自動
/qiita-knowledge：ナレッジ更新 → context/knowledge/

【一括実行: /qiita-full（全フェーズ自動実行）】
```

### 4. Qiita固有の仕様

#### 4.1 Qiita CLIとフロントマター

Qiita CLIで管理する記事のフロントマターは以下の形式です:

```yaml
---
title: '記事タイトル'
tags:
  - name: 'タグ名1'
  - name: 'タグ名2'
private: true
updated_at: ''
id: null
organization_url_name: null
slide: false
ignorePublish: false
---
```

* **tags:** 最大5つまで。Qiitaに既存のタグを優先的に使用し、読者が検索しやすいタグを選定する
* **private:** 初稿は `true`、`/qiita-ops` の公開前チェック通過後に `false` へ自動変更
* **organization_url_name:** Organization投稿の場合に設定（通常は `null`）
* **slide:** スライドモードの記事の場合に `true`（通常は `false`）
* **ignorePublish:** `true` にするとCLI経由で公開されない（下書き保持用）

#### 4.2 Qiita Markdown拡張記法

Qiita独自のMarkdown記法を活用して記事の可読性を高めます:

* **ノート記法:** 補足や警告の強調表示
  ```markdown
  :::note info
  補足情報をここに記載
  :::

  :::note warn
  注意事項をここに記載
  :::

  :::note alert
  重要な警告をここに記載
  :::
  ```
* **折りたたみ:**
  ```markdown
  <details><summary>クリックで展開</summary>

  折りたたまれたコンテンツ
  </details>
  ```
* **コードブロック:** 言語指定とファイル名を必ず記載
  ```markdown
  ```typescript:src/example.ts
  const greeting: string = "Hello, Qiita!";
  ```
  ```
* **数式:** LaTeX記法に対応（`$inline$` / `$$block$$`）
* **目次の自動生成:** 見出し構成がそのまま右サイドバーの目次になるため、見出しの階層設計が重要

### 5. ディレクトリ構成

```
qiita-repo/
├── public/            # 記事ファイル（{slug}.md）— Qiita CLIの標準ディレクトリ
├── briefs/            # 企画書（{テーマ名}.md）
└── .templates/        # 記事・企画書テンプレート

context/
├── report/            # 記事作成レポート（未処理）
├── analytics/         # アナリティクスデータ（CSV等）
├── knowledge/         # ナレッジ集（蓄積）
└── old_report/        # /qiita-knowledge で処理済みのアーカイブ

scripts/               # 自動化スクリプト（Notion同期等）
```

### 6. 外部連携

* **Notion同期:** レポート作成後に `npm run sync-notion` で自動同期。アナリティクスデータ含む更新は `npm run sync-notion:update`。
* **Qiitaデプロイ:** `npx qiita publish` で記事を公開。または mainブランチへのpushでGitHub Actions経由でQiitaに反映（GitHub連携設定時）。

### 7. 運用ルール

* **Qiita用ガイドラインの徹底:** `CONTRIBUTING_QIITA.md` にQiitaで好まれる文体（結論ファースト、再現可能な手順、環境情報の明記、過剰な装飾を避けるなど）を定義。全エージェントがこのガイドラインを遵守します。
* **タグ戦略:** 記事の発見性を高めるため、トレンドタグや検索ボリュームの高いタグを優先的に使用します。タグは企画フェーズで選定し、レビューフェーズで最終確認します。
* **ワークフローの完全自動化:** `/qiita-full` でトレンド調査から公開・ナレッジ更新まで全フェーズを人間の介入なしに自動実行します。各フェーズは個別のスラッシュコマンドでも実行可能です。
* **ナレッジの継続的改善:** レポートとアナリティクスから `/qiita-knowledge` でナレッジを定期的に更新し、記事品質の向上に活かします。
