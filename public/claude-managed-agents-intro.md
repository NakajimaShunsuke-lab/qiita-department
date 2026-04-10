---
title: 'Claude Managed Agents入門 — 3つのAPIコールでAIエージェントを本番デプロイする'
tags:
  - 'AI'
  - 'ClaudeCode'
  - 'AIエージェント'
  - 'Python'
  - '生成AI'
private: false
updated_at: ''
id: null
organization_url_name: null
slide: false
ignorePublish: false
---

## この記事で得られること

Claude Managed Agentsは、2026年4月にAnthropicがパブリックベータとして公開した**クラウドホスト型のAIエージェント実行基盤**です。自前でエージェントループやサンドボックスを構築することなく、3つのAPIコールだけでAIエージェントを本番デプロイできます。

この記事では、Claude Managed Agentsの仕組みを理解し、実際にエージェントを作成・デプロイするまでの手順を解説します。最後に実践ユースケースとして「社内FAQ Bot」を構築する例も紹介します。

- **対象読者:** AIエージェントを業務に導入したいエンジニア（Python基礎知識あり）
- **前提知識:** Claude APIの基本的な使い方、Python 3.10以上
- **ゴール:** Managed Agentsの仕組みを理解し、エージェントを作成・実行できるようになる

:::note info
Claude Managed Agentsは2026年4月時点でパブリックベータです。API仕様は今後変更される可能性があります。
:::

## Claude Managed Agentsとは何か

Claude Managed Agentsは、従来のMessages APIとは異なるアプローチでClaudeを活用するサービスです。一言でいえば、**エージェント実行に必要なインフラをAnthropicが丸ごと管理してくれる仕組み**です。

Messages APIとの違いを整理します。

| 比較項目 | Messages API | Claude Managed Agents |
|:--|:--|:--|
| 役割 | モデルへの直接プロンプティング | エージェント実行基盤の提供 |
| エージェントループ | 自前で構築が必要 | Anthropic側で管理 |
| ツール実行 | 自前でサンドボックスを用意 | クラウドコンテナで自動実行 |
| 向いている用途 | カスタムエージェント、細かい制御 | 長時間タスク、非同期ワーク |
| インフラ管理 | 開発者が担当 | Anthropicが担当 |

Managed Agentsは**4つのコアコンセプト**で構成されています。

| コンセプト | 役割 |
|:--|:--|
| **Agent** | モデル、システムプロンプト、利用ツール、MCPサーバーの定義 |
| **Environment** | エージェントが動作するクラウドコンテナの設定（パッケージ、ネットワーク） |
| **Session** | 特定タスクを実行するエージェントのインスタンス |
| **Events** | アプリケーションとエージェント間でやり取りするメッセージ |

流れとしては、「Agentを定義 → Environmentを設定 → Sessionを起動 → Eventsでやり取り」というステップになります。

## セットアップ: SDKとCLIの導入

このセクションでは、Managed Agentsを利用するために必要なPython SDKとAPIキーの設定を行います。

### Python SDKのインストール

```bash
pip install anthropic
```

### APIキーの設定

```bash
export ANTHROPIC_API_KEY="your-api-key-here"
```

