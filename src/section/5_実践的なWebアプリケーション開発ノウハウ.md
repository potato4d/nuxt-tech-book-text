# 実践的な Web アプリケーション開発ノウハウ

ここまで、基本的なアプリケーション開発と、 Nuxt の特徴的な機能についてご紹介しました。

この章では少しコアな、シチュエーション単位の実践的な開発のノウハウについてご紹介します。
先ほどまでは機能単位で紹介をすすめましたが、シチュエーション単位での実例を見ることにより、より実際の開発がイメージしやすくなることでしょう。

## 認証つきルーティングの機能の実装

認証つきルーティングについてご紹介します。
Web アプリケーションを開発する場合、 閲覧できるユーザーを制限する必要のある画面は頻繁に現れます。

例えば、会員登録を前提としたサービスの場合、ログインしていないユーザーをログインページにリダイレクトする必要があるでしょう。

今回は、そういった場合の対処ケースとして、「オーソドックスな API のトークン認証をベースとし、 Cookie に Bearer トークンを保持していない場合は、特定のページにリダイレクトさせる」という機能を実装してみます。

この機能は、 Nuxt のミドルウェア、もしくは Vuex の nuxtServerInit アクションを利用することで、非常に簡単に実装することが可能です。

### 共通利用する Cookie のインストール

Nuxt からの Cookie の読み書きは、 NPM モジュールの universal-cookie を利用することで実装できます。

通常のフロントエンドというと、最近では localStorage でのデータ永続化が一般的ですが、 Nuxt の場合、 SSR と SPA でデータを共有できるという点で、 Cookie を利用しておくと非常に便利です。

例によって例の如く CLI から導入しましょう。

```bash:terminal
$ yarn add universal-cookie
```

universal-cookie モジュールは、フロントエンド・サーバーサイド両方で利用可能な、 Universal なクッキー操作のためのライブラリです。

非常に手軽にコードを SSR と SPA で共通化できるため、 Nuxt 開発では、積極的に利用すると良いでしょう。

### ミドルウェアベースでの認証の実装

早速サンプルのコードをみながら実装を進めてみましょう。`middleware/auth.js` を作成し、以下のように記述してください。

```auth.js
import Cookies from 'universal-cookie'

export default function ({ req, route, redirect, store }) {
  if (!process.server || ['/login'].includes(route.path)) {
    return
  }

  const cookies = new Cookies(req.headers.cookie)
  const credential = cookies.get('credential')

  if (credential) {
    // Main logic here...
    // e.g. store.dispatch('setToken', credential)
  } else {
    return redirect('/login')
  }
}
```

以上でミドルウェアは実装完了です。
実装したミドルウェアは、そのままでは動作しませんので、ルーティングに紐付ける必要があります。

肝心のヒモ付ですが、ミドルウェアはページごとに設定するか、 nuxt.config.js でグローバルに設定するかを選択することが可能です。

認証に関しては、ほぼすべてのルーティングにおいて必要となるはずですので、グローバルに設定してしまいましょう。

その際、上記のコードのように除外ルーティングだけをミドルウェアの本体に書いてしまうと円滑でしょう。

グローバルに設定する際の nuxt.config.js のコードは以下となります。

```js:nuxt.config.js
module.exports = {
  // ...
  router: {
    middleware: ['auth']
  }
  // ...
}
```

試しに、 `pages/index.vue` と `pages/login.vue` を用意して動作させてみるとわかりやすいでしょう。

`./pages/index.vue` を以下のように。

```html:index.vue
<template>
  <section>
    <h1>HOME</h1>
    <p>
      <nuxt-link to="/login">
        Move to login
      </nuxt-link>
    </p>
  </section>
</template>

<script>
import AppLogo from '~/components/AppLogo.vue'

export default {
  components: {
    AppLogo
  }
}
</script>

<style scoped>
section {
  margin: 16px;
}
</style>
```

`./pages/login.vue` を以下のようにしてやるとわかりやすいでしょう。

```html:login.vue
<template>
  <section>
    <h1>Login</h1>
    <p>
    <button type="button" @click="addCredential">
      Set credential
    </button>
    <button type="button" @click="removeCredential">
      Remove credential
    </button>
    </p>
    <p>
      <a href="/">Move to home</a>
    </p>
  </section>
</template>

<script>
import Cookies from 'universal-cookie'

let cookies

export default {
  mounted() {
    cookies = new Cookies()
  },
  methods: {
    addCredential() {
      cookies.set('credential', '1')
    },
    removeCredential() {
      cookies.set('credential', '')
    }
  }
}
</script>

<style scoped>
section {
  margin: 16px;
}
</style>
```

