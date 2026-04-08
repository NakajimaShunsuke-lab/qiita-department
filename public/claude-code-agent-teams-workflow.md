---
title: 'Claude Code Agent Teams実践ガイド — 3つのワークフローパターンで開発を並列化する'
tags:
  - name: 'ClaudeCode'
  - name: 'AI'
  - name: 'AIエージェント'
  - name: 'マルチエージェント'
  - name: '開発効率化'
private: true
updated_at: ''
id: null
organization_url_name: null
slide: false
ignorePublish: false
---

## この記事について

Claude Code の **Agent Teams** を使うと、複数のAIエージェントがチームとして協調しながら並列に作業できます。本記事では、セットアップから3つの実践ワークフローパターン、さらにHooksによる品質ゲートまでを解説します。

- **対象読者:** Claude Codeの基本操作（チャット・ファイル編集・コマンド実行）ができるエンジニア
- **前提知識:** Claude Code v2.1.32以降がインストール済みであること
- **ゴール:** Agent Teamsの仕組みを理解し、3つの実践パターンを自分のプロジェクトに適用できるようになる

:::note warn
Agent Teamsは2026年4月現在、実験的機能（Research Preview）です。機能や仕様は変更される可能性があります。
:::

## Agent Teamsとは — サブエージェントとの違い

Agent Teamsは、複数のClaude Codeインスタンスを1つのチームとして連携させる機能です。以下の4つの要素で構成されます。

| コンポーネント | 役割 |
|:--|:--|
| **Team Lead** | チームを作成し、タスク割り当てと結果の統合を行うメインセッション |
| **Teammates** | 独立したコンテキストウィンドウを持つ個別のClaude Codeインスタンス |
| **Task List** | 全エージェントが共有するタスクリスト。依存関係の管理も可能 |
| **Mailbox** | エージェント間の直接メッセージングシステム |

### サブエージェントとの使い分け

Claude Codeには既にサブエージェント機能がありますが、Agent Teamsとは設計思想が異なります。

| 観点 | サブエージェント | Agent Teams |
|:--|:--|:--|
| **コンテキスト** | 独自だが結果は呼び出し元に返る | 完全に独立 |
| **通信** | メインエージェントへの報告のみ | Teammate同士が直接通信 |
| **調整方法** | メインエージェントが全作業を管理 | 共有タスクリストで自律的に調整 |
| **適するケース** | 結果だけ欲しい集中タスク | 議論・協調が必要な複雑タスク |
| **トークンコスト** | 低め（結果のみ返却） | 高め（各Teammateが独立インスタンス） |

**判断基準はシンプルです。** 「結果だけ返してくれればいい」ならサブエージェント、「Teammate同士が発見を共有し、互いの意見に異議を唱え、自律的に調整する必要がある」ならAgent Teamsを選びましょう。

## セットアップ

Agent Teamsはデフォルトで無効です。`settings.json` に以下を追加して有効化します。

```json:settings.json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

バージョンが要件を満たしているか確認しましょう。

```bash
claude --version
# v2.1.32 以降が必要
```

### 表示モードの選択

Agent Teamsには2つの表示モードがあります。

- **in-process（デフォルト）:** すべてのTeammateが1つのターミナル内で動作。`Shift+Down` でTeammate間を切り替え
- **split panes:** 各Teammateが独立したペインに表示。tmuxまたはiTerm2が必要

:::note info
split panesモードはVS Codeの統合ターミナルでは非対応です。tmuxまたはiTerm2環境で利用してください。
:::

表示モードを変更するには `~/.claude.json` を編集します。

```json:~/.claude.json
{
  "teammateMode": "in-process"
}
```

## 実践ワークフロー① — 並列コードレビュー

最初のパターンは、PRレビューを複数の視点から同時に実施するワークフローです。Agent Teamsの入門に最適で、コードを書かない読み取り専用のタスクなのでファイル競合のリスクがありません。

### プロンプト例

```text
Create an agent team to review PR #142. Spawn three reviewers:
- Security reviewer: focus on authentication, input validation, and injection vulnerabilities
- Performance reviewer: check for N+1 queries, unnecessary re-renders, and memory leaks
- Test coverage reviewer: verify edge cases, error paths, and integration test gaps
Have them each review independently, then share findings with each other
to identify any issues they missed.
```

### レビューの流れ

1. Team Leadが3人のTeammateを生成し、それぞれにレビュー観点を割り当てる
2. 各Teammateが独立してPRを分析する
3. 完了後、Teammate同士がメールボックスで発見を共有し、互いの指摘を検証する
4. Team Leadが全レビュー結果を統合してレポートを作成する

単一セッションのレビューでは、1つの観点に集中すると他の観点が手薄になりがちです。Agent Teamsなら、セキュリティ・パフォーマンス・テストカバレッジの3視点すべてに同じ深さで取り組めます。

## 実践ワークフロー② — 機能実装の並列化

レビューで並列化の効果を実感できたら、次は実装に挑戦しましょう。2つ目は、新機能の実装をフロントエンド・バックエンド・テストに分割して並列実装するパターンです。

### プロンプト例

```text
Create an agent team to implement a user notification feature.

Spawn three teammates:
- Backend developer: implement the notification API endpoints at src/api/notifications/.
  Create GET /notifications, POST /notifications/mark-read, and WebSocket events.
- Frontend developer: build the notification bell component at src/components/notifications/.
  Wait for the backend API spec before integrating.
- Test engineer: write integration tests at tests/notifications/.
  Start with API tests, then add E2E tests after both backend and frontend are ready.

