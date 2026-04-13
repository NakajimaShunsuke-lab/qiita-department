---
title: 実務で使えるMCPサーバー入門 — FastMCP 3.xでSlack通知ツールを30分で作る【2026年最新】
tags:
  - Python
  - AI
  - MCP
  - 生成AI
  - ClaudeCode
private: false
updated_at: '2026-04-13T16:24:15+09:00'
id: 47cd7157ceffd4e49998
organization_url_name: null
slide: false
ignorePublish: false
---

## この記事でわかること

「MCPって面白そうだけど、天気APIのサンプルじゃ実務に使えない」と感じたことはありませんか？

この記事では、**FastMCP 3.x**（2026年4月時点の最新版 v3.2.3）を使って、Slack通知という**実業務ですぐ使えるMCPサーバー**を30分で作る手順を解説します。

既存のFastMCP入門記事が「基礎概念とサンプルAPIの実装」で終わりがちなのに対し、本記事では以下を追加でカバーします。

- PydanticモデルによるInput Validation
- 環境変数管理・エラーハンドリングの実践設計
- **AWS公式MCPサーバー（54種）の設計パターン**から学ぶセキュリティ原則
- Claude Codeからの呼び出し設定

**対象読者:** Pythonの基礎知識があり、MCPを試したいエンジニア（MCP未経験〜初級）
**前提知識:** Python基礎、`pip` / `uv` の使用経験。Slack APIの詳細知識は不要です
**ゴール:** FastMCP 3.xでSlack通知MCPサーバーを実装し、Claude Codeから呼び出せる状態にする

**検証環境:**

| 項目 | バージョン |
|------|-----------|
| Python | 3.12 |
| FastMCP | 3.2.3 |
| uv | 0.5.x |
| OS | macOS 14 / Windows 11 |

:::note info
本記事のサンプルコードはロジックの正確性を重視して記述しています。Slack APIのトークン取得やBot設定など、外部サービス固有の操作については適宜公式ドキュメントをご参照ください。
:::

---

## MCPとFastMCPを3分で理解する

### MCPとは

**MCP（Model Context Protocol）**は、AIアシスタントと外部ツール・サービスを繋ぐための標準プロトコルです。「AIのためのUSB-C規格」と表現されることが多く、一度MCPサーバーを作れば、対応するすべてのAIクライアント（Claude Code、Claude Desktop、Cursor等）から利用できます。

```text
[AI クライアント] ←── MCP ──→ [MCPサーバー] ←── API ──→ [Slack / Notion / AWS等]
```

2026年4月時点では、Anthropic・OpenAI・Microsoft・Googleの4大AIベンダーがすべてMCPを採用しており、MCPサーバーの数は10,000件を超えています。

### FastMCPとは

**FastMCP**は、MCPサーバーを数行のデコレータで実装できるPythonフレームワークです。

```python:simple_example.py
from fastmcp import FastMCP

mcp = FastMCP("my-server")

@mcp.tool
def greet(name: str) -> str:
    """指定した名前に挨拶を返す"""
    return f"こんにちは、{name}さん！"
```

これだけでMCP準拠のツールが完成します。型ヒントから自動的にJSONスキーマが生成されるため、スキーマの手書きが不要です。

FastMCP v1.0は2024年にMCP公式Python SDKに取り込まれ、現在は全MCPサーバーの**70%以上**がFastMCPをベースにしています。AWSも公式MCPサーバー群（54種）の実装にFastMCPを採用しています。

:::note warn
**v1.x/v2.xとv3.xのデコレータ構文の違い**
- v1.x/v2.x: `@mcp.tool()` — 括弧あり
- v3.x: `@mcp.tool` — 括弧なし

本記事はv3.x構文で記述しています。古い記事のコードをコピーする際はご注意ください。
:::

---

## 環境構築（5分）

### uvのインストール

Pythonパッケージマネージャは`uv`を推奨します。`pip`より高速で、仮想環境の管理も一体化されています。

```bash
# macOS / Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows（PowerShell）
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

### プロジェクトの初期化とFastMCPのインストール

```bash
# プロジェクトディレクトリを作成
mkdir slack-mcp-server && cd slack-mcp-server

# uvで仮想環境を初期化
uv init

