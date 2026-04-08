---
title: async awaitについて調べてみた
tags:
  - JavaScript
  - プログラミング
  - 初心者向け
  - AsyncAwait
private: false
updated_at: '2025-08-22T02:34:02+09:00'
id: 63d8c2ce1dac8dde73a2
organization_url_name: cnctor
slide: false
ignorePublish: false
---
## async awaitの歴史について
`async/await`は、非同期処理を同期処理のように直感的に書くためのシンタックスシュガー（構文上の工夫）です。その歴史は、非同期処理の複雑さをいかに解消するかというプログラミング言語の進化の歴史そのものと言えます。

### `async/await` 登場以前：コールバック地獄とPromise

`async/await`が生まれる前、非同期処理は主に**コールバック関数**によって実現されていました。しかし、処理が連続するとコールバック関数が入れ子になり、コードが深くネストしてしまう「**コールバック地獄（Callback Hell）**」と呼ばれる問題が発生し、可読性やメンテナンス性が著しく低下していました。



この問題を解決するために登場したのが **Promise**（またはFuture）です。Promiseは非同期処理の状態（未完了、成功、失敗）をオブジェクトとして扱うことで、コールバックのネストを解消し、`.then()`メソッドで処理を繋げられるようにしました。これによりコードの可読性は大きく改善されました。

---

### `async/await` の誕生：C#が先駆け

`async/await`のコンセプトを最初に主流のプログラミング言語に導入したのは、Microsoftの**C# 5.0**（2012年）です。C#チームは、非同期処理のコードをよりシンプルに、あたかも同期処理のように書けるようにすることを目指しました。

彼らはコンパイラが裏側で複雑な状態管理（ステートマシン）を自動生成する仕組みを考案し、開発者は`async`キーワードで非同期メソッドを宣言し、`await`キーワードで非同期処理の完了を待つだけで済むようにしたのです。この革新的な機能は、非同期プログラミングの複雑さを劇的に軽減しました。

---

### 各言語への広がり 🚀

C#での成功を受けて、`async/await`は多くのプログラミング言語に大きな影響を与え、次々と採用されていきました。

* **Python**: バージョン **3.5**（2015年）で `async/await` が導入されました。それ以前はジェネレータベースのコルーチンがありましたが、より明確で使いやすい構文として標準化されました。

* **JavaScript (ECMAScript)**: **ES2017 (ES8)** で `async/await` が標準仕様として導入されました。JavaScriptはブラウザやNode.jsでの非同期I/Oが非常に多く、Promiseベースのコードをさらに直感的に書けるようにしたこの機能は、コミュニティに熱狂的に受け入れられました。

* **Rust**: 2019年に `async/await` が言語の安定版に導入され、パフォーマンスを損なうことなく安全な非同期コードを書けるようになりました。

* **Swift**: バージョン **5.5**（2021年）で構造化された並行処理（Structured Concurrency）の一部として `async/await` が導入されました。

* **Kotlin**: **コルーチン（Coroutines）**という形で、`suspend` 関数と組み合わせることで `async/await` と同様の機能を提供しています。

---

### `async/await` がもたらしたもの

`async/await`の最大の功績は、**非同期コードの可読性と保守性を飛躍的に向上させた**ことです。

* **直感的なコード**: 同期処理とほとんど変わらない見た目でコードを記述できます。
* **エラーハンドリングの簡素化**: 同期処理と同じように `try...catch` 構文でエラーを捕捉できるようになりました。
* **デバッグの容易化**: コールスタックが追いやすくなり、デバッグがしやすくなりました。

`async/await`は、複雑な非同期処理を誰もが当たり前に書けるようにした、プログラミング言語の歴史における重要な進化の一つと言えるでしょう。

はい、承知いたしました。JavaScriptの**コールバック関数**について、具体的なコード例を交えて分かりやすく説明します。

-----

## コールバック関数とは？

コールバック関数とは、**他の関数に引数として渡され、後で実行される（呼び出される）関数**のことです。文字通り、「後で呼び返す (call back)」ための関数と考えると分かりやすいでしょう。

料理に例えるなら、「パスタを茹でる」というタスク（関数）があったとします。このとき、「茹で上がっ**たら**、ソースと和える」という次のアクションを一緒に渡しておくようなイメージです。この「ソースと和える」がコールバック関数にあたります。

JavaScriptでは、特に通信やファイルの読み込み、タイマーなどの時間のかかる処理（**非同期処理**）で非常に重要な役割を果たします。