Important: each teammate should only edit files in their assigned directory
to avoid conflicts.
```

### ファイル競合を防ぐタスク設計のコツ

Agent Teamsで最も注意すべきポイントは、**2人のTeammateが同じファイルを同時に編集するとどちらかの変更が上書きされる**ことです。

これを防ぐために、以下の原則を守りましょう。

- **ディレクトリ単位で担当を分ける:** 各Teammateが編集するディレクトリを明確に指定する
- **タスクの依存関係を設定する:** 「バックエンドAPIの完成後にフロントエンドの結合を開始」のように順序を指定する
- **共有ファイルの編集は1人に限定する:** ルーティング定義や設定ファイルなど、共有リソースの編集権限を1人のTeammateに集約する

## 実践ワークフロー③ — 競合仮説デバッグ

最後は、Agent Teamsの「議論・反証」能力が最も活きるユースケースです。原因不明のバグに対して複数の仮説を並列に調査するパターンを紹介します。

### プロンプト例

```text
Users report the app hangs after submitting a form. Spawn 4 teammates
to investigate different hypotheses:
- Hypothesis A: deadlock in the database transaction layer
- Hypothesis B: infinite loop in form validation middleware
- Hypothesis C: WebSocket connection leak causing resource exhaustion
- Hypothesis D: race condition in the session management

Have them investigate their hypothesis, but also actively try to
disprove each other's theories. Like a scientific debate, the theory
that survives scrutiny is most likely the root cause.
```

### なぜ並列調査が効果的なのか

単一セッションでデバッグすると、最初に見つけた「もっともらしい原因」に引きずられるアンカリングバイアスが発生します。Agent Teamsでは、各Teammateが独立した仮説を検証し、さらに互いの理論に反証を試みるため、真の原因に到達する確率が大幅に高まります。

## Hooksで品質ゲートを設ける

Agent Teamsには、Teammateの作業品質を制御するためのHookが3種類用意されています。

| Hook | 発火タイミング | 用途 |
|:--|:--|:--|
| `TeammateIdle` | Teammateが作業完了しアイドル状態になる時 | 追加作業の指示 |
| `TaskCreated` | タスクが新規作成される時 | 不適切なタスクの拒否 |
| `TaskCompleted` | タスクが完了マークされる時 | 品質チェックの強制 |

いずれのHookも、終了コード2を返すとフィードバックメッセージを送信してアクションを阻止できます。

たとえば、タスク完了時にテストの実行を強制するHookは以下のように設定します。

```json:settings.json
{
  "hooks": {
    "TaskCompleted": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "cd $PROJECT_DIR && npm test -- --bail 2>/dev/null || (echo 'Tests failed. Please fix failing tests before marking this task complete.' && exit 2)"
          }
        ]
      }
    ]
  }
}
```

:::note info
終了コード0で成功（タスク完了を許可）、終了コード2でフィードバック付き拒否（Teammateに修正を促す）です。
:::

このHookにより、テストが通らないままタスクが完了扱いになることを防げます。`TeammateIdle` フックを使えば、Teammateがアイドル状態になった際に「ドキュメント更新も忘れずに」といった追加指示を自動送信することも可能です。

## ベストプラクティスとコスト最適化

### チームサイズの目安

- **3〜5人**で始めるのが最適。これ以上増やしても調整コストが増え、効果が比例しない
- 1人あたり **5〜6タスク** が生産性のスイートスポット。タスクが少なすぎるとAgent Teamsのオーバーヘッドに見合わない

### CLAUDE.mdでTeammateに共通指示を渡す

Teammateはスポーン時にプロジェクトの `CLAUDE.md` を自動的に読み込みます。プロジェクト固有のルール（コーディング規約、ブランチ戦略、禁止事項など）を `CLAUDE.md` に記載しておけば、全Teammateに一貫した指示が行き渡ります。

### コスト意識

Agent Teamsのトークン消費は **チーム人数に比例** して増加します。以下の判断フローでAgent Teamsの利用可否を検討しましょう。

1. **並列実行に価値があるか？** → 順序的なタスクなら単一セッションを使う
2. **Teammate同士の通信が必要か？** → 不要ならサブエージェントの方が安い
3. **タスクが十分に独立しているか？** → 同じファイルを触る場合は単一セッションが安全

### よくある失敗パターンと対処法

| 問題 | 原因 | 対処法 |
|:--|:--|:--|
| Leadが自分でタスクを実行してしまう | Leadがタスク委譲より直接実行を選択 | `Wait for your teammates to complete their tasks before proceeding` と指示する |
| タスクのステータスが更新されない | Teammateが完了報告を怠る | Leadに `nudge the teammate` と依頼する。TaskCompletedフックで検知も可能 |
| ファイル競合で変更が消える | 複数Teammateが同一ファイルを編集 | ディレクトリ単位で担当を明確に分割する |
| Teammateが停止する | エラー発生後に回復できない | `Shift+Down` でTeammateを選択し、追加指示を送るか新しいTeammateを生成する |

## まとめ

- Agent Teamsは、**並列探索に価値があるタスク**で真価を発揮する機能です
- 3つのワークフローパターンを紹介しました
  - **並列コードレビュー:** 複数視点からの同時レビューで品質向上（入門に最適）
  - **機能実装の並列化:** ディレクトリ分割でファイル競合を防ぎつつ並列開発
  - **競合仮説デバッグ:** 互いに反証し合うことでアンカリングバイアスを排除
- Hooksを活用すれば、テスト実行の強制や追加タスクの自動指示で品質を担保できます
- まずは **並列コードレビューから小さく始めて**、チームの動きを掴んでからスケールアップすることをお勧めします

### 関連リソース

- [Agent Teams公式ドキュメント](https://code.claude.com/docs/en/agent-teams)
- [サブエージェント公式ドキュメント](https://code.claude.com/docs/en/sub-agents)
- [Hooks公式ドキュメント](https://code.claude.com/docs/en/hooks)
