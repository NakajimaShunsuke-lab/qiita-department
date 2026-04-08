---
title: Viteの概要と基本概念を理解しよう
tags:
  - フロントエンド
  - ビルドツール
  - vite
private: false
updated_at: '2025-11-19T10:20:00+09:00'
id: dd84a48d6dfc25d2e9ba
organization_url_name: cnctor
slide: false
ignorePublish: false
---
# Viteの概要と基本概念を理解しよう

Viteは、モダンなフロントエンド開発のための次世代ビルドツールです。従来のビルドツールと比較して、開発サーバーの起動が非常に高速で、ホットモジュールリプレースメント（HMR）も瞬時に反映される特徴があります。
本記事では、Viteの基本概念と特徴について詳しくまとめました。

## Viteとは

Vite（フランス語で「速い」という意味）は、Evan You（Vue.jsの作者）によって開発された、モダンなフロントエンド開発のためのビルドツールです。
従来のWebpackやRollupなどのビルドツールとは異なるアプローチで、開発体験を大幅に向上させます。

### 主な特徴

- **超高速な開発サーバー**: ネイティブESMを活用した即座の起動
- **瞬時のHMR**: 変更が即座に反映されるホットモジュールリプレースメント
- **最適化されたビルド**: 本番環境ではRollupを使用した最適化されたバンドル
- **豊富なテンプレート**: Vue、React、Svelte、Vanilla JSなどに対応
- **TypeScriptサポート**: 設定不要でTypeScriptをサポート
- **プラグインエコシステム**: 豊富なプラグインで機能拡張が可能

## Viteの基本概念

### 1. 開発サーバーとプロダクションビルドの分離

Viteは、開発時と本番ビルド時で異なるアプローチを取ります。

**開発時**:
- ネイティブESM（ES Modules）を直接ブラウザに提供
- 依存関係は事前にバンドル（esbuildを使用）
- ソースコードは必要に応じて変換

**本番ビルド時**:
- Rollupを使用した最適化されたバンドル
- コード分割、ツリーシェイキング、ミニファイなど

### 2. ネイティブESMの活用

Viteは、モダンブラウザのネイティブESMサポートを活用します。

```javascript
// 開発時、ブラウザが直接ESMを読み込む
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
```

### 3. 依存関係の事前バンドル

開発サーバー起動時に、`node_modules`内の依存関係をesbuildで事前にバンドルします。
これにより、開発サーバーの起動が高速化されます。

## プロジェクトの作成

Viteプロジェクトは、公式のスキャフォールディングツールで簡単に作成できます。

### Vueプロジェクトの作成

```bash
npm create vite@latest my-vue-app -- --template vue
cd my-vue-app
npm install
npm run dev
```

### Reactプロジェクトの作成

```bash
npm create vite@latest my-react-app -- --template react
cd my-react-app
npm install
npm run dev
```

### TypeScriptテンプレート

```bash
npm create vite@latest my-app -- --template vue-ts
npm create vite@latest my-app -- --template react-ts
```

## ディレクトリ構造

Viteプロジェクトの典型的なディレクトリ構造は以下の通りです。

```
project/
├── public/          # 静的ファイル
├── src/             # ソースコード
│   ├── assets/      # アセット（画像、CSSなど）
│   ├── components/  # コンポーネント
│   ├── App.vue      # ルートコンポーネント
│   └── main.js      # エントリーポイント
├── index.html       # HTMLエントリーポイント
├── vite.config.js   # Vite設定ファイル
└── package.json
```

## 設定ファイル

### vite.config.js