# FastMCPと依存パッケージをインストール
uv add fastmcp httpx python-dotenv
```

### Slack Bot トークンの準備

1. [Slack API](https://api.slack.com/apps) でアプリを作成する
2. **OAuth & Permissions** で以下のBot Token Scopeを追加する
   - `chat:write`（メッセージ投稿）
   - `channels:read`（チャンネル一覧取得）
3. アプリをワークスペースにインストールし、**Bot User OAuth Token**（`xoxb-`で始まるトークン）を取得する

取得したトークンは`.env`ファイルで管理します。

```text:.env
SLACK_BOT_TOKEN=xoxb-your-token-here
SLACK_DEFAULT_CHANNEL=#general
```

:::note alert
Slack Bot Tokenは絶対にソースコードにハードコードしないでください。`.gitignore`に`.env`を追加することも忘れずに。
:::

```text:.gitignore
.env
__pycache__/
.venv/
```

---

## 最初のMCPサーバーを作る（10分）

FastMCP 3.xでSlack通知ツールを実装します。まず最小限の動くコードから始めましょう。

```python:slack_mcp_server.py
import os
import httpx
from dotenv import load_dotenv
from fastmcp import FastMCP

# .envファイルから環境変数を読み込む
load_dotenv()

# MCPサーバーを初期化
mcp = FastMCP("slack-notifier")

SLACK_API_URL = "https://slack.com/api/chat.postMessage"


@mcp.tool
def send_slack_notification(
    message: str,
    channel: str = "",
) -> str:
    """
    Slackチャンネルにメッセージを通知する。

    Args:
        message: 送信するメッセージ内容
        channel: 送信先チャンネル（例: #general）。省略時はデフォルトチャンネルを使用

    Returns:
        送信結果のメッセージ
    """
    token = os.environ["SLACK_BOT_TOKEN"]
    target_channel = channel or os.environ.get("SLACK_DEFAULT_CHANNEL", "#general")

    response = httpx.post(
        SLACK_API_URL,
        headers={"Authorization": f"Bearer {token}"},
        json={"channel": target_channel, "text": message},
    )
    data = response.json()

    if data.get("ok"):
        return f"メッセージを {target_channel} に送信しました"
    else:
        return f"送信失敗: {data.get('error', 'unknown error')}"


if __name__ == "__main__":
    mcp.run()
```

### 動作確認

```bash
# サーバーを起動して動作確認
uv run python slack_mcp_server.py
```

MCP Inspectorを使うとブラウザ上でツールを直接テストできます。

```bash
npx @modelcontextprotocol/inspector uv run python slack_mcp_server.py
```

ブラウザで `http://localhost:5173` を開き、`send_slack_notification`ツールを選択してメッセージを入力するとSlackに通知が届きます。

---

## Claude Codeから呼び出す（5分）

作成したMCPサーバーをClaude Codeに接続します。

プロジェクトの`.claude/settings.json`に以下を追記します。

```json:.claude/settings.json
{
  "mcpServers": {
    "slack-notifier": {
      "command": "uv",
      "args": [
        "run",
        "--directory",
        "/path/to/slack-mcp-server",
        "python",
        "slack_mcp_server.py"
      ],
      "env": {
        "SLACK_BOT_TOKEN": "${SLACK_BOT_TOKEN}",
        "SLACK_DEFAULT_CHANNEL": "${SLACK_DEFAULT_CHANNEL}"
      }
    }
  }
}
```

`/path/to/slack-mcp-server`は実際のプロジェクトパスに変更してください。

設定後、Claude Codeを再起動するとツールが認識されます。Claude Codeのチャットで以下のように指示すると動作します。

```text
#general チャンネルに「デプロイが完了しました」と通知して
```

:::note info
**ツールが認識されない場合の確認ポイント**
- `uv run python slack_mcp_server.py` を手動実行してエラーがないか確認する
- `settings.json`のパスが正しいか確認する（絶対パス推奨）
- Claude Codeを完全に再起動する
:::

---

## 実装を実務レベルに磨く（10分）

基本実装が動いたら、本番品質に引き上げます。Pydanticモデルによる入力バリデーション、エラーハンドリング、ログ設計を追加します。