-----

## なぜコールバック関数が必要なのか？

JavaScriptは基本的に上から下へ順番にコードを実行しますが、時間のかかる処理で止まってしまうと、その間ウェブページ全体の動きが固まってしまいます。これを避けるため、時間のかかる処理は「バックグラウンドで」行い、それが「終わったら」指定した処理を実行する、という仕組みが必要になります。この「終わったら実行する処理」を定義するのがコールバック関数です。

-----

## 基本的な使い方

まずは、身近な例として配列の操作で見てみましょう。

### 同期的な例：`forEach`

配列の各要素に対して順番に処理を行う`forEach`メソッドは、引数にコールバック関数を取ります。

```javascript
const numbers = [1, 2, 3];

// forEachメソッドに渡されている部分がコールバック関数
numbers.forEach(function(number) {
  console.log(number);
});

// アロー関数を使うとよりシンプルに書けます
numbers.forEach(number => {
  console.log(number * 2);
});
```

この例では、「配列の各要素を取り出す」という`forEach`の処理の中で、私たちが定義した「コンソールに表示する」という関数が要素の数だけ**呼び返されて**います。

### 非同期的な例：`setTimeout`

コールバック関数が最も活躍するのが非同期処理です。代表的な例が、指定した時間後に処理を実行する`setTimeout`です。

```javascript
console.log("タイマーを開始します。");

// 2000ミリ秒（2秒）後に実行されるコールバック関数
setTimeout(function() {
  console.log("2秒経過しました！");
}, 2000);

console.log("タイマーを開始した後、すぐにこのメッセージが表示されます。");
```

**実行結果:**

```
タイマーを開始します。
タイマーを開始した後、すぐにこのメッセージが表示されます。
// (2秒後)
2秒経過しました！
```

`setTimeout`はタイマーをセットすると、**処理の完了を待たずに**すぐに次のコード（最後の`console.log`）へ進みます。そして、指定した2秒が経過したタイミングで、引数として渡されたコールバック関数が実行されます。これが非同期処理とコールバック関数の基本的な動きです。

-----

## コールバック関数の課題：「コールバックヘル」

非同期処理を連続して行いたい場合、コールバック関数の中にさらにコールバック関数を記述することになり、コードのネスト（入れ子）が深くなってしまいます。これは\*\*コールバックヘル（Callback Hell）\*\*または「破滅のピラミッド」と呼ばれ、コードが非常に読みにくく、メンテナンスしづらくなる原因となります。

```javascript
// コールバックヘルの例
step1(function(result1) {
  step2(result1, function(result2) {
    step3(result2, function(result3) {
      step4(result3, function(result4) {
        // ...さらに処理が続く
        console.log("全ての処理が完了しました。");
      });
    });
  });
});
```

このように、コードが右側に向かってどんどん深くなっていくのが特徴です。

-----

## 現代の代替手段：PromiseとAsync/Await

このコールバックヘルの問題を解決するために、現在では**Promise**や**Async/Await**といった、よりモダンで可読性の高い非同期処理の記述方法が主流となっています。

  * **Promise**: 非同期処理の「成功」または「失敗」といった最終的な結果を表すオブジェクトです。メソッドチェーン（`.then()`や`.catch()`）で処理をつなげることができ、ネストを浅くできます。
  * **Async/Await**: Promiseをさらに直感的（同期的）に書けるようにした構文です。非同期処理の結果が出るまで`await`で待機し、まるで上から順番に実行されているかのようにコードを記述できます。

コールバック関数はJavaScriptの非同期処理を理解する上で非常に重要な基礎ですが、実際の開発では、可読性やメンテナンス性の観点からPromiseやAsync/Awaitを使うことが推奨されます。

JavaScriptの`Promise`は、非同期処理の最終的な完了（または失敗）とその結果の値を表現するオブジェクトです。簡単に言うと、「いつか結果が出る処理」をうまく扱うための仕組みです。これにより、コールバック関数が何重にもネストしてしまう「コールバック地獄」を避け、よりクリーンで読みやすいコードを書くことができます。

-----

### Promiseの3つの状態

Promiseは必ず以下のいずれかの状態にあります。

1.  **`pending` (待機中)**
      * 初期状態です。まだ処理が完了していない（成功も失敗もしていない）状態です。
2.  **`fulfilled` (履行)**
      * 処理が成功して完了した状態です。結果の値を持っています。