Viteの設定は`vite.config.js`（または`vite.config.ts`）で行います。

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  
  // 開発サーバー設定
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  },
  
  // ビルド設定
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router']
        }
      }
    }
  },
  
  // パスエイリアス
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
```

### TypeScript設定

TypeScriptを使用する場合、`tsconfig.json`でパスエイリアスを設定できます。

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

## 主要機能

### 1. 環境変数

Viteは、`.env`ファイルから環境変数を読み込みます。

```bash
# .env
VITE_API_URL=https://api.example.com
VITE_APP_TITLE=My App
```

```javascript
// コード内で使用
const apiUrl = import.meta.env.VITE_API_URL
const appTitle = import.meta.env.VITE_APP_TITLE
```

### 2. 静的アセットのインポート

Viteは、静的アセットをインポートできます。

```javascript
import logo from './assets/logo.png'
import styles from './styles.css'
```

### 3. CSSの処理

Viteは、CSS、SCSS、Less、Stylusなどをサポートしています。

```javascript
// main.js
import './styles/main.css'
import './styles/variables.scss'
```

### 4. プラグインシステム

Viteは豊富なプラグインエコシステムを持っています。

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    VitePWA({
      registerType: 'autoUpdate'
    })
  ]
})
```

## パフォーマンスの特徴

### 開発サーバーの起動速度

従来のビルドツール（Webpackなど）と比較して、Viteの開発サーバーは非常に高速です。

- **Webpack**: 数秒〜数十秒かかる場合がある
- **Vite**: 通常1秒以内で起動

### HMRの速度

ViteのHMRは、変更されたモジュールのみを更新するため、非常に高速です。

```javascript
// コンポーネントを変更すると、即座に反映される
// ページ全体のリロードは不要
```

#### HMR（Hot Module Replacement）とは

HMRは、アプリケーションの実行中にモジュールを追加・削除・置き換えることができる機能です。
従来の開発では、コードを変更するたびにページ全体をリロードする必要がありましたが、HMRを使用することで、変更された部分のみを更新できます。

#### ViteのHMRの仕組み

1. **ファイル変更の検知**: Viteはファイルシステムの変更を監視し、ファイルが変更されると即座に検知します
2. **変更されたモジュールの特定**: 変更されたファイルとその依存関係を特定します
3. **モジュールの更新**: WebSocket経由でブラウザに変更を通知し、該当モジュールのみを更新します
4. **状態の保持**: アプリケーションの状態（変数の値、フォームの入力内容など）を保持したまま更新されます

#### フレームワーク別のHMR対応

Viteは、各フレームワークに最適化されたHMRを提供します。

**Vue.js**:
```vue
<!-- コンポーネントを変更すると、コンポーネントの状態を保持したまま更新される -->
<template>
  <div>
    <p>カウント: {{ count }}</p>
    <button @click="increment">+1</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const count = ref(0)
const increment = () => count.value++
</script>
```

**React**:
```jsx
// React Fast Refreshにより、コンポーネントの状態を保持したまま更新される
import { useState } from 'react'

function Counter() {
  const [count, setCount] = useState(0)
  return (
    <div>
      <p>カウント: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  )
}
```

#### HMRの利点

- **開発効率の向上**: ページリロードが不要なため、開発速度が向上します
- **状態の保持**: フォーム入力やスクロール位置などの状態が保持されます
- **即座の反映**: 変更が即座に反映されるため、フィードバックループが短縮されます
- **デバッグの容易さ**: エラーが発生した場合も、状態を保持したまま修正できます

#### HMRが動作しない場合

一部の変更では、HMRではなくページ全体のリロードが必要な場合があります：

- HTMLファイル（`index.html`）の変更
- Vite設定ファイル（`vite.config.js`）の変更
- グローバルなCSSファイルの追加・削除
- プラグインの追加・削除

これらの変更は、開発サーバーの再起動が必要になります。

## 他のビルドツールとの比較

### Webpackとの比較

| 項目 | Webpack | Vite |
|------|---------|------|
| 開発サーバー起動 | 遅い | 非常に速い |
| HMR | 中程度 | 非常に速い |
| 設定の複雑さ | 複雑 | シンプル |
| バンドルサイズ | 大きい | 最適化されている |

### Create React Appとの比較