```python:slack_mcp_server_prod.py
import logging
import os
from typing import Literal

import httpx
from dotenv import load_dotenv
from fastmcp import FastMCP
from pydantic import BaseModel, Field, field_validator

load_dotenv()
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

mcp = FastMCP("slack-notifier")

SLACK_API_URL = "https://slack.com/api/chat.postMessage"
REQUEST_TIMEOUT = 10.0  # 秒


class SlackNotificationInput(BaseModel):
    """Slack通知の入力モデル"""

    message: str = Field(
        ...,
        min_length=1,
        max_length=3000,
        description="送信するメッセージ内容（最大3000文字）",
    )
    channel: str = Field(
        default="",
        description="送信先チャンネル（例: #general）。省略時はデフォルトチャンネルを使用",
    )
    severity: Literal["info", "warn", "alert"] = Field(
        default="info",
        description="メッセージの重要度。アイコンの絵文字に反映される",
    )

    @field_validator("channel")
    @classmethod
    def validate_channel(cls, v: str) -> str:
        if v and not v.startswith("#") and not v.startswith("C"):
            raise ValueError("チャンネルは '#channel-name' または チャンネルIDの形式で指定してください")
        return v


SEVERITY_EMOJI = {"info": "ℹ️", "warn": "⚠️", "alert": "🚨"}


@mcp.tool
def send_slack_notification(input: SlackNotificationInput) -> str:
    """
    Slackチャンネルにメッセージを通知する。

    Returns:
        送信結果のメッセージ
    """
    token = os.environ.get("SLACK_BOT_TOKEN")
    if not token:
        raise RuntimeError("SLACK_BOT_TOKEN が設定されていません")

    target_channel = input.channel or os.environ.get("SLACK_DEFAULT_CHANNEL", "#general")
    emoji = SEVERITY_EMOJI[input.severity]
    formatted_message = f"{emoji} {input.message}"

    logger.info("Slack通知送信: channel=%s severity=%s", target_channel, input.severity)

    try:
        response = httpx.post(
            SLACK_API_URL,
            headers={"Authorization": f"Bearer {token}"},
            json={"channel": target_channel, "text": formatted_message},
            timeout=REQUEST_TIMEOUT,
        )
        response.raise_for_status()
        data = response.json()
    except httpx.TimeoutException:
        logger.error("Slack API タイムアウト")
        raise RuntimeError("Slack APIがタイムアウトしました。しばらく後に再試行してください")
    except httpx.HTTPStatusError as e:
        logger.error("Slack API HTTPエラー: %s", e)
        raise RuntimeError(f"Slack APIエラー: {e.response.status_code}")

    if not data.get("ok"):
        error = data.get("error", "unknown")
        logger.error("Slack送信失敗: %s", error)
        raise RuntimeError(f"Slack送信失敗: {error}")

    logger.info("Slack通知送信成功: ts=%s", data.get("ts"))
    return f"メッセージを {target_channel} に送信しました（ts: {data.get('ts')}）"


if __name__ == "__main__":
    mcp.run()
```

**本番版のポイントまとめ:**

| 改善点 | 実装内容 |
|--------|---------|
| 入力バリデーション | Pydanticモデルで文字数・形式を検証 |
| エラーハンドリング | タイムアウト・HTTPエラーを個別に捕捉 |
| ログ設計 | 呼び出し・成功・失敗をすべて記録 |
| 環境変数チェック | 起動時ではなく呼び出し時にトークンを検証 |
| メッセージ装飾 | 重要度をアイコンで視覚化 |

---

## AWS公式MCPサーバーから学ぶ設計パターン

AWSは2026年4月に54種のオープンソースMCPサーバーを公開しました。これらを参照すると、実務品質のMCPサーバー設計に共通するパターンが見えてきます。

### 原則1: ツールのスコープを最小限に絞る

AWS公式サーバーは機能別に細かく分割されています。「Slackの全操作を1サーバーで」ではなく、「通知専用」「チャンネル管理専用」のように役割を絞ることで、AIが誤ったツールを呼び出すリスクを減らせます。

### 原則2: 読み取り専用から始める

書き込み・削除系の操作は誤呼び出しの影響が大きいため、最初は読み取り専用ツール（チャンネル一覧取得など）から実装し、動作確認後に書き込み系を追加するのがAWS公式の設計思想です。

