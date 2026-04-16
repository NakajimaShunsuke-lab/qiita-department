# 企画書: AIエージェントフレームワーク徹底比較2026

## 基本情報
- テーマ: AIエージェントフレームワーク徹底比較2026
- ターゲット: AIエージェント開発に興味がある中級エンジニア（TypeScript/Pythonいずれかの経験者）
- 難易度: 中級
- 推定文字数: 4,500〜5,500文字（コードブロック除く）

## 記事タイトル案
1. AIエージェントフレームワーク徹底比較2026 — Mastra・LangGraph・OpenAI Agents SDK・Claude Agent SDK、現場で使って分かった選び方
2. 4大AIエージェントフレームワーク実践比較2026 — コード付きで分かる最適な選び方
3. AIエージェント開発、どのフレームワークを選ぶ？ — 2026年4大FWを実コードで比較

→ 採用: タイトル案1（自チームAIコーディングツール比較記事と同じ「徹底比較」＋「現場で使って分かった」パターン）

## 推奨タグ
- AI, AIエージェント, TypeScript, Python, 生成AI

## 見出し構成案

### H2: この記事で分かること（導入）
- 対象読者: AIエージェント開発を始めたい/フレームワーク選定中の中級エンジニア
- 前提知識: Python or TypeScriptの基本、LLM APIの概念理解
- ゴール: 4大フレームワークの特徴を理解し、自分のユースケースに合った選択ができるようになる
- 接続文設計: 「2026年はAIエージェント元年とも呼ばれ、フレームワーク選定が開発の成否を分けます。本記事では4大FWを実コードで比較します」

### H2: 比較対象の4フレームワーク
- 4つのFWの概要を紹介する表（名前・開発元・言語・リリース時期・特徴を一言で）
  - Mastra: TypeScript特化、Gatsby開発チーム、1.0（2026年1月）
  - LangGraph: グラフベース状態管理、LangChain Inc.、v1.0 GA（2025年10月）
  - OpenAI Agents SDK: 軽量Python、OpenAI、2025年3月〜
  - Claude Agent SDK: Claude Code as library、Anthropic、Python v0.1.59 / TS v0.2.71
- 接続文設計: 「まず全体像を把握した上で、4つの比較軸で詳しく見ていきましょう」

### H2: 比較1 — エージェント定義（最小コード）
- 各FWの最小エージェント定義コードを並列表示
  - Mastra: `new Agent({ id, name, instructions, model })` (TypeScript)
  - LangGraph: `StateGraph` + ノード/エッジ定義 (Python)
  - OpenAI Agents SDK: `Agent(name, instructions)` (Python)
  - Claude Agent SDK: `query(prompt, options)` (Python/TypeScript)
- 比較表: コード行数、宣言的 vs 命令的、型安全性、学習コスト
- 接続文設計: 「エージェントの定義方法が分かったところで、次はツール連携の違いを見ていきましょう」

### H2: 比較2 — ツール連携（カスタムツールの作り方）
- 各FWの天気取得ツール定義コードを並列表示（統一題材で比較）
  - Mastra: `createTool({ id, description, inputSchema: z.object(...), execute })` (TypeScript/Zod)
  - LangGraph: `@tool` デコレータ + docstring (Python)
  - OpenAI Agents SDK: `@function_tool` デコレータ (Python)
  - Claude Agent SDK: `@tool` デコレータ + `create_sdk_mcp_server` (Python)
- 比較表: スキーマ定義方式、バリデーション、エラーハンドリング
- 接続文設計: 「ツールの定義ができたら、次は複数エージェントの協調パターンを比較します」

### H2: 比較3 — マルチエージェント（委譲パターン）
- 各FWのマルチエージェント設計を比較
  - Mastra: マルチエージェント + ワークフローで明示的な制御フロー
  - LangGraph: StateGraph上のノード間遷移で状態を共有
  - OpenAI Agents SDK: Handoff / Agent-as-Tool の2パターン
  - Claude Agent SDK: Subagent定義（AgentDefinition）で専門エージェントを委譲
- 比較表: 委譲パターン、状態共有、並列実行、デバッグ容易性
- 接続文設計: 「マルチエージェントの実装方法が分かったところで、2026年の重要トピックであるMCP対応状況を確認しましょう」

