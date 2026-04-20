---
title: Claude Code Skills実践入門 — 業務ワークフローをAIに移植する5つの設計パターン
tags:
  - AI
  - 生成AI
  - AI駆動開発
  - AIエージェント
  - ClaudeCode
private: false
updated_at: '2026-04-20T21:08:52+09:00'
id: de756cf6176b28931312
organization_url_name: null
slide: false
ignorePublish: false
---

Claude Codeを使い込むうちに「同じようなプロンプトを何度も書いている」「チームの手順書をAIに毎回貼り付けている」と感じたことはないでしょうか。2026年に入ってから急速に存在感を増している **Agent Skills** は、こうした定型業務を **起動条件付きのワークフロー** としてファイルシステムに常駐させる仕組みです。

本記事ではSKILL.mdの最小構造から始めて、実務に落としこむための **5つの設計パターン** を具体的なコード例とともに整理します。

## この記事の対象読者・前提知識・ゴール

- **対象読者:** Claude Codeを日常利用しているが、プロンプトの再入力や類似指示の繰り返しに疲れを感じている中級エンジニア
- **前提知識:** Claude Codeの基本操作、CLAUDE.mdの書き方の基礎
- **ゴール:** SKILL.mdの構造を理解し、5つの設計パターンを使い分けて自分/チームの定型業務をAIに移植できるようになる
- **環境情報:** Claude Code 2.1.108以降、Claude Opus 4.6 / 4.7、macOS/Linux/Windows（WSL）いずれも動作確認対象

## なぜ今「Skills」なのか — プロンプトとの決定的な違い

結論から言うと、Skillsは **「いつ・どの知識を・どう使うか」をファイルシステム上に分離して記述する仕組み** であり、プロンプト・CLAUDE.md・MCPとは役割が異なります。似た用途に見える4要素を整理すると、次のように使い分けられます。

**表1: Claude Codeの4要素の使い分け**

| 要素 | スコープ | 起動タイミング | 得意領域 |
|------|---------|----------------|---------|
| プロンプト | 1回の指示 | 都度 | アドホックな問いかけ |
| CLAUDE.md | プロジェクト常識 | セッション開始時に常時読込 | 永続的なルール・背景 |
| Skills | 定型ワークフロー | 条件マッチ時に自動発動 | 再利用可能な手順書 |
| MCP | 外部システム接続 | 明示的な呼び出し | DB・API・監視ツール連携 |

ここで重要なのが、公式ドキュメントが **Progressive Disclosure（段階的開示）** と呼ぶ仕組みです。SkillはSKILL.mdの全文が常にコンテキストに載るわけではなく、3段階に分けて読み込まれます。

**表2: Skillsの3レベル読み込み**

| レベル | 読込タイミング | トークン消費 | 内容 |
|--------|---------------|-------------|------|
| Level 1: メタデータ | セッション開始時（常時） | 1スキルあたり約100トークン | frontmatterの `name`・`description` |
| Level 2: SKILL.md本文 | 起動条件マッチ時 | 5,000トークン以内が推奨 | 指示本文・ワークフロー |
| Level 3: 付属ファイル | 本文から参照された時 | 実質無制限（bash経由で読込） | リファレンス・スクリプト・テンプレート |

多数のSkillをインストールしてもLevel 1しか常駐しないため、コンテキストを圧迫しません。さらにClaude Code 2.1.108で追加された **1時間プロンプトキャッシュ** と組み合わせると、長いSKILL.md本文もキャッシュに乗ってトークン消費を抑えられます。

全体像と読み込みモデルが掴めたら、次は最小構造を組み立てていきましょう。

## SKILL.mdの最小構造 — 5分で動くSkillを作る

Skillは **frontmatter + 指示本文** だけで動きます。なかでも `description` の書き方が起動精度を左右します。

配置先は2択で、用途に応じて使い分けます。

**表3: 配置先の使い分け**

