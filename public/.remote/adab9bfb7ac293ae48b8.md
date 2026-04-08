---
title: Vue3のウォッチャーについて調べてみた
tags:
  - JavaScript
  - 初心者
  - Vue.js
  - Vue3
private: false
updated_at: '2025-09-12T14:19:49+09:00'
id: adab9bfb7ac293ae48b8
organization_url_name: cnctor
slide: false
ignorePublish: false
---
Vue 3 のウォッチャーは、リアクティブなデータの変更を監視し、それに応じて特定の処理（副作用）を実行するための強力な機能です。主に `watch` と `watchEffect` の2つの関数が提供されており、それぞれに特徴と最適な利用シーンがあります。

-----

## **watch: 特定のデータを監視する**

`watch` 関数は、一つまたは複数の特定のリアクティブなデータソースを監視し、その値が変更されたときにコールバック関数を実行します。より細やかな制御が可能で、副作用の実行条件を明確にしたい場合に適しています。

### **基本的な使い方**

`watch` は3つの引数を取ります。

1.  **監視対象 (Source):** `ref`、`reactive` オブジェクト、ゲッター関数、またはそれらの配列。
2.  **コールバック関数 (Callback):** データが変更されたときに実行される処理。新しい値と古い値を受け取れます。
3.  **オプション (Options):** 監視の挙動を調整するためのオブジェクト（任意）。

<!-- end list -->

```javascript
import { ref, watch } from 'vue'

const count = ref(0)

// count の変更を監視
watch(count, (newValue, oldValue) => {
  console.log(`カウントが ${oldValue} から ${newValue} に変わりました。`)
})

// DOM を更新
count.value++ // "カウントが 0 から 1 に変わりました。" と出力される
```

### **監視対象の様々な形式**

#### **1. ref**

最も基本的な形式で、`ref` オブジェクトを直接監視します。

```javascript
const message = ref('こんにちは')
watch(message, (newVal) => console.log(newVal))
```

#### **2. ゲッター関数**

リアクティブオブジェクト内のプロパティなど、特定の値を監視したい場合にゲッター関数を使います。

```javascript
import { reactive, watch } from 'vue'

const state = reactive({ count: 0, name: 'Vue' })

// state.count の変更のみを監視
watch(
  () => state.count,
  (newCount) => {
    console.log(`countが変更されました: ${newCount}`)
  }
)

state.count++ // "countが変更されました: 1"
state.name = 'React' // こちらはトリガーされない
```

#### **3. 複数のソースを配列で監視**

複数のデータソースのいずれかが変更されたときに処理を実行したい場合は、配列で指定します。

```javascript
const firstName = ref('Taro')
const lastName = ref('Yamada')

watch([firstName, lastName], ([newFirst, newLast], [oldFirst, oldLast]) => {
  console.log(`名前が ${oldFirst} ${oldLast} から ${newFirst} ${newLast} に変わりました。`)
})

firstName.value = 'Jiro' // ログが出力される
```

### **便利なオプション**

#### **`immediate: true`**

ウォッチャーを作成した直後に、一度コールバックを即時実行します。初期化処理に便利です。

```javascript
const userID = ref(1)

watch(userID, (id) => {
  console.log(`ユーザーID ${id} のデータをフェッチします。`)
}, { immediate: true }) // "ユーザーID 1 のデータをフェッチします。" が即座に実行される
```

#### **`deep: true`**

ネストされたオブジェクトや配列の内部の変更を深く監視します。パフォーマンスに影響を与える可能性があるため、注意して使用してください。

```javascript
const user = reactive({
  name: 'Taro',
  profile: {
    age: 20
  }
})

watch(user, (newUser) => {
  console.log('ユーザー情報が変更されました:', newUser)
}, { deep: true })

user.profile.age++ // "ユーザー情報が変更されました: ..." が出力される
```

-----

## **watchEffect: 依存関係を自動で追跡**

`watchEffect` は、関数内で使用されているリアクティブな依存関係を**自動的に追跡**し、いずれかの依存関係が変更されたときにその関数を再実行します。監視対象を明示的に指定する必要がないため、コードが簡潔になります。

### **基本的な使い方**

`watchEffect` は、副作用を含む関数を1つ引数に取ります。

  * **即時実行:** コンポーネントの初期化時に一度実行されます。
  * **自動追跡:** 関数内で参照されたリアクティブなデータが変更されると、自動的に再実行されます。

<!-- end list -->

```javascript
import { ref, watchEffect } from 'vue'

const userID = ref(1)
const userData = ref(null)

watchEffect(() => {
  // userIDが変更されるたびに、この中の処理が再実行される
  console.log(`ID: ${userID.value} のデータを取得中...`)
  // 本来はここでAPIフェッチなどを行う
  userData.value = { id: userID.value, name: `User ${userID.value}` }
})

// 2秒後にuserIDを変更
setTimeout(() => {
  userID.value = 2
}, 2000)

// "ID: 1 のデータを取得中..." (即時実行)
// (2秒後) "ID: 2 のデータを取得中..."
```

この例では、`watchEffect` のコールバック関数が `userID.value` を参照しているため、Vue は `userID` を依存関係として自動的に登録します。`userID` が変更されると、コールバックが再実行されます。

-----

## **watch vs. watchEffect: 使い分け**

どちらを使うかは、目的によって決まります。

| 特徴 | `watch` | `watchEffect` |
| :--- | :--- | :--- |
| **依存関係** | **明示的**に指定 | **自動的**に追跡 |
| **初回実行** | デフォルトでは実行されない ( `immediate: true` で可) | **常に即時実行**される |
| **値のアクセス** | **新しい値**と**古い値**の両方にアクセス可能 | 値にアクセスできない |
| **主な用途** | - 特定のデータの変更に応じて処理を実行したい- 変更前後の値を比較したい- 実行のタイミングを細かく制御したい | - 複数の依存関係があり、どれかが変われば常に実行したい- リアクティブなデータに応じてDOMや外部ライブラリを操作したい |

-----

### **使い分けのヒント**

  * 「**このデータが変わったら、この処理を実行する**」というように、原因と結果が明確な場合は `watch` を選びましょう。
  * 「**これらのデータを使って何かをする処理があり、そのデータが変更されたらいつでも再実行してほしい**」という場合は `watchEffect` が便利です。
  * 変更前の値が必要な場合は、`watch` を使うしかありません。

-----

## **ウォッチャーの停止**

`watch` と `watchEffect` はどちらも、ウォッチャーを停止するための関数を返します。コンポーネントがアンマウントされると自動的に停止されますが、任意のタイミングで手動で停止することも可能です。

```javascript
import { ref, watch } from 'vue'

const count = ref(0)

const stopWatcher = watch(count, (newVal) => {
  console.log(`現在のカウント: ${newVal}`)
  if (newVal >= 3) {
    console.log('ウォッチャーを停止します。')
    stopWatcher() // ウォッチャーを停止
  }
})

// countの値を変更
const interval = setInterval(() => {
  count.value++
  if (count.value > 5) clearInterval(interval)
}, 1000)

// 出力:
// 現在のカウント: 1
// 現在のカウント: 2
// 現在のカウント: 3
// ウォッチャーを停止します。
// (以降、countが4, 5になってもログは出力されない)
```