このように実装することで、非常に手軽に認証を実装することが可能となりました。実際の現場では、 axios-module と併用して、 API コールすることで 401 となるかのチェックを行っても良いでしょう。

最後に、これらを実際に実装したサンプルデモ及びソースコードが以下にありますので、適宜ご利用ください。

- Demo: https://potato4d.github.io/nuxt-tech-book/examples/section05/05_Auth_with_Middleware
- GitHub: https://github.com/potato4d/nuxt-tech-book/tree/master/examples/section05/05_Auth_with_Middleware

### nuxtServerInit での認証の実装

また、もう一つの実装パターンとして、nuxtServerInit を利用する方法があり、こちらは Vuex に完全に載せることになります。

nuxtServerInit は、 Vuex のルートモジュールに実装された "nuxtServerInit" の名前をつけられた Action のことを指し、この名前がつけられたアクションは、 SSR の初期化時に自動で実行されます。

ミドルウェアと違い、ただひとつの関数しか実行できないため、複数の機能を持たせるには向きませんが、例えば「マスタデータの取得」といった、必須処理の際に使用しておくと非常に便利でしょう。

認証の場合は、

- 利用に会員登録が必須なアプリケーションでは nuxtServerInit
- メディアサイトのような、非会員での閲覧と会員での閲覧が混在するものでは、ミドルウェア

に、それぞれ書くのが良いでしょう。

余談ですが、 nuxtServerInit は、ミドルウェアの実行より先に行われるため、例えばマスターデータの取得を nuxtServerInit に、認証をミドルウェアに実装した場合、認証のためにマスターデータを引き回すことも可能です。

下記に、実際の実装例をご紹介します。モジュールモードにて実装されている場合の、 `store/index.js` の例となります。

```js:index.js
import Vuex from 'vuex'
import Cookies from 'universal-cookie'

export default () =>
  new Vuex.Store({
    actions: {
      nuxtServerInit({ commit }, { req, route, redirect }) {
        if (!process.server || ['/login'].includes(route.path)) {
          return
        }

        const cookies = new Cookies(req.headers.cookie)
        const credential = cookies.get('credential')

        if (credential) {
          // Main logic here...
          // e.g. commit('')
        } else {
          return redirect('/login')
        }
      }
    }
  })
```

こちらも実際に実装したサンプルデモ及びソースコードを公開しています。適宜ご利用ください。

- Demo: https://potato4d.github.io/nuxt-tech-book/examples/section05/05_Auth_with_Vuex
- GitHub: https://github.com/potato4d/nuxt-tech-book/tree/master/examples/section05/05_Auth_with_Vuex

## サーバーサイド JavaScript フレームワークとの連携

サーバーサイド JavaScript フレームワークとの連携についてもご紹介しておきます。

通常は Nuxt は主に View に関する責務を持ち、別途 API サーバーなどを用意しての開発となるかと思いますが、機能が数えられるほどしかない場合に、複数のサーバーを構築するのはコストが高いと言えるでしょう。

そういった場合は、 Nuxt が SSR サーバーを立てることを利用し、前段に Express を噛ませ、 Express 側で小さな API サーバーを構築すると非常に便利です。

Express との連携例は、 `nuxt-community/express-template` などの公式テンプレートがありますが、ここでも最低限の例を紹介しておきます。

### Express の導入とサーバーの起動

Express の Nuxt での導入方法を少しご紹介しておきます。
Express 本体のインストールは、通常のサーバーサイドの開発と同じように、 Nuxt プロジェクトに yarn add で追加します。

```bash:terminal
$ yarn add express body-parser
```

その上で、専用のサーバー用のディレクトリを作成し、ファイルを配置します。 わかりやすくするために、 `server/index.js` などに配置しておくと良いでしょう。