| 配置先 | スコープ | 用途 |
|--------|---------|------|
| `.claude/skills/{skill-name}/SKILL.md` | プロジェクト固有 | チーム共有したい業務手順。リポジトリにコミットする |
| `~/.claude/skills/{skill-name}/SKILL.md` | 個人グローバル | 全プロジェクトで使う個人のクセ・便利Skill |

最小のSKILL.mdは次のように書きます。

```markdown:.claude/skills/pr-checklist/SKILL.md
---
name: pr-checklist
description: Verify a pull request meets team standards before opening it. Use when the user asks to create a PR, open a PR, or check PR readiness.
---

# PR事前チェック

以下を順に確認し、不備があれば指摘する。

1. `npm run lint` と `npm test` が成功していること
2. コミットメッセージが `feat:` / `fix:` / `docs:` のいずれかで始まっていること
3. CHANGELOG.md に該当バージョンのエントリがあること
4. スクリーンショットが必要なUI変更の場合、PRテンプレートに添付されていること

不備があれば `❌ 項目名: 理由` の形式で箇条書きする。すべて問題なければ `✅ 公開可能` と返す。
```

`description` を書くときの3原則は以下のとおりです。

1. **具体的な動詞で開始する**（「Verify」「Generate」「Convert」など）
2. **対象を明示する**（「a pull request」「meeting notes」など）
3. **起動条件を1〜2文で明記する**（「Use when the user asks to ...」）

公式仕様では `name` が64文字以内・英小文字とハイフン、`description` が1024文字以内という制約があります。「anthropic」「claude」は予約語のため使えません。

最小構造を掴んだら、ここから5つの実用パターンに入ります。

## パターン1 — コード生成ガード型（Guard Skill）

結論から言うと、**コーディング規約や命名規則など、実装時に必ず適用したい制約をAIに注入するパターン** です。生成コードの品質を底上げするのが狙いです。

典型的なユースケースは次のとおりです。

- Reactコンポーネントの命名・ディレクトリ規約を統一する
- SQLクエリ生成時にSQLインジェクション対策を強制する
- コミットメッセージのConventional Commits準拠を保証する

たとえばReactの命名ガードは次のように書けます。

```markdown:.claude/skills/react-naming-guard/SKILL.md
---
name: react-naming-guard
description: Enforce team React naming conventions when creating or editing React components. Use when the user asks to add, create, or refactor a React component.
---

# React命名ガード

Reactコンポーネントを生成・編集する際、以下のルールを必ず適用する。

- ファイル名はPascalCase（例: `UserProfileCard.tsx`）
- カスタムフックは `use` で始める（例: `useOrderStatus`）
- ディレクトリは `src/components/{domain}/` 配下に配置
- Propsの型名は `{ComponentName}Props` で統一

違反する既存コードを見つけた場合は、編集ついでに修正案を提示する（ただし勝手に書き換えない）。
```

起動条件設計のコツは、「コードを書く」といった曖昧な語を避け、**ファイル種別・対象技術を限定する** ことです。「create a React component」のように具体化すると、関係ない場面での誤発動を防げます。

:::note warn
Level 2の本文が長くなるとキャッシュ効率が落ちるため、規約が膨大になる場合はLevel 3の付属ファイル（`conventions/naming.md` など）に逃がし、SKILL.md本文からは参照のみにするのが定石です。
:::

制約の注入パターンを押さえたら、次は「抜け漏れ防止」のパターンに進みます。

## パターン2 — チェックリスト型（Checklist Skill）

結論から言うと、**PR前チェック・リリース手順・セキュリティ確認など、漏れたら困る定型手順をAIに委譲するパターン** です。人間のレビュアーの負荷を下げ、再現性を高めます。

代表例としてリリース前チェックSkillを示します。