### H2: 比較4 — MCP対応と外部連携
- 各FWのMCP（Model Context Protocol）対応状況を比較
  - Mastra: MCPサーバーからツールロード可能
  - LangGraph: MCP経由でClaude/VSCode等と接続可能
  - OpenAI Agents SDK: ビルトインMCPサーバーツール統合
  - Claude Agent SDK: ネイティブMCPサポート（mcp_servers設定）
- 比較表: MCP対応レベル（ネイティブ/アダプタ/なし）、MCPサーバー設定方法

### H2: 総合比較表（一目で分かる選び方）
- 全比較軸を1つの総合表にまとめる
  - 行: 4つのFW
  - 列: 言語、エージェント定義、ツール連携、マルチエージェント、MCP対応、学習コスト、エコシステム、本番実績
- :::note info で「この表を保存しておくと、チームでのFW選定会議で役立ちます」

### H2: ユースケース別おすすめ
- 3〜4つのユースケースシナリオで「このケースならこのFW」を推奨
  - TypeScript Webアプリに組み込む → Mastra
  - 複雑な状態管理・条件分岐が必要 → LangGraph
  - OpenAI API中心で軽量に始めたい → OpenAI Agents SDK
  - Claude Code資産を活かして本番自動化 → Claude Agent SDK
- 接続文設計: 「最後に、本記事のポイントをまとめます」

### H2: まとめ
- 4大FWの特徴を箇条書きで要約
- 「正解は1つではなく、ユースケースに合わせて選ぶ」というメッセージ
- 各FWの公式ドキュメントリンクを参考資料として提示

## サンプルコード要件
- コード1: Mastraのエージェント定義 — TypeScript — 最小構成でエージェントを作成
- コード2: LangGraphのエージェント定義 — Python — StateGraphベースの基本構成
- コード3: OpenAI Agents SDKのエージェント定義 — Python — Agent + Runner
- コード4: Claude Agent SDKのエージェント定義 — Python — query() + オプション
- コード5: Mastraのツール定義 — TypeScript — createTool + Zodスキーマ
- コード6: LangGraphのツール定義 — Python — @toolデコレータ
- コード7: OpenAI Agents SDKのツール定義 — Python — @function_tool
- コード8: Claude Agent SDKのツール定義 — Python — @tool + create_sdk_mcp_server
- コード9: OpenAI Agents SDKのHandoff — Python — Agent間のhandoff設定
- コード10: Claude Agent SDKのSubagent — Python — AgentDefinition

## 差別化ポイント
- 既存Qiita比較記事（LangGraph・CrewAI・MS Agent Framework）とはカバーするFWが異なる（Mastra・Claude Agent SDKを含む）
- 概要比較ではなく、統一題材（天気取得ツール等）での実コード並列比較
- 比較表を5つ以上配置し、深読みを促す構成（前回記事GA滞在90.4秒の再現）
- 各FWのコードを「同じタスク」で比較するため、違いが一目瞭然
- ユースケース別の具体的な推奨でアクショナブル

## 参考URL
- Mastra公式: https://mastra.ai/docs
- LangGraph公式: https://docs.langchain.com/oss/python/langgraph/overview
- OpenAI Agents SDK: https://openai.github.io/openai-agents-python/
- Claude Agent SDK: https://code.claude.com/docs/en/agent-sdk/overview
- Claude Agent SDK GitHub (Python): https://github.com/anthropics/claude-agent-sdk-python
- Mastra GitHub: https://github.com/mastra-ai/mastra
- AIエージェントFW選定2026（Qiita既存記事）: https://qiita.com/kai_kou/items/20deef9f7691c5af668b

## 注意事項
- タグに TypeScript と Python の両方を含めているため、コード例も両言語をバランスよく配置する
- バージョン情報は2026年4月時点の最新を明記する（Mastra 1.0、LangGraph v1.0 GA、Claude Agent SDK Python v0.1.59）
- 「現場で使って分かった」というタイトルに対し、各FWのDX（開発体験）の率直な評価を含める
- セクション間の接続文を企画段階から設計済み（レビュー教訓より）
- 各コード例は自己完結するよう、import文から記載する（レビュー教訓より）
- コードブロックには必ず言語指定を付与する（`typescript`/`python`）