### 原則3: ツールの説明文（docstring）で呼び出し条件を明示する

MCPクライアント（Claude等）はdocstringを読んでツールを選択します。「どのような状況で使うか」「何を渡すか」を明示することで、AIの誤呼び出しを防げます。

```python:docstring_example.py
@mcp.tool
def send_slack_notification(input: SlackNotificationInput) -> str:
    """
    Slackチャンネルに通知メッセージを送信する。

    このツールは以下の状況で使用する:
    - タスク完了・デプロイ完了の通知
    - エラー・障害のアラート通知
    - 定期レポートの配信

    注意: このツールはメッセージ送信のみ。
    チャンネル作成・削除には別ツールを使用すること。
    """
```

---

## 発展: 複数ツールとリソースの追加

MCPサーバーには複数のツールと「リソース」を追加できます。

```python:slack_mcp_server_extended.py
from fastmcp import FastMCP
import httpx, os
from dotenv import load_dotenv

load_dotenv()
mcp = FastMCP("slack-notifier")


@mcp.tool
def send_slack_notification(message: str, channel: str = "") -> str:
    """Slackにメッセージを送信する"""
    # ... 前述の実装


@mcp.tool
def list_slack_channels() -> list[dict]:
    """
    参加済みSlackチャンネルの一覧を取得する。
    どのチャンネルに通知を送るか判断する際に使用する。
    """
    token = os.environ["SLACK_BOT_TOKEN"]
    response = httpx.get(
        "https://slack.com/api/conversations.list",
        headers={"Authorization": f"Bearer {token}"},
        params={"types": "public_channel,private_channel", "limit": 100},
        timeout=10.0,
    )
    data = response.json()
    if not data.get("ok"):
        raise RuntimeError(f"チャンネル一覧取得失敗: {data.get('error')}")
    return [
        {"id": ch["id"], "name": ch["name"], "is_private": ch.get("is_private", False)}
        for ch in data.get("channels", [])
    ]


@mcp.resource("slack://workspace/info")
def get_workspace_info() -> str:
    """ワークスペース情報（デフォルトチャンネル等）をコンテキストとして提供する"""
    return f"デフォルト通知先: {os.environ.get('SLACK_DEFAULT_CHANNEL', '#general')}"
```

**`@mcp.resource`との使い分け:**

| デコレータ | 用途 | 呼び出しタイミング |
|-----------|------|-----------------|
| `@mcp.tool` | 副作用を伴う操作（送信・更新） | AIが明示的に呼び出す |
| `@mcp.resource` | 参照情報の提供（設定・状態） | AIがコンテキストとして参照 |

---

## まとめ

FastMCP 3.xを使ったSlack通知MCPサーバーの実装を通じて、以下を学びました。

- **FastMCP 3.xの基本**: `@mcp.tool`デコレータと型ヒントだけでMCP準拠ツールが完成する
- **実務品質への引き上げ**: Pydanticモデル・エラーハンドリング・ログ設計の3点セット
- **Claude Code連携**: `settings.json`の`mcpServers`設定で即座に利用可能
- **AWS公式設計パターン**: スコープ最小化・読み取り優先・docstring明示の3原則
- **ツールとリソースの使い分け**: 副作用ありは`@mcp.tool`、参照情報は`@mcp.resource`

### 次のステップ

- **HTTP/SSEトランスポート対応**: `mcp.run(transport="streamable-http")` でリモートアクセス可能なサーバーへ
- **本番デプロイ**: Docker化してEC2・Cloud Runへデプロイ、複数クライアントからの共有利用
- **サーバー合成**: `FastMCP.compose()` で複数のMCPサーバーを1つに統合する

### 参考リンク

- [FastMCP 公式GitHub](https://github.com/jlowin/fastmcp) — v3.2.3ソースコード・ドキュメント
- [FastMCP 公式ドキュメント](https://gofastmcp.com) — フル機能リファレンス
- [AWS公式MCPサーバーリスト（2026年4月）](https://blog.supica.work/entry/aws-mcp-server-list-2026-04-01) — 54種の設計パターン参考
- [MCP公式仕様](https://modelcontextprotocol.io) — プロトコル仕様書