3.  **`rejected` (拒否)**
      * 処理が失敗した状態です。失敗の理由（エラー）を持っています。

`pending`の状態から`fulfilled`か`rejected`のどちらかに一度だけ移行し、その後状態が変わることはありません。この状態の変化を**settled (確定)** と呼びます。

-----

### Promiseの基本的な使い方

#### Promiseの作成

`new Promise()` コンストラクタを使ってPromiseオブジェクトを作成します。コンストラクタには「executor」と呼ばれる関数を渡します。この関数は`resolve`と`reject`という2つの引数を取ります。

  * **`resolve(value)`**: 処理が成功した場合に呼び出し、結果の値を渡します。
  * **`reject(error)`**: 処理が失敗した場合に呼び出し、エラーオブジェクトを渡します。

<!-- end list -->

```javascript
const myPromise = new Promise((resolve, reject) => {
  const success = true; // 処理が成功したと仮定

  setTimeout(() => {
    if (success) {
      resolve("処理が成功しました！"); // 成功したのでresolveを呼ぶ
    } else {
      reject(new Error("処理に失敗しました...")); // 失敗したのでrejectを呼ぶ
    }
  }, 1000); // 1秒後に結果を返す非同期処理をシミュレート
});
```

## Promiseについて

### Promiseの結果を受け取る

作成したPromiseの結果は、`.then()`, `.catch()`, `.finally()` といったメソッドを使って受け取ります。

#### `.then()`

Promiseが **`fulfilled`** (成功) になったときに実行されるコールバック関数を登録します。`resolve`に渡された値が引数として渡ってきます。

#### `.catch()`

Promiseが **`rejected`** (失敗) になったときに実行されるコールバック関数を登録します。`reject`に渡されたエラーが引数として渡ってきます。

#### `.finally()`

Promiseの結果が成功でも失敗でも、**処理が確定したら必ず**実行されるコールバック関数を登録します。後片付け処理などに便利です。

```javascript
myPromise
  .then((successMessage) => {
    // 成功した場合 (fulfilled)
    console.log(successMessage); // "処理が成功しました！"
  })
  .catch((errorMessage) => {
    // 失敗した場合 (rejected)
    console.error(errorMessage.message); // "処理に失敗しました..."
  })
  .finally(() => {
    // 成功・失敗に関わらず、必ず実行される
    console.log("処理が完了しました。");
  });
```

-----

### Promiseチェーン

`.then()` メソッドは新しいPromiseを返すため、メソッドを数珠つなぎにすることができます。これを**Promiseチェーン**と呼びます。これにより、非同期処理を順番に実行していくことができます。

前の `.then()` で返した値が、次の `.then()` の引数として渡されます。

```javascript
new Promise((resolve, reject) => {
  setTimeout(() => resolve(1), 1000); // 1秒後に1で成功
})
.then((result) => {
  console.log(result); // 1
  return result * 2;   // 次のthenに2を渡す
})
.then((result) => {
  console.log(result); // 2
  return result * 3;   // 次のthenに6を渡す
})
.then((result) => {
  console.log(result); // 6
});

// 実行結果:
// 1
// 2
// 6
```

Promiseチェーンの途中でエラーが発生した場合、それ以降の `.then()` はスキップされ、最も近い `.catch()` が呼び出されます。

```javascript
new Promise((resolve, reject) => {
    resolve("スタート");
})
.then(result => {
    console.log(result);
    throw new Error("ここでエラー発生！"); // エラーを発生させる
    return "この処理は実行されない";
})
.then(result => {
    console.log("このthenはスキップされます");
})
.catch(error => {
    console.error(error.message); // "ここでエラー発生！"
});
```

Promiseを使いこなすことで、非同期処理が絡む複雑なロジックを、はるかに直感的で管理しやすい形で記述できるようになります。

## async awaitについて

`async/await`は、JavaScriptで非同期処理をより直感的で、まるで同期処理のように書くための構文です。Promiseをベースにしており、コードの可読性を劇的に向上させます。

-----

### `async/await`の基本 🤓

`async/await`は、2つのキーワードから成り立っています。

  * **`async`**: 関数を宣言する際に先頭につけます。`async`をつけた関数は、必ず**Promise**を返す「非同期関数」になります。
  * **`await`**: `async`関数の中でのみ使えます。Promiseが解決される（処理が終わる）まで、後続の処理を一時停止し、完了したらその結果を返します。