```js:index.js
const express = require('express')
const { Nuxt, Builder } = require('nuxt')
const app = express()
const host = process.env.HOST || '127.0.0.1'
const port = process.env.PORT || 3000
const bodyParser = require('body-parser')

app.set('port', port)
app.use('/api/', bodyParser.json())

const config = require('../nuxt.config.js')
config.dev = !(NODE_ENV === 'production')

const nuxt = new Nuxt(config)

if (config.dev) {
  const builder = new Builder(nuxt)
  builder.build()
}

app.use(nuxt.render)
app.listen(port, host)

console.log(`Server listening on ${host}:${port}`)
```

最後に、 npm scripts も変更の必要があります。

package.json を以下のように設定します。

```js:package.json
{
// ...
  "scripts": {
    "dev": "NODE_ENV=development node ./server/index.js",
    "start": "NODE_ENV=production node ./server/index.js"
  }
// ...
}
```

このように記述しておくと、 `http://localhost:3000` では Nuxt が、 `http://localhost:3000/api/` では Express が動作する一体型サーバーが動作します。

あとは通常の Express アプリケーションと同様に開発が可能です。
データの取得のサンプルのために、試しに以下を実装してみましょう。

```diff:index.js
// ...
app.use('/api/', bodyParser.json())

+++app.get('/api/todos', (req, res) => {
+++  res.json({
+++    todos: [
+++      { id: 1, name: 'First Todo' },
+++      { id: 2, name: 'Second Task' },
+++      { id: 3, name: 'Third Task' }
+++    ]
+++  })
+++})

const config = require('../nuxt.config.js')
// ...
```

このように書いて実行すると、 `/api/todos` では Express が、 `/` では Nuxt が呼び出されていることが確認できます。
後は通常の Express アプリケーションのように開発するだけで OK です。

### データの取得

Express にて開発を行った上で、
実際の Express サーバーとの連携は、 axios-module を利用すると良いでしょう。
3 章にて導入方法はご紹介しておりますので、導入までは省き、利用例を掲載しておきます。

axios-module を利用すると、 withCredential オプションによる Nuxt / Express 間の Cookie の共有が可能であったり、デフォルトの baseURL に `/api` が設定されていたりと、単一のサーバー内での Nuxt + Express 連携においても非常に快適な HTTP リクエストが可能となります。

こちらも、実際に実装したサンプルデモ及びソースコードが以下にありますので、適宜ご利用ください。

- Demo: https://potato4d.github.io/nuxt-tech-book/examples/section05/05_Express_Intergration
- GitHub: https://github.com/potato4d/nuxt-tech-book/tree/master/examples/section05/05_Express_Intergration

### 実際の活用シーンについて

実際の活用においては、冒頭に書いたように小さな API サーバー限定で利用するのが良いでしょう。例えば、 SSR で Web サイトを運用する場合に、問い合わせなどのために小さな API が必要になる場合などに有効に働いてくれます。

Nuxt はユニバーサルな技術であるがゆえに、 Nuxt の管理下にあるコードは必ずクライアントに露出してしまいます。
そのため、いくらサーバー側で動くからといってサーバー上でのみ行う処理を middleware などで実装するのは良い手とは言えません。

「サーバーサイドのフレームワークが必要なほどではないのではないか？」と思った場合でも、必ず Nuxt ではなくサーバーサイドのフレームワークと連携して実装しましょう。

筆者は実際に以下の Web サイトで Nuxt + Express による運用を行っております。

- https://push7.jp
- https://corp.scouter.co.jp

また、実運用についての情報については、 Nuxt の範囲から逸脱するため今回は取り扱いませんが、筆者が情報をまとめて公開しているブログエントリがありますので、ご興味のあるかたは、こちらを参照してください。

- http://techblog.scouter.co.jp/entry/2018/03/19/115229

## SEO やソーシャルにも役立つ適切な HTML メタの設定

前二項ではアプリケーションロジックについてご紹介しましたが、次はどのような形での開発でも便利な HTML メタ(以下: メタタグ)の設定についてご紹介いたします。<br><span style="font-size:1.2rem">※本来は HTML Attrs のメタ情報と Head におけるメタタグは別ですが、ここではわかりやすさを重視し、全て「メタタグ」として扱います。</span>

Nuxt は SSR によって実際のコンテンツはクローラに正しく認識されるようになっていますが、その上で基本的なメタタグなどの設定も、勿論行う必要があります。

デフォルトではメタタグが設定されていないなど、 body 以外は非常に弱い作りとなっています。