```markdown:.claude/skills/release-preflight/SKILL.md
---
name: release-preflight
description: Run a release readiness checklist before tagging a new version. Use when the user asks to cut a release, tag a version, or prepare for deployment.
---

# リリース事前チェック

本番リリース前に以下を上から順に確認する。**取り消し困難な操作（タグ付与・本番デプロイ）の前には必ずユーザー確認を挟むこと。**

## 1. テスト
- `npm test` が直近のCIでpassしていること
- E2Eテストが直近24時間以内にpassしていること

## 2. バージョン
- `package.json` の `version` が更新されていること
- `CHANGELOG.md` に新バージョンの項目があること

## 3. ドキュメント
- README.mdの互換性情報が更新されていること
- マイグレーション手順が必要な変更はMIGRATION.mdに記載されていること

## 4. 承認ポイント
上記がすべて `✅` になったら、次のメッセージをユーザーに送る:

> すべてのチェックに通過しました。`git tag v{version}` を実行してよろしいですか？（yes/no）

`yes` の返信があった場合のみタグ付与コマンドを実行する。
```

導入前後のインパクトは次のように整理できます。

**表4: 手動チェック vs Checklist Skill**

| 観点 | 手動チェック | Checklist Skill |
|------|-------------|-----------------|
| 所要時間 | 10〜20分 | 2〜3分 |
| 漏れ率 | 項目数に応じて増加 | Skill側で固定、漏れゼロに近づく |
| 再現性 | 人によってばらつく | 全員同じ基準で実行 |
| 承認ポイント | 暗黙的 | 明示的（yes/no確認） |

承認ポイントの埋め込みは **取り消し困難な操作（`git push --force`、本番デプロイ、DBマイグレーション）** で必須です。Skill本文に「ユーザー確認を挟むこと」と明文化しておきましょう。

定型手順を任せられるようになったら、次は情報収集の自動化です。

## パターン3 — 情報収集型（Research Skill）

結論から言うと、**Webからの情報収集・既存ドキュメント横断検索・トレンド調査など、複数ソースから情報を集めて要約するパターン** です。調査のスタート地点を毎回ゼロから作らずに済みます。

週次のトレンド調査Skillを例に挙げます。

```markdown:.claude/skills/weekly-trend-research/SKILL.md
---
name: weekly-trend-research
description: Collect weekly tech trends from Qiita and public blogs, then summarize them into a structured report. Use when the user asks for a weekly trend report or this-week-in-tech summary.
---

# 週次トレンド調査

以下の手順で調査し、`context/report/trend_YYYYMMDD.md` に保存する。

## 1. ソース収集
- Qiitaトップページ（トレンド記事）をWebFetchで取得
- 指定タグの週間ランキングを収集
- 公式ブログ（Anthropic/OpenAI/Google）の直近投稿を補完

## 2. スコアリング
`references/scoring-criteria.md` の採点基準に従い、各トピックに以下を付与:
- HOTスコア（1〜5）
- 狙い目度（高/中/低）
- 想定読者層

## 3. 出力
`references/report-template.md` のテンプレートに沿って構造化Markdownを生成する。
上位10件を表にまとめ、末尾に「推奨テーマ3選」を追記する。
```

:::note info
採点基準や出力テンプレートのように **量が大きい参照情報** はSKILL.md本文ではなくLevel 3の付属ファイル（`references/` 配下）に分離するのが定石です。本文には参照先パスだけを書けば、普段はLevel 1の約100トークンしか消費しません。
:::

注意点として、**ネットワークアクセスはClaude Code環境では利用可能ですが、Claude API経由のSkillsでは利用不可** です。API側でRESEARCH系Skillを使う場合は、事前収集したデータをファイルとして同梱する設計に切り替える必要があります。

情報収集の次は、入力と出力の形式変換パターンです。

## パターン4 — フォーマット変換型（Transform Skill）

結論から言うと、**入力フォーマットから出力フォーマットへの変換を規則ベースで実行し、出力のブレを最小化するパターン** です。議事録・ログ・設計書など、組織内で形式を揃えたいドキュメントで威力を発揮します。

