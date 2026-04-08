---
title: Vueのリアクティブについて
tags:
  - JavaScript
  - 初心者
  - 初心者向け
  - Vue.js
private: false
updated_at: '2025-08-28T12:23:09+09:00'
id: 5d4ccf7cea86fdb8f757
organization_url_name: cnctor
slide: false
ignorePublish: false
---
## リアクティブについて

Vue.jsの最も重要な特徴の一つが、この**リアクティブシステム**です。これは、ひと言でいうと「**データが変更されると、そのデータに依存するHTML（DOM）が自動的に更新される仕組み**」のことです。これにより、開発者はDOMを直接操作するコードを書く必要がなくなり、データ管理に集中できます。

-----

### リアクティブの基本的な仕組み 💡

Vueは、アプリケーションで使われるデータ（`data`オブジェクトや`ref`、`reactive`で作成されたもの）を常に監視しています。

1.  **追跡 (Tracking)**: コンポーネントが描画される際、Vueはどのデータがどこで使われているかを記録します。これを「依存関係の追跡」と呼びます。
2.  **検知 (Detection)**: データが変更されると、Vueはその変更を検知します。
3.  **更新 (Update)**: 変更が検知されると、Vueはそのデータに依存しているコンポーネントだけを効率的に再描画し、ページの表示を更新します。

この仕組みのおかげで、例えば`message`というデータを変更するだけで、画面上の`{{ message }}`と表示されている部分が自動的に新しい値に変わるのです。

-----

### 2つの主要なAPIスタイル

Vueには、リアクティブなデータを扱うための主要なAPIが2つあります。

#### 1\. オプションAPI (Options API)

Vueの伝統的なスタイルで、特にVue 2から使っている人には馴染み深いです。コンポーネントのオプション（`data`, `methods`, `computed`など）をオブジェクトにまとめて定義します。

**特徴**:

  * **`data` オプション**: この関数から返されるオブジェクト内のプロパティがリアクティブになります。
  * **シンプルな構造**: 小〜中規模のコンポーネントでは、コードが整理されていて分かりやすいです。

**コード例**:

```html
<template>
  <div>
    <p>{{ message }}</p>
    <button @click="changeMessage">Click me</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: 'Hello, Vue!'
    }
  },
  methods: {
    changeMessage() {
      // this.messageを変更すると、<p>タグの中身が自動で更新される
      this.message = 'You clicked the button!';
    }
  }
}
</script>
```

内部的には、Vue 2では`Object.defineProperty`を、Vue 3では`Proxy`を使って`data`オブジェクトのプロパティへのアクセスや変更を監視しています。

#### 2\. コンポジションAPI (Composition API)

Vue 3で導入された新しいスタイルで、より柔軟で大規模なアプリケーションに適しています。ロジックごとに関数をまとめて管理しやすくなります。

**特徴**:

  * **`setup` 関数**: コンポーネントのロジックをこの関数内に記述します。
  * **`ref` と `reactive`**: リアクティブなデータを作成するための関数を明示的に使います。

##### `ref`

`ref`は、プリミティブな値（文字列、数値、真偽値など）やオブジェクトをリアクティブにするために使います。`.value`プロパティを通して値にアクセスするのが特徴です。

**コード例 (`ref`)**:

```html
<template>
  <div>
    <p>{{ message }}</p>
    <button @click="changeMessage">Click me</button>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    // 'Hello, Vue!'という文字列をリアクティブにする
    const message = ref('Hello, Vue!');

    function changeMessage() {
      // 値を変更するには .value を使う
      message.value = 'You clicked the button!';
    }

    return {
      message,
      changeMessage
    };
  }
}
</script>
```

テンプレート（`<template>`タグ内）では`.value`は不要で、`{{ message }}`のように直接使えます。これはVueが自動的に`.value`を解決してくれるためです。

##### `reactive`

`reactive`は、**オブジェクト**や**配列**をリアクティブにするために使います。`ref`とは異なり、`.value`を使わずに直接プロパティにアクセスします。

**コード例 (`reactive`)**:

```html
<template>
  <div>
    <p>User: {{ user.name }} ({{ user.age }})</p>
    <button @click="celebrateBirthday">Happy Birthday!</button>
  </div>
</template>

<script>
import { reactive } from 'vue';

export default {
  setup() {
    // オブジェクトをリアクティブにする
    const user = reactive({
      name: 'John Doe',
      age: 30
    });

    function celebrateBirthday() {
      // プロパティを直接変更する
      user.age++;
    }

    return {
      user,
      celebrateBirthday
    };
  }
}
</script>
```

**`ref` vs `reactive` の使い分け**:

  * **`ref`**: 文字列や数値などの単一の値、または後からオブジェクトごと再代入する可能性がある場合に便利です。
  * **`reactive`**: 複数のプロパティを持つ複雑なオブジェクトをリアクティブにしたい場合に適しています。ただし、`reactive`で作成したオブジェクトは、変数自体を再代入するとリアクティブ性が失われるため注意が必要です。（例: `user = { name: 'Jane' ...}` のような再代入はNG）

-----

### まとめ

| 特徴 | 説明 | 主な利用シーン |
| :--- | :--- | :--- |
| **リアクティブシステム** | データの変更を自動的に検知し、UIを更新するVueの根幹的な仕組み。 | Vue開発全般 |
| **オプションAPI** | `data`オプションでリアクティブなデータを管理する伝統的な方法。 | シンプルなコンポーネント、Vue 2からの移行 |
| **コンポジションAPI** | `ref`や`reactive`を使い、より柔軟にロジックを組み立てる新しい方法。 | 複雑・大規模なコンポーネント、ロジックの再利用 |

このリアクティブシステムを理解することが、Vue.jsを効果的に使いこなすための鍵となります。