ここではそんな HTML メタの強化についてご紹介いたします。

### Nuxt のメタタグの管理システム

実際のサンプルを追う前に、 Nuxt のメタ情報のシステムについてご紹介しておきます。

Nuxt は、メタ情報の管理のライブラリとして vue-meta を利用しており、記法は全て vue-meta に則ったものとなります。そのため、 Nuxt 自体のドキュメントでは vue-meta を利用している旨だけが書かれており非常に簡素な説明だけが書かれています。

少し不親切に思うかもしませんが、 vue-meta 側のレポジトリにアクセスすると欲しい情報は一通り載っていますので、適宜そちらを参照するようにしておきましょう。

なお、vue-meta のレポジトリは以下です。

https://github.com/declandewet/vue-meta

### 適切な lang 属性の付与

それでは実際のコードサンプルにうつっています。まずは lang 属性から。

`<html>` タグには、 lang という属性があり、これを使うことでマークアップ内の言語を明示することが可能です。 lang の中身は、 BCP 47 と呼ばれる規格のもと決まっていますが、ここでは `ja` や `en` 形式の指定と覚えておくだけで十分でしょう。

この lang タグですが、デフォルトで設定されていては問題ですので、 Nuxt はデフォルトでは空となっています。しかしながら、サイト内の言語が決まっているのであれば、設定しておくべきでしょう。

こういった、グローバルに設定したいメタタグについては、 nuxt.config.js に記述すると非常に便利です。 nuxt.config.js に、以下のような設定を追加することで、 `<html>` タグに属性を付与することができます。

```js:nuxt.config.js
module.exports = {
   // ...
+++  head: {
+++    title: 'Nuxt Web Application',
+++    htmlAttrs: {
+++      lang: 'ja',
+++    }
+++  }
  // ...
}
```

このように、 head キーで囲った中身が Web サイト全体のメタタグとして作用します。
ここでグローバルで統一したいタイトルや description は設定しておくと良いでしょう。

なお、この設定は一番弱い設定となりますので、更に狭いスコープにおける設定があればオーバーライドされることとなります。
詳しくは、次に説明します。

### ページごとのタイトルとテンプレートの設定

グローバルの設定があるならローカルの設定もあります。
vue-meta は、 Vue コンポーネント単位でのメタタグへの干渉が可能ですので、例えばレイアウトファイルやページファイルでその効果を存分に発揮してくれることでしょう。

例えば、前述の lang 属性を付与する時に、同時にタイトルとして `Nuxt Web Application` を設定しました。
トップページなどはこれで良いでしょうが、例えば `/users/:id` 形式のユーザーページにアクセスした際など、下層ページでは `Potato4d(@potato4d) | Nuxt Web Application` といった形で、 `|` 区切りでタイトルを追加したい場合も多く存在するでしょう。

こういった場合は、グローバルでは `Nuxt Web Application` としておき、 `layouts/default.vue` および `pages/*.vue` に、以下のような設定を行うと良いでしょう。

まずはレイアウトを以下のように記述します。

```html:default.vue
<template>
  <nuxt />
</template>

<script>
export default {
  head () {
    return {
      titleTemplate: '%s | Nuxt Web Application'
    }
  }
}
```

その上で、ページを以下のように記述します。

```html:user.vue
<template>
  <div />
</template>

<script>
export default {
  head () {
    return {
      title: 'ユーザーページ'
    }
  }
}
```

ポイントは `head()` および `titleTemplate` にあります。
Nuxt には、 Vue コンポーネントに拡張された head functions を自動で実行するシステムがあります。

上記のように記述した上で、戻り値にオブジェクトを渡してやると、 nuxt.config.js で head を指定したときと同じ形式で、メタタグを上書きすることが可能となっています。また、その際親から子に伝わるに連れて優先度はあがっています。

上記をまとめると、 `pages/user.vue` &gt; `layouts/default.vue` &gt; `nuxt.config.js` という優先度となり、 `user.vue` のタイトル、 `default.vue` のタイトルテンプレート、そして `nuxt.config.js` の htmlAttrs が最終的にメタタグとして出力されることとなります。

そして、このタイトルテンプレートについてです。
タイトルテンプレートは、 `titleTemplate` キーが指定されたデータのことであり、これを利用すると、 `title` キーに設定されたテキストを含んだ、テンプレート化されたタイトルを出力することが可能です。

