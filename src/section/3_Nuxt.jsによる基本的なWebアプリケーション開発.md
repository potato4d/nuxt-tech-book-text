# Nuxt.jsによる基本的なWebアプリケーション開発

ここまででNuxt.jsのバックグラウンドやメリットについてご紹介してきましたが、ここからはNuxt.jsを触ったことがないかた向けに、Nuxt.jsでの簡単なWebアプリケーションの開発の流れをご紹介いたします。

Step-by-StepでNuxt.jsのパワフルな機能をご紹介していきますので、このセクションを一通り読んで実践していただくことで、Nuxt.jsによる開発の空気感を掴んでいただくことができるはずです。

それでは実際に、開発の様子を体験してみましょう。

また、もし手元に開発環境がないかたや、既に Nuxt にある程度慣れ親しんだかたで、ソースコードだけ確認したいかたは、 Web 上にデモアプリケーションとソースコードを公開していますので、下記の URL から適宜ご活用ください。

- デモ: https://potato4d.github.io/nuxt-tech-book/examples/section03/03_Tutorial/
- ソースコード: https://github.com/potato4d/nuxt-tech-book/tree/master/examples/section03/03_Tutorial

## 前提となる知識と注意

これ以降のセクションでは、Nuxt.jsのベースとなるVue.jsへのある程度の理解が必須となります。まだVue.jsを触ったことがないかたは、この機会に一度Vue.jsの基礎を体験してからお読みいただくことで、より一層Nuxt.jsについての理解が進むでしょう。

また、既にNuxt.jsを使ったWebアプリケーション開発を行ったことがあるかたは、このセクションは基礎だけを扱うため、飛ばして次のセクションから読んでも全く問題はありません。より実践的な機能について知りたいかたは、次の「Nuxt.jsの機能をフル活用する」からお読みください。

## 事前準備

実際にプロジェクトを作成していく前に、以下の環境を揃えておいてください。

### Node.js

本書では Node.js v8.9.4 (LTS) を対象として、導入されていることを前提として進めます。バージョンの確認はターミナルから以下で確認可能ですので、必ずバージョンをあわせた上で進めてください。

```bash:terminal
$ node -v
v8.9.4
```

### Yarn

また、パッケージマネージャには Yarn を利用します。 NPM と比較して、キャッシュや並列でのインストールにより高速であることのほか、nuxt本体の依存の固定化が package-lock.json ではなく yarn.lock で行われているため、そういった意味でもYarnを利用すべきでしょう。必須ではありませんが、可能な限りインストールしておいてください。

```bash:terminal
$ yarn -v
1.5.1
```

### @vue/cli

また、このサンプルでは vue-cli で利用できる Nuxt 向けボイラープレートである nuxt-community/starter-template を利用してプロジェクトを初期化します。そのため、同時に vue-cli もインストールもしておいてください。

```bash:terminal
$ npm i -g @vue/cli
$ npm i -g @vue/cli-init
$ vue -V
3.0.0-alpha.10
```

本書執筆時点では vue-cli 3.0が開発中であるために vue-cli 2.x の互換機能である `vue init` を利用しますが、正式公開後は環境構築が大きく変わることが予想されます。もし古い情報である場合は、本書「はじめに」に記載されているGitHubレポジトリを参考に、適宜読み替えてください。

### Vue.js devtools

Vue.js devtools は、 Chrome / Firefox 向けの拡張機能で、 Vue.js コンポーネントの DOM ツリーや、 Vuex ストア、イベントログなどを覗き見・改ざんできる拡張機能となります。

Vue.js での開発では必須ともいえるツールですので、導入しておきましょう。

## Nuxt.jsプロジェクトのセットアップ

まずはプロジェクトを初期化します。適当なディレクトリに移動したのち、以下のコマンドでボイラープレートを展開できます。

```bash:terminal
$ vue init nuxt/starter nuxt-project
```

いくつか質問が出ますが、特に今回は変える必要もないでしょう。全てEnterしてください。以下のようなプロジェクト構成のディレクトリが作成されていると完了です。