Create React Appは、Webpackを使用しているため、Viteと比較して開発サーバーの起動が遅いです。
Viteを使用することで、開発体験が大幅に向上します。

## 実践的な使用例

### Vue 3 + TypeScript + Vite

```bash
npm create vite@latest my-app -- --template vue-ts
```

### React + TypeScript + Vite

```bash
npm create vite@latest my-app -- --template react-ts
```

### カスタムテンプレートの使用

```bash
npm create vite@latest my-app -- --template vanilla-ts
```

## NuxtやVueプロジェクトでのViteの扱い

### NuxtプロジェクトでのVite

**Nuxt 3**では、Viteがデフォルトのビルドツールとして採用されています。
そのため、Nuxt 3プロジェクトでは、Viteを直接意識する必要は基本的にありません。

```bash
# Nuxt 3プロジェクトの作成（内部でViteが使用される）
npx nuxi@latest init my-nuxt-app
```

Nuxt 3では、Viteの設定は`nuxt.config.ts`内で行います：

```typescript
export default defineNuxtConfig({
  vite: {
    // Vite固有の設定をここに記述
    server: {
      port: 3000
    },
    build: {
      // ビルド設定
    }
  }
})
```

**Nuxt 2**では、デフォルトでWebpackが使用されますが、`@nuxtjs/vite`モジュールを使用することでViteに切り替えることができます。

### Vue CLIプロジェクトでのVite

**Vue CLI**（`vue create`）で作成されたプロジェクトは、デフォルトでWebpackを使用します。
Viteに移行する場合は、以下の選択肢があります：

1. **新規プロジェクトを作成**: `npm create vite@latest`を使用してViteベースのプロジェクトを作成
2. **既存プロジェクトを移行**: 手動でViteに移行する（設定ファイルの書き換えが必要）

### 通常の開発でViteを意識する必要があるか？

#### 意識する必要がある場合

- **Viteを直接使用するプロジェクト**: `npm create vite@latest`で作成したプロジェクト
- **カスタムビルド設定が必要な場合**: `vite.config.js`で詳細な設定を行う場合
- **Viteプラグインを使用する場合**: 特定のプラグインの設定や使用方法を理解する必要がある場合
- **パフォーマンス最適化**: ビルドの最適化や開発サーバーの設定を調整する場合

#### 意識する必要がない場合

- **Nuxt 3プロジェクト**: Viteが内部で使用されているが、通常の開発では意識する必要がない
- **フレームワークの標準機能を使用する場合**: フレームワークが提供する機能のみを使用する場合
- **基本的な開発作業**: コンポーネントの作成やルーティングなど、フレームワークの標準機能を使用する場合

### まとめ

- **Nuxt 3**: Viteがデフォルトで使用されるが、通常の開発では直接意識する必要はない
- **Vue CLI**: Webpackがデフォルト。Viteを使用する場合は新規プロジェクト作成時に選択するか、移行が必要
- **Vite直接使用**: `npm create vite@latest`で作成したプロジェクトでは、Viteの設定を理解する必要がある

基本的には、フレームワーク（Nuxt 3など）を使用している場合は、フレームワークの設定に従って開発を進めればよく、Viteの詳細を理解する必要はありません。
ただし、カスタムビルド設定やパフォーマンス最適化が必要な場合は、Viteの設定を理解しておくと便利です。

## まとめ

Viteは、モダンなフロントエンド開発のための次世代ビルドツールです。
開発サーバーの起動速度とHMRの速度が非常に速く、開発体験を大幅に向上させます。

特に以下のような場面でViteの真価を発揮します：

- 高速な開発体験を求めるプロジェクト
- モダンなフレームワーク（Vue、React、Svelteなど）を使用するプロジェクト
- TypeScriptを使用するプロジェクト
- シンプルな設定で始めたいプロジェクト

Viteを学ぶことで、より快適で効率的なフロントエンド開発が可能になります。