簡単に言うと、「**`async`で関数を包み、その中で`await`を使ってPromiseの結果を待つ**」という使い方をします。

-----

### 使い方とコード例

具体的な例を見てみましょう。ここでは、サーバーからユーザーデータを取得する処理を考えます。

#### 従来のPromiseチェーンを使った書き方

`async/await`が登場する前は、`.then()`メソッドを使って非同期処理をつなげていました。

```javascript
function fetchUser() {
  fetch('https://jsonplaceholder.typicode.com/users/1') // ① APIリクエスト（Promiseを返す）
    .then(response => {
      if (!response.ok) {
        throw new Error('ネットワークの応答が正しくありません');
      }
      return response.json(); // ② レスポンスをJSONに変換（Promiseを返す）
    })
    .then(data => {
      console.log(data.name); // ③ 最終的なデータを表示
    })
    .catch(error => {
      console.error('問題が発生しました:', error); // エラー処理
    });
}

fetchUser();
// 出力例: Leanne Graham
```

この書き方でも問題ありませんが、処理が増えると`.then()`のネストが深くなり、読みにくくなることがあります（いわゆる「コールバック地獄」）。

#### `async/await`を使った書き方

同じ処理を`async/await`で書き換えると、驚くほどスッキリします。

```javascript
async function fetchUserWithAsyncAwait() {
  try {
    // ① APIリクエストの結果を`await`で待つ
    const response = await fetch('https://jsonplaceholder.typicode.com/users/1');
    
    if (!response.ok) {
        throw new Error('ネットワークの応答が正しくありません');
    }

    // ② JSONへの変換を`await`で待つ
    const data = await response.json();

    // ③ 最終的なデータを表示
    console.log(data.name);

  } catch (error) {
    // `await`中に発生したエラーはここでキャッチできる
    console.error('問題が発生しました:', error);
  }
}

fetchUserWithAsyncAwait();
// 出力例: Leanne Graham
```

`async/await`版では、上から下へ順番に処理が実行されているように見え、**コードの流れが非常に追いやすく**なっていますね。

-----

### エラーハンドリング

`async/await`の大きな利点の一つが、エラーハンドリングの簡潔さです。

`await`を使っている処理でエラーが発生した場合（Promiseが`reject`された場合）、そのエラーは例外としてスローされます。そのため、通常の同期処理と同じように\*\*`try...catch`構文\*\*でエラーをまとめて捕捉できます。

```javascript
async function fetchWithError() {
  try {
    // 存在しないURLにアクセスしてエラーを発生させる
    const response = await fetch('https://example.com/non-existent-page');
    const data = await response.json();
    console.log(data);
  } catch (error) {
    // fetchが失敗したときのエラーがここでキャッチされる
    console.error('エラーをキャッチしました:', error);
  }
}

fetchWithError();
```

`.then().catch()`のチェーンよりも、エラー処理の記述がシンプルになります。

-----

### メリットと注意点

#### メリット ✨

  * **可読性の向上**: コードが上から下に流れるため、処理の順序が直感的に理解できます。
  * **エラーハンドリングの簡潔さ**: `try...catch`で同期処理と同じようにエラーを扱えます。
  * **デバッグが容易**: ブレークポイントを置いてステップ実行する際に、処理の動きを追いやすくなります。

#### 注意点 ⚠️

  * **`await`の使いすぎに注意**: 複数の非同期処理があり、それらが互いに依存していない場合、一つずつ`await`すると無駄な待ち時間が発生します。
    ```javascript
    // 悪い例：直列実行になってしまい、時間がかかる
    const user = await fetchUser();
    const posts = await fetchPosts();

    // 良い例：Promise.allで並列実行し、時間を短縮
    const [user, posts] = await Promise.all([fetchUser(), fetchPosts()]);
    ```
  * **`async`関数内でのみ`await`が使える**: `await`は`async`キーワードで宣言された関数の中でしか使えません。（※ただし、最近のJavaScript仕様では、モジュールのトップレベルで`await`を使えるようになっています）

-----

### まとめ

`async/await`は、Promiseを置き換えるものではなく、**Promiseをより快適に扱うための「シンタックスシュガー（糖衣構文）」**です。非同期処理の複雑さを隠蔽し、クリーンでメンテナンスしやすいコードを書くための強力な武器となります。現代のJavaScript開発では必須の知識と言えるでしょう。