議事録の構造化Skillは次のようになります。

```markdown:.claude/skills/meeting-to-notion/SKILL.md
---
name: meeting-to-notion
description: Convert raw meeting transcripts into the team's Notion-ready structured Markdown. Use when the user pastes a meeting transcript or asks to format meeting notes.
---

# 議事録構造化

受け取ったテキストを `templates/meeting-note.md` のフォーマットに整形する。

## 必須フィールド
- 日付・参加者・議題
- 決定事項（Decisions）: 誰が何を決めたか
- ToDo（Action Items）: `- [ ] @担当者 2026-04-30: タスク内容`の形式
- 次回までの持ち越し（Parking Lot）

## 処理ルール
1. 雑談・繰り返し発言は削除する
2. 「〜だと思う」「〜かもしれない」は決定事項から除外する
3. 担当者と期限が特定できないToDoは `@未定` として末尾にまとめる
4. 機密情報（個人名・顧客名）は `[REDACTED]` に置換する

出力は純粋なMarkdownのみ（コードブロックで囲まない）。
```

テンプレートファイル（`templates/meeting-note.md`）をLevel 3として同梱しておくと、出力が常に同じ形式に揃います。

:::note info
決定的な処理（日付フォーマット変換・機密情報マスキングなど）は **Pythonスクリプトに逃がすのが効率的** です。Skillから `scripts/sanitize.py` を `bash` で呼び出せば、スクリプトのコード自体はコンテキストに載らず、実行結果だけが返ります。
:::

単発変換の次は、複数ステップを束ねる最終パターンです。

## パターン5 — マルチステップ実行型（Pipeline Skill）

結論から言うと、**複数フェーズと承認ポイントを持つワークフロー全体を1つのSkillで記述するパターン** です。本記事の冒頭で触れた「記事執筆パイプライン」がまさにこの型に該当します。

記事執筆パイプラインの簡易版を示します。

```markdown:.claude/skills/article-pipeline/SKILL.md
---
name: article-pipeline
description: Run the full article production pipeline from research to draft, with human approval gates. Use when the user asks to write a technical article or start an article production workflow.
---

# 記事執筆パイプライン

以下4フェーズを順に実行する。各フェーズ終了時に成果物を提示し、ユーザー承認を得てから次に進む。

## フェーズ1: テーマ調査
- `references/research-sources.md` のソースリストを参照
- 調査結果を `briefs/research_{slug}.md` に保存
- **承認ポイント:** 調査結果をユーザーに提示し、「このテーマで構成案に進みますか？」と確認

## フェーズ2: 構成案作成
- `templates/outline.md` のフォーマットで見出し構成を作成
- `briefs/{slug}.md` に保存
- **承認ポイント:** 構成案の見出し一覧を提示し、「この構成で執筆に進みますか？」と確認

## フェーズ3: 執筆
- `npx qiita new {slug}` で記事ファイルを作成
- 構成案に沿って本文を執筆
- **承認ポイント:** 初稿を提示し、「レビューに進みますか？」と確認

## フェーズ4: セルフレビュー
- `references/review-checklist.md` の観点でセルフレビュー
- 修正が必要な箇所は直接編集
- 最終成果物を `public/{slug}.md` として提示
```

各フェーズで入力・出力・承認要否を明確にしておくと、実行中に迷いません。

**表5: パイプライン各フェーズの責務**

| フェーズ | 入力 | 出力 | 承認 |
|---------|------|------|------|
| 調査 | テーマ候補 | `briefs/research_*.md` | 必要 |
| 構成 | 調査結果 | `briefs/{slug}.md` | 必要 |
| 執筆 | 構成案 | `public/{slug}.md` 初稿 | 必要 |
| レビュー | 初稿 | `public/{slug}.md` 最終版 | 不要 |