このテンプレートのフォーマットには、他の言語でよく見られる `sprintf` と同じ形式が採用されており、 `%s` を置き換える形で

今回であれば `%s | Nuxt Web Application` というテンプレートに、 `ユーザーページ` という文字列が置き換えれたことによって、 `ユーザーページ | Nuxt Web Application` というタイトルが出力されます。

開発中はあまり意識することがなく、リリースが近づくにつれて気づくことが多いメタタグですが、タイトルはテンプレート化できること、 `head()` をつけるだけでページ単位で上書きが可能であること、最後に、フォーマットは vue-meta を尊重することを覚えておくと、すぐに対応できることでしょう。

困ったら Nuxt のドキュメントだけではなく、 vue-meta のドキュメントもあわせて読みながら、適切に設定を進めていきましょう。

## アプリケーションのデプロイ

最後に、 Nuxt アプリケーションのデプロイについてご紹介します。
Nuxt は、その柔軟性から様々な方法でデプロイが可能です。

実際のメンテナンスやコストパフォーマンスを考えて、最適な運用方法を模索するための一つの目安をご紹介します。

### ホスティング先サーバーの選定

まずはホスティング先の選定についてご紹介いたします。

#### 静的サイトか SSR サーバーか？

まず一つに、 静的サイトとして運用するか、 SSR サーバーを建てるかという選択があります。
Nuxt は、 Vue 単体のアプリケーションにはない generate 機能が実装されています。

generate を利用すると、 generate の段階で Nuxt の asyncData などが実行された上で、その SSR 結果を HTML ファイルとして出力します。

これにより、静的サイトホスティングサービスへのデプロイなどが可能となり、運用コストを時間面でも金銭面でも抑えることができるため、積極的に活用するべきでしょう。

本当の意味でのリアルタイムである必要がなく、ただ動的なコンテンツを更新管理したいという場合は、 SSR にとらわれることなく、 generate から検討することを強くオススメします。

特に、 Web アプリケーションではなく、 Web サイトを構築したい場合は、優先して考えるべきでしょう。

#### デプロイ先について

運用方法によりますが、今回はざっくりと「静的サイトホスティング」と「SSR サーバー運用」 で分けてみましょう。

勿論、最終的にはただの静的 Web サイトもしくは Node.js サーバーとして動作させることが可能であるため、 Amazon EC2 などの IaaS サーバーでの運用も可能ですが、今回は省きます。

#### 静的サイトホスティング

静的サイトの場合は、個人やコミュニティ利用であれば GitHub Pages や Netlify 、商用では Amazon S3 + CloudFront などでの運用がオススメです。

GitHub Pages, Netlify ともに、 Vue コミュニティでの運用実績があり、特に Netlify は、 Vue.js 公式ドキュメントが GitHub Pages から移行するなど、大きな盛り上がりをみせています。

一方で、 Nuxt のドキュメントは現在も GitHub Pages でホスティングされているため、非商用や個人利用であればどちらでもよろしいでしょう。
筆者としては、将来性を考えて Netlify の利用をオススメしておきます。

商用の場合は可用性や柔軟性、ロギングなどを考えると Amazon S3 + CloudFront で運用するのがベストでしょう。

#### SSR サーバー運用

SSR サーバーを運用する場合、試しに Heroku 利用からはじめてみると良いでしょう。
Heroku を利用すると、無料かつ最小限の設定で Nuxt サーバーを構築することができます。

大きな欠点として 現状 US/UK リージョンしかありませんので、レイテンシなどを考えると本格的なアプリケーションのホスティングには向きませんが、 Hobby Use やステージング環境の構築においてはそのポテンシャルを遺憾なく発揮してくれることでしょう。

Heroku については、 Nuxt 公式ドキュメント上でも言及されており、 Nuxt サーバーの起動にあたって必要な設定がいくつか書かれています。詳しくは以下の URL からアクセスできるドキュメントをご参照ください。

> How to deploy on Heroku?
> https://nuxtjs.org/faq/heroku-deployment

また、プロダクションにおける実運用では、 AWS ECS などの Docker ベースのコンテナエンジンを利用することとなるでしょう。
Nuxt は、内部としてはオーソドックスな Node.js サーバーとして作られていますので、通常の Node.js v8 以降のイメージで動作します。