APIキーは[Claude Console](https://console.anthropic.com/)から取得できます。

### ant CLI（オプション）

Anthropicは`ant`というCLIツールも提供しています。ブラウザやコードエディタを開かずにターミナルからエージェントを管理できます。

```bash
# macOS（Homebrew）
brew install anthropics/tap/ant

# インストール確認
ant --version
```

:::note info
ant CLIはオプションです。この記事ではPython SDKを中心に解説しますが、CLIでの操作例も併記します。
:::

## 3ステップで始めるManaged Agents

SDKの準備ができたら、いよいよエージェントを作成します。Managed Agentsの起動に必要なのは、たった3つのAPIコールです。順番に見ていきましょう。

:::note warn
すべてのManaged Agents APIリクエストには `managed-agents-2026-04-01` ベータヘッダーが必要です。Python SDKを使う場合はSDKが自動で付与するため、意識する必要はありません。
:::

### ステップ1: エージェントの作成

まず、エージェントの「頭脳」を定義します。モデル、システムプロンプト、利用可能なツールを指定します。

```python:create_agent.py
from anthropic import Anthropic

client = Anthropic()

agent = client.beta.agents.create(
    name="Coding Assistant",
    model="claude-sonnet-4-6",
    system="You are a helpful coding assistant. Write clean, well-documented code.",
    tools=[
        {"type": "agent_toolset_20260401"},
    ],
)

print(f"Agent ID: {agent.id}, version: {agent.version}")
```

`agent_toolset_20260401`を指定すると、bash実行・ファイル操作・Web検索など、エージェントに必要なツール一式が有効になります。

<details><summary>ant CLIでの操作例</summary>

```bash
ant beta:agents create \
  --name "Coding Assistant" \
  --model '{id: claude-sonnet-4-6}' \
  --system "You are a helpful coding assistant. Write clean, well-documented code." \
  --tool '{type: agent_toolset_20260401}'
```

</details>

返却される`agent.id`は以降のすべての操作で使用するため、保存しておきます。

### ステップ2: 環境の作成

次に、エージェントが動作するクラウドコンテナの設定を行います。

```python:create_environment.py
from anthropic import Anthropic

client = Anthropic()

environment = client.beta.environments.create(
    name="quickstart-env",
    config={
        "type": "cloud",
        "networking": {"type": "unrestricted"},
    },
)

print(f"Environment ID: {environment.id}")
```

`networking`を`unrestricted`に設定すると、エージェントは外部ネットワークにアクセスできます。本番環境ではアクセス先を制限することも可能です。

### ステップ3: セッションの起動とストリーミング

Agentとenvironmentが準備できたら、セッションを起動してタスクを実行します。

```python:run_session.py
from anthropic import Anthropic

client = Anthropic()

# エージェントIDと環境IDは事前に作成したものを使用
AGENT_ID = "agent_01..."      # ステップ1で取得したID
ENVIRONMENT_ID = "env_01..."   # ステップ2で取得したID

# セッションを作成
session = client.beta.sessions.create(
    agent=AGENT_ID,
    environment_id=ENVIRONMENT_ID,
    title="Quickstart session",
)

# ストリームを開いてメッセージを送信
with client.beta.sessions.events.stream(session.id) as stream:
    client.beta.sessions.events.send(
        session.id,
        events=[
            {
                "type": "user.message",
                "content": [
                    {
                        "type": "text",
                        "text": "Pythonでフィボナッチ数列の最初の20項を生成し、fibonacci.txtに保存してください",
                    },
                ],
            },
        ],
    )

    # イベントをリアルタイムで処理
    for event in stream:
        match event.type:
            case "agent.message":
                for block in event.content:
                    print(block.text, end="")
            case "agent.tool_use":
                print(f"\n[ツール実行: {event.name}]")
            case "session.status_idle":
                print("\n\nエージェント完了。")
                break
```

実行すると、以下のような出力が得られます。

```text
Pythonスクリプトを作成してフィボナッチ数列を生成します。
[ツール実行: write]
[ツール実行: bash]
スクリプトの実行が完了しました。出力ファイルを確認します。
[ツール実行: bash]
fibonacci.txtに最初の20項（0から4181まで）が保存されました。

エージェント完了。
```

エージェントが自律的にコードを書き、実行し、結果を検証するまでの一連の流れが、**わずか3つのAPIコール**（Agent作成 → Environment作成 → Session起動）で実現できていることがわかります。

## 実践: 社内FAQ Botを作ってみる

基本を押さえたところで、より実践的なユースケースを構築してみましょう。ここでは、社内ドキュメントを読み込んで質問に回答する「社内FAQ Bot」を作成します。

```python:faq_bot.py
from anthropic import Anthropic

client = Anthropic()

# FAQ対応に特化したエージェントを作成
faq_agent = client.beta.agents.create(
    name="Internal FAQ Bot",
    model="claude-sonnet-4-6",
    system="""あなたは社内FAQ対応ボットです。以下のルールに従ってください:
- /docs ディレクトリ内のドキュメントを参照して回答する
- ドキュメントに記載がない質問には「該当する情報が見つかりませんでした」と回答する
- 回答には必ず参照元のファイル名を記載する
- 日本語で簡潔に回答する""",
    tools=[
        {"type": "agent_toolset_20260401"},
    ],
)

# ドキュメント参照用の環境を作成
faq_env = client.beta.environments.create(
    name="faq-env",
    config={
        "type": "cloud",
        "networking": {"type": "restricted"},  # 外部アクセス不要
    },
)

def ask_faq(question: str) -> str:
    """FAQ Botに質問を送信し、回答を取得する"""
    session = client.beta.sessions.create(
        agent=faq_agent.id,
        environment_id=faq_env.id,
        title=f"FAQ: {question[:50]}",
    )

    result_text = ""

    with client.beta.sessions.events.stream(session.id) as stream:
        client.beta.sessions.events.send(
            session.id,
            events=[
                {
                    "type": "user.message",
                    "content": [{"type": "text", "text": question}],
                },
            ],
        )

        for event in stream:
            match event.type:
                case "agent.message":
                    for block in event.content:
                        result_text += block.text
                case "session.status_idle":
                    break

    return result_text


# 使用例
answer = ask_faq("有給休暇の申請方法を教えてください")
print(answer)
```

ポイントは以下の3つです。

1. **システムプロンプトでスコープを限定**: `/docs`ディレクトリ内のドキュメントのみを参照するよう指示し、ハルシネーションを抑制しています
2. **ネットワークを制限**: 社内情報を扱うため`restricted`に設定し、外部への情報漏洩を防いでいます
3. **セッション単位の質問対応**: 質問ごとにセッションを作成することで、会話の混在を防いでいます

:::note warn
本サンプルでは簡略化のためドキュメントのマウント処理を省略しています。実際の運用ではEnvironment作成時にファイルマウントの設定が必要です。詳細は[公式ドキュメント](https://platform.claude.com/docs/en/managed-agents/environments)を参照してください。
:::

## 知っておきたい料金と制限

Managed Agentsの料金は「トークン料金 + 実行時間課金（$0.08/分）」の2本立てです。以下に詳細を整理します。

| 項目 | 内容 |
|:--|:--|
| トークン料金 | 使用モデルの通常料金が適用される |
| 実行時間課金 | $0.08/分（コンテナ実行時間） |
| レート制限（作成系） | 60リクエスト/分 |
| レート制限（読み取り系） | 600リクエスト/分 |

コストを抑えるためのTipsを紹介します。

- **セッションの再利用**: 関連する複数の質問は同一セッション内で処理する（コンテナ起動コストを削減）
- **適切なモデル選択**: 簡単なタスクには`claude-haiku-4-5`を使用する（トークン単価が低い）
- **タイムアウト設定**: 長時間実行を防ぐため、アプリケーション側でタイムアウトを設定する

## Messages API・Claude Codeとの使い分け

「Managed Agentsと他のサービスのどちらを使えばよいか」を判断するための比較表です。

| 比較項目 | Messages API | Managed Agents | Claude Code |
|:--|:--|:--|:--|
| 制御の粒度 | 高い（自由に設計） | 中程度（設定で制御） | 低い（対話的に操作） |
| インフラ管理 | 開発者が全て担当 | Anthropicが管理 | 不要（ローカル実行） |
| 主なユースケース | カスタムAIアプリ | 長時間タスクの自動化 | 開発者の日常作業支援 |
| 実行時間 | 短い（リクエスト単位） | 長い（数分〜数時間） | 対話的（リアルタイム） |
| サンドボックス | 自前で用意 | クラウドコンテナ提供 | ローカル環境 |
| 適したチーム | バックエンドエンジニア | プロダクトチーム全般 | 個人開発者 |

**判断の目安:**

- **APIレスポンスの組み込みやカスタムロジックが必要** → Messages API
- **長時間のタスクをクラウドで自律実行させたい** → Managed Agents
- **ローカルの開発作業を効率化したい** → Claude Code

## まとめ

Claude Managed Agentsの要点を整理します。

- **3つのAPIコール**（Agent作成 → Environment作成 → Session起動）だけでAIエージェントを本番デプロイできる
- Agent・Environment・Session・Eventsの**4つのコアコンセプト**で構成されている
- bash実行、ファイル操作、Web検索など**ツール一式がビルトイン**で提供される
- 料金はトークン料金 + 実行時間課金（**$0.08/分**）
- 2026年4月時点で**パブリックベータ**（マルチエージェント・メモリ機能はリサーチプレビュー）

Managed Agentsは「エージェントの動作ロジックに集中し、インフラは任せる」という選択肢を提供してくれます。まずはクイックスタートのコードを動かし、自分のユースケースに合うかどうかを試してみてください。

**参考リンク:**

- [Claude Managed Agents 公式ドキュメント](https://platform.claude.com/docs/en/managed-agents/overview)
- [クイックスタートガイド](https://platform.claude.com/docs/en/managed-agents/quickstart)
- [公式ブログ: Claude Managed Agents](https://claude.com/blog/claude-managed-agents)