:::note alert
**アンチパターン:** 全工程を1つのSKILL.mdに詰め込むと、500行を超えた時点で保守不能になります。長くなってきたら **Level 3のファイル分割** でフェーズごとに切り出し、SKILL.md本文は流れだけを記述する構成に切り替えてください。
:::

5つのパターンが揃ったので、最後に全体像を俯瞰します。

## 5つのパターンの全体像と導入順序

ここまでの5パターンを横断比較すると、それぞれが適するシーンがはっきり分かれます。

**表6: 5パターンの対比**

| パターン | 典型ユースケース | 起動頻度 | Progressive Disclosure活用度 |
|---------|-----------------|---------|---------------------------|
| Guard | 命名規則・規約注入 | 高（コーディングのたび） | 低（本文完結でも可） |
| Checklist | PR前・リリース前チェック | 中 | 中（項目数次第） |
| Research | トレンド調査・技術選定 | 低〜中 | 高（テンプレート同梱） |
| Transform | 議事録・ログ整形 | 中 | 高（テンプレート＋スクリプト） |
| Pipeline | 記事執筆・デプロイ | 低 | 必須（フェーズごとにファイル分割） |

はじめて導入するチームには、リスクの小さい順から手を付けるのがおすすめです。

1. **Guard**（最小リスク・即効性あり）
2. **Checklist**（人間確認を挟めば失敗しても戻せる）
3. **Transform**（出力だけをAIに任せる範囲）
4. **Research**（ネット接続・外部API絡みで範囲広め）
5. **Pipeline**（複数フェーズの設計が必要、最難）

公式の推奨は **「完璧さより動作を優先」** と **「頻度の高い1タスクから始める」** です。最初から全社統一のSkillを作ろうとせず、まず1人が使って効果を確認してからチーム共有に広げる順序で進めると失敗が少なくなります。

## まとめ

5つの設計パターンの要点を振り返ります。

- **Guard**: 実装時の規約をAIに注入して生成品質を底上げする
- **Checklist**: 漏れたら困る定型手順を承認ポイント付きで委譲する
- **Research**: 複数ソースからの情報収集と要約を再利用可能にする
- **Transform**: 入力と出力の形式変換を規則ベースで安定化する
- **Pipeline**: フェーズと承認を束ねたワークフロー全体を定義する

Skillsは「プロンプトの使い回し場所」ではなく、**起動条件付きのワークフロー定義** です。Level 1に軽いメタデータだけを常駐させ、必要なときにLevel 2・Level 3を段階的に読み込むProgressive Disclosureの設計思想が、コンテキストを圧迫せずに多数のSkillを運用する鍵になります。

Claude Code 2.1.108の1時間プロンプトキャッシュ、Claude Opus 4.7の暗黙的ニーズ推論と組み合わせれば、効果はさらに高まります。まずは今週のチーム業務のなかで **「毎回同じことを説明している定型手順」** を1つ選び、Guard または Checklist 型で書き起こしてみてください。

## 関連記事

- [Claude Codeで実践するコンテキストエンジニアリング — 成果が変わる5つの設計パターン](https://qiita.com/NAKAJI_Rw/items/baf510dc02ffe9537b3a)
- [AIエージェントフレームワーク徹底比較2026 — Mastra・LangGraph・OpenAI Agents SDK・Claude Agent SDK、現場で使って分かった選び方](https://qiita.com/NAKAJI_Rw/items/6e64d3b6acf322bb47d2)
- [実務で使えるMCPサーバー入門 — FastMCP 3.xでSlack通知ツールを30分で作る](https://qiita.com/NAKAJI_Rw/items/47cd7157ceffd4e49998)

## 参考資料

- [Agent Skills 公式ドキュメント（Anthropic）](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)
- [Agent Skills ベストプラクティス（Anthropic）](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
- [Anthropic公式Skillsリポジトリ（GitHub）](https://github.com/anthropics/skills)