![Screen Shot 2018-03-04 at 20.24.01.png (341.1 kB)](https://img.esa.io/uploads/production/attachments/4699/2018/03/04/11203/9f6db09b-a776-4420-9f9a-c33898f2e7d2.png)

続いて、 vue-cli の出力メッセージの通り、パッケージのインストールと実行まで行います。以下のようにコマンドを実行してください。

```bash:terminal
$ cd nuxt-project
$ yarn
$ yarn dev
```

`yarn dev` は `yarn run dev`のエイリアスとなっています。基本的に Yarn を利用する場合、runは省略可能ですので、ショートハンドで楽するためにも省力しておくと良いでしょう。`yarn dev`を実行したことにより、開発サーバーが立ち上がります。

`[OPEN] http://localhost:3000`と表示された場合、初回ビルドとサーバーの立ち上げが完了した合図となりますので、そのまま localhost:3000 を開きましょう。VueのロゴがNuxtのロゴに変わるアニメーションつきのページが表示されることでしょう。ここまでで環境構築は完了となります。

![Screen Shot 2018-03-04 at 20.17.47.png (251.6 kB)](https://img.esa.io/uploads/production/attachments/4699/2018/03/04/11203/449e8aad-a981-483a-9bdc-5772b527dca1.png)

## Nuxtのプロジェクト構成について

プロジェクトのセットアップが完了したので、各ディレクトリの構造について、AtoZ順に簡単にご紹介します。

なお、layouts, middleware, pluginsについては、特殊な概念となりますので、ここでは取り扱わず、4章以降に詳しくご紹介します。

### assets

画像リソースや設定のJSONファイルなどのアプリケーションのソースコード外のものを管理します。

ここにあるものは、基本的にwebpackのfile-loader経由で読まれることを前提として利用することになりますので、例えば動的なURLの組み立てなどは不可な反面、宣言的に読み出せるものはアセットを最適化して利用できますので、可能な限りここに素材はおくと良いでしょう。

### components

.vueで終わる、Vueコンポーネントを管理するディレクトリとなります。

基本的にはここに全て集約していくこととなるので、適宜サブディレクトリを切って分類すると良いでしょう。

starter-template では `AppLogo.vue` が存在しています。

### pages

それぞれのページコンポーネントを配置するディレクトリとなります。

VueRouterなどをそのまま使う開発においても専用のページコンポーネントのディレクトリを設けることは多いかと思いますが、Nuxtの場合は、単なる明文化のためだけではなく、このディレクトリ配下はルーティングの自動生成の対象となる特別な意味をもつディレクトリとなっています。

starter-template では index.vue のみが存在しています。試しに書き換えて動作を見てみるのも良いでしょう。

### static

公開用の静的リソースを配置する場所となります。

starter-template で favicon.ico があるように、このディレクトリでは webpack によるファイル名のハッシュ化の影響を受けないので、固定の名前を用意したい静的リソースはここに配置すると良いでしょう。例えば、 OGP 画像や、 apple-touch-icon などが挙げられます。

### store

ここには Vuex ストアとそのモジュールのファイルを配置します。ここに配置されたストア及びモジュールは、 Nuxt のストアオートローディングの対象となり、ファイルを作成するだけそのモジュールをグローバルで利用可能となるなど、特別な扱いを受けることとなります。

詳しい挙動に関しては、この章の最後でご紹介いたします。

## ルーティングとページコンポーネントの作成

まずはルーティングから作成、Nuxtの画面の構築について一通り学んでから、ロジックの実装にうつっていくこととしましょう。

### Nuxtのルーティング自動生成システムについて

次は簡単なルーティングとページのコンポーネントを作成してみましょう。 Nuxt は、 `pages` ディレクトリ内にディレクトリやファイルを作成すると、それに沿ったルールでルーティングを作成してくれます。例として、以下のような構造の場合

```txt:directory
pages/
--| index.vue
--| about.vue
--| users/
-----| index.vue
-----| _id.vue
```

以下のようにURLを解決してくれます。

```txt:directory
/         -> index.vue
/about    -> about.vue
/users/   -> users/index.vue
/users/1  -> users/_id.vue
```

index.vueは `/` を、 `_id` といった、`_` から始まるものは、 `/users/:id` 形式をサポートしてくれます。この際、名称は `_id` に限った話ではなく、例えば `_name` や `_slug` なども可能です。この違いは、後述するルーティングパラメータの変数名の違いとなります。

また、単純な about.vue などは、そのまま `/about` をサポートするため、例えば users 配下に about.vueを作成すると、 `/users/about` にてアクセスが可能となります。

### 実際のルーティングファイルの作成

上記を踏まえて、実際にルーティングのファイルを作成してみます。今回はGitHubのユーザー情報を表示するアプリケーションのサンプルですので、 `./users/_id.vue` 辺りがあると十分でしょう。

`./users/_id.vue` を作成し、以下のようにコードを書いてみましょう。

```html:_id.vue
<template>
  <div>
    <h1>/users/_id.vue</h1>
  </div>
</template>

<script>
export default {
}
</script>
```

その上で、 http://localhost:3000/users/potato4d など、 /users/:id 形式のURLにアクセスすると、期待通り、以下のように先程記述した h1 が表示されていることがわかるかと思います。

![Screen Shot 2018-03-04 at 21.53.43.png (204.3 kB)](https://img.esa.io/uploads/production/attachments/4699/2018/03/04/11203/5dba0d4d-dedf-4952-b5aa-9f9e22d9f13e.png)

## ルーティングに応じたコンテンツの出し分け

さて、これで `/users/:id` 形式のルーティングを全て一つのファイルで受けることが可能となっていますが、実際のコンテンツの表示出し分けも行ってみます。

コンテンツの出し分けの際にルーティングの情報を取得するには、通常のVue.jsのdataメソッドではなく、asyncDataメソッドを利用します。

これはNuxtが独自に処理するdataメソッドの拡張メソッドとなっており、これを利用することで、 Vuex ストア、 ルーティングのパラメータ、リダイレクト関数などにアクセスすることが可能となっております。サーバーサイドレンダリングの時に初期データをフェッチしたい、302リダイレクトを発生させたいなどのモチベーションの際に利用が可能ですので、Nuxtのページコンポーネントでは、基本的に必ずdataのかわりにasyncDataを利用するようにしてください。

実際のルーティングパラメータの取得は、以下のように行います。分割代入を利用することでスマートにデータを取得できるので、活用すると良いでしょう。今回は、以下のように書いてみましょう。

```html:_id.vue
<template>
  <div>
    <h1>{{id}}</h1>
  </div>
</template>

<script>
export default {
  asyncData ({ params }) {
    const { id } = params
    return {
      id
    }
  }
}
</script>
```

実行すると、以下のように URL に応じてコンテンツが変わっていることがわかるかと思います。
適当に URL の id の部分を変えて変更させてみましょう。

<img width="1189" alt="Screen Shot 2018-03-05 at 21.32.19.png (248.8 kB)" src="https://img.esa.io/uploads/production/attachments/4699/2018/03/05/11203/2cae8c5c-665f-4b48-a226-9953e25e1fd4.png">

これで実際のコンテンツの出し分けが可能となりました。ここまでできたら、あとは id の値に応じてデータを取得するだけで完成することでしょう。このまま外部リソースの取得に進みます。

## asyncData と axios-module による外部リソースの取得

続いて先程書いた asyncData と、 HTTP 通信のライブラリを組み合わせて GitHub APIを叩いてみましょう。

### axios-module の導入

今回は HTTP 通信には、人気の高い Isomorphic なライブラリである axios の公式 Nuxt ラッパーである axios-module を利用します。

axios-module は、 Vue コンポーネントのシームレスな連携、 Intercepter や、 retry などを提供しており、非常に優秀なモジュールとなっています。 そのため、 Nuxt での開発のときは積極的に利用することをオススメします。

まずは Yarn を利用して axios-module を導入してください。

```bash:terminal
$ yarn add @nuxtjs/axios
```

その上で、 nuxt.config.js を開き、 loading や build と同じ階層に以下を追加してください。

```diff:nuxt.config.js
  ...
  loading: { color: '#3B8070' },
+++  modules: [
+++     '@nuxtjs/axios'
+++  ]
  /*
  ** Build configuration
  */
  build: {
  ...
```

これで axios が読み込まれ、 Vue コンポーネントや Vuex ストアからそのまま呼び出すことができるようになります。

### GitHub の Personal Access Token の取得

これは必須ではありませんが、 GitHub API へのアクセスは 1IP あたり 1時間に 60 回、 Access Token が存在する場合は 1000 回となります。 Nuxt の場合はホットリロードが存在する都合上、この API 制限を超過することは頻繁にありますので、超過してエラーとなることを考えてできれば取得しておくと良いでしょう。

まずは https://github.com/settings/tokens にアクセスし、 Generate new token を選択。 Select scopes の repo にチェックを入れたものを生成しましょう。 Description も適当に書き終わったら、そのまま Generate Tokenをしてください。

<img width="1189" alt="Screen Shot 2018-03-05 at 22.09.01.png (496.4 kB)" src="https://img.esa.io/uploads/production/attachments/4699/2018/03/05/11203/78bbece6-ae4b-4257-81cd-3ed4a51c4819.png">

そうすると、以下のような表示となり、トークンが払い出されます。スクリーンショットではマスクしていますが、英数字のトークンが発行されるはずです。これを忘れずに控えておいてください。

<img width="1189" alt="Screen Shot 2018-03-05 at 22.11.07.png (510.2 kB)" src="https://img.esa.io/uploads/production/attachments/4699/2018/03/05/11203/56b5594d-95ac-4102-91b1-76a43f1c009a.png">

### axios-module の Intercepter による認証情報の追加

折角なので先程取得したトークンと、 axios-module を利用して、 Intercepter による処理の注入を試してみます。ここでは、 GitHub の API 制限の緩和のために、 `https://api.github.com` 宛のリクエストに関して Authorization ヘッダーを付与することとします。

まずは `plugins/axios.js` を追加。以下のように記述してください。

```js:axios.js
export default function ({ $axios }) {
  $axios.onRequest( (config) => {
    if (config.url.indexOf('api.github.com') +1 ) {
      config.headers.Authorization = `token XXXXXXXXX`
      // XXXXはあなたのアクセストークンを記述してください。
    }
  })
}
```

その後、 nuxt.config.js に以下のように変更を施してください。

```diff:nuxt.config.js
  ...
  modules: [
    '@nuxtjs/axios',
  ],
+++  plugins: [
+++    '~/plugins/axios'
+++  ],
  ...
```

こうすることによって、 $axios.onRequest に Intercepter が追加され、ドメインのチェックを行った上で認証ヘッダーを付けることが可能となりました。これで全ての準備は完了となります。

### axios-module で GitHub API を叩く

それではいよいよ axios-module 経由でページコンポーネントから GitHub API を叩いてみます。 `pages/users/_id.vue` を以下のように書き換えてください。

```html:_id.vue
<template>
  <div>
    <h1>{{user.name}}</h1>
    <img :src="user.avatar_url">
  </div>
</template>

<script>
export default {
  async asyncData ({ params, app }) {
    const { id } = params
    const user = await app.$axios.$get(`https://api.github.com/users/${id}`)
    return { user }
  }
}
</script>
```

以下のように表示されていると成功です。

<img width="1094" alt="Screen Shot 2018-03-08 at 19.55.54.png (741.1 kB)" src="https://img.esa.io/uploads/production/attachments/4699/2018/03/08/11203/c3116788-2548-4de7-a214-76cae0454f34.png">

このように、axios-moduleで導入した axios は、 Nuxt の app オブジェクトの配下として自動的に登録されるため、明示的な import を必要とせず、気軽に叩くことが可能です。

## Vuexストアにデータを委譲する

最後に、Vuexストアとの連携についてご紹介します。
Nuxt では、 Vuex のモジュールを自動的に読み込んでくれるモジュールモードという便利なモードがありますが、単機能の場合は特に必要がないので、今回はクラシックモードを利用します。モジュールモードの利用については、次章以降を参考にしてください。

Nuxt の Vuex ストアのクラシックモードは、 `store/index.js` にファイルを配置し、規定の記述を行うだけで自動的にモジュールなし・単一ストア／ステートの Vuex ストアを作成してくれる機能となります。

まずは最小限のストアを作成してみましょう。最小限の Vuex ストアは、以下のようなソースコードになります。

```js:index.js
import Vuex from 'vuex'
const store = () => new Vuex.Store({
  state: {
    user: null
  },
  mutations: {},
  actions: {}
})
export default store
```

通常、 Vue.js アプリケーションから Vuex を利用する場合は、ストアを import した上で `Vue.use(Vuex)` 後に `new Vue` に追加する必要がありますが、その作業は全て Nuxt 側で行われます。

`stores/index.js` を作成すると、すぐに HMR がかかり、ブラウザの Vue.js devtools にストアが表示されるようになるはずです。

<img width="1071" alt="Screen Shot 2018-03-08 at 23.25.37.png (120.4 kB)" src="https://img.esa.io/uploads/production/attachments/4699/2018/03/08/11203/d2bb91ce-d310-4948-bdb7-3a5d779a1136.png">

ここまでできたらソースコードを移植するだけです。
今回は Vuex 自体の詳しい解説は省きますが、おおよそ通常通りの使い方で利用できるようになっています。

まずは `store/index.js` を以下のように書き換えてください。

```js:index.js
import Vuex from 'vuex'

const store = () => new Vuex.Store({
  state: {
    user: null
  },
  getters: {
    user: (state) => state.user
  },
  mutations: {
    saveUser (state, { user }) {
      state.user = user
    }
  },
  actions: {
    async getUser ({ commit }, { id }) {
      try {
        const user = await this.$axios.$get(`https://api.github.com/users/${id}`)
        commit('saveUser', { user })
      } catch (e) {
        return Promise.reject(e)
      }
    }
  }
})

export default store
```

その上で、ページコンポーネント `pages/users/_id.vue` 側は以下のように書き換えましょう。
特徴的な記述として、 asyncData 実行時はまだ methods や computed にアクセスができないため、 Action は必然的に asyncData に引数としてついてくる store から直に dispatch することとなります。

```html:_id.vue
<template>
  <div>
    <h1>{{user.name}}</h1>
    <img :src="user.avatar_url">
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  async asyncData ({ params, store }) {
    const { id } = params
    await store.dispatch('getUser', { id })
    return {}
  },
  computed: {
    ...mapGetters(['user'])
  }
}
</script>
```

実際に実装すると、以下のように同じ見た目ながら、 Vue.js devtools でみるときちんと Vuex が適用されているのがわかるかと思います。

![Screen Shot 2018-03-08 at 23.29.15.png (774.7 kB)](https://img.esa.io/uploads/production/attachments/4699/2018/03/08/11203/19b7fef9-92fa-4801-94d9-b88dd940fc32.png)

これで Nuxt を利用した簡単な Web アプリケーションの実装の説明は以上となります。今回は Nuxt の機能の紹介のために外部 API を利用した GET のみでご紹介しましたが、勿論 axios-module と Vuex を組み合わせることによって POST や PUT, PATCH などのデータとその結果を取り扱うことも可能です。

## ここから広げていくには？

この章において一通りの構造は掴んでいただけたかと思いますが、本格的なアプリケーションをうまく実装するには、レイアウトの共通化や Vuex のストア分割など、追加で行っていくべきことも多くあります。

豊富な機能とそれによる高い生産性は Nuxt の醍醐味ともいえますので、是非試しに小規模なアプリケーションを作りながら、次以降の「Nuxt.jsの機能をフル活用する」や「実践的なWebアプリケーション開発ノウハウ」を読み進めてみてください。
