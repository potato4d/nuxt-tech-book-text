# 実践的なWebアプリケーション開発ノウハウ

これまでに基本的なアプリケーション開発と、 Nuxt の特徴的な機能についてご紹介しましたが、この章では少しコアな、機能単位ではない、シチュエーション単位の実践的な開発のノウハウについてご紹介します。

## 認証つきルーティングの機能の実装

次は認証つきルーティングについてご紹介します。
Web アプリケーションを開発する場合、 閲覧できるユーザーを制限すべき画面というのは必ず存在するかと思います。

例えば ユーザーのダッシュボードや設定画面などは、ログインユーザー以外にはアクセスさせたくないという場合は、そもそもログインしていないユーザーはリソースの作成ができないサービスの場合、 LP とログインページ以外はほとんどはログインページにリダイレクトしたいはずです。

今回は、オーソドックスな API のトークン認証をベースとして、 Cookie に Bearer トークンを保持していない場合は、特定のページにリダイレクトさせるという機能を実装してみます。

この機能は、 Nuxt のミドルウェア、もしくは Vuex の nuxtServerInit アクションを利用することで、非常に簡単に実装することが可能です。

### 共通利用する Cookie のインストール

Nuxt から Cookie を読み書きする時は、 NPM モジュールの cookie および js-cookie を利用することで可能です。

通常のフロントエンドというと、最近では localStorage でのデータ永続化が一般的ですが、 Nuxt の場合、 SSR と SPA でデータを共有できるという点で、 Cookie を利用しておくと非常に便利です。

Universal

例によって例の如く CLI から導入しましょう。

```bash:terminal
$ yarn add universal-cookie
```

universal-cookie モジュールは、フロントエンド・サーバーサイド両方で利用可能な、 Universal なクッキー操作のためのライブラリです。

非常に手軽にコードを SSR と SPA で共通化できるため、 Nuxt 開発では、積極的に利用すると良いでしょう。

### ミドルウェア ベースでの認証の実装

今回の例のプログラムを見ながら動作を確認してみましょう。 `middleware/auth.js` を作成し、以下のように記述してください。

```auth.js
import Cookies from 'universal-cookie'

export default function ({ req, route, redirect, store }) {
  if (!process.server || ['/login'].includes(route.path)) {
    return
  }

  const cookies = new Cookies(req.headers.cookie)
  const credential = cookies.get('credential')

  if (credential) {
    // Cookie を Vuex Store にコミットする処理など...
    // 例えば store.dispatch('setToken', credential)
  } else {
    return redirect('/login')
  }
}
```

以上でミドルウェアを実装しましたが、認証に関してはほぼすべてのルーティングにおいて必要となるはずですので、除外ルーティングだけをミドルウェアの本体に書いてしまい、ミドルウェアの登録は nuxt.config.js でグローバルに登録してしまうと良いでしょう。

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

./pages/index.vue を以下のように。

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

./pages/login.vue を以下のようにしてやるとわかりやすいでしょう。

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

また、もう一つの実装として、 Vuex に完全に載せる形で実装する nuxtServerInit による実装があります。

nuxtServerInit は、 Vuex のルートモジュールに実装された "nuxtServerInit" の名前をつけられた Action のことで、この名前がつけられたアクションは、 SSR のイニシャライズ時に自動で実行されます。

ミドルウェアと違い、ただひとつの関数しか実行できないため、複数の機能を持たせるには向きませんが、例えば「マスタデータの取得」といった、必須処理の際に使用しておくと非常に便利でしょう。

認証の場合は、「会員登録ベースのサイト」は nuxtServerInit に、例えばメディアのように、非会員での閲覧と会員での閲覧が混在するケースでは、ミドルウェアに書くのが良いでしょう。

余談ですが、 nuxtServerInit は、ミドルウェアの実行より先に行われるため、例えばマスターデータの取得を nuxtServerInit に、認証をミドルウェアに実装した場合、認証のためにマスターデータを引き回すことも可能です。

下記に、実際の実装例をご紹介します。モジュールモードにて実装されている場合の、 `store/index.js` の例となります。

```js:index.js
import Vuex from 'vuex'
import Cookies from 'universal-cookie'

export default () => new Vuex.Store({
  actions: {
    nuxtServerInit({ commit }, { req, route, redirect }) {
      if (!process.server || ['/login'].includes(route.path)) {
        return
      }
    
      const cookies = new Cookies(req.headers.cookie)
      const credential = cookies.get('credential')
    
      if (credential) {
        // Cookie を Vuex Store にコミットする処理など...
        // 例えば commit('')
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

サーバーサイド JavaScript フレームワークとの連携についてもご紹介しておきます。通常は Nuxt は主に View に関する責務を持ち、別途 API サーバーなどを用意しての開発となるかと思いますが、機能が数えられるほどしかない場合に、複数のサーバーを構築するのはコストが高いと言えるでしょう。

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
config.dev = !(process.env.NODE_ENV === 'production')

const nuxt = new Nuxt(config)

if (config.dev) {
  const builder = new Builder(nuxt)
  builder.build()
}

app.use(nuxt.render)
app.listen(port, host)

console.log(`Server listening on ${host}:${port}`)
```

最後に、 NPM run scripts も変更の必要があります。
通常は `"dev": "nuxt dev"` というかたちで起動しますが、 Express では以下のように、 `server/index.js` を実行する形となります。

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

このように実装しておくと、 `http://localhost:3000` では Nuxt が、 `http://localhost:3000/api/` では Express が動作する一体型サーバーが動作します。

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

Expressにて開発を行った上で、
実際の Express サーバーとの連携は、 axios-module を利用すると良いでしょう。
3 章にて導入方法はご紹介しておりますので、導入までは省き、利用例を掲載しておきます。

axios-module を利用すると、 withCredential オプションによる Nuxt / Express 間の Cookie の共有が可能であったり、デフォルトの baseURL に `/api` が設定されていたりと、単一のサーバー内での Nuxt + Express 連携においても非常に快適な HTTP リクエストが可能となります。

こちらも、実際に実装したサンプルデモ及びソースコードが以下にありますので、適宜ご利用ください。

- Demo: https://potato4d.github.io/xxxxx/
- GitHub: https://github.com/

### 実際の活用シーンについて

実際の活用においては、冒頭に書いたように小さな API サーバー限定で利用するのが良いでしょう。例えば、 SSR で Web サイトを運用する場合に、問い合わせなどのために小さな API が必要になる場合などに有効に働いてくれます。

Nuxt はユニバーサルな技術であるがゆえに、 Nuxt の管理下にあるコードは必ずクライアントに露出してしまいますので、 Nuxt の middleware などで無理して実装してしまうと問題が出ます。
ですので、もし「サーバーサイドのフレームワークが必要なほどではないのではないか？」と思った場合でも、基本的には必ずサーバーサイドのフレームワークと連携して実装しましょう。

筆者は実際に以下の Web サイトで Nuxt + Express による運用を行っております。

- https://push7.jp
- https://corp.scouter.co.jp

また、実運用についての情報については、 Nuxt の範囲から逸脱するため今回は取り扱いませんが、筆者が情報をまとめて公開しているブログエントリがありますので、ご興味のあるかたは、こちらを参照してください。

- http://techblog.scouter.co.jp/entry/2018/03/19/115229

## Nuxt アプリケーションをデプロイする

最後に、 Nuxt アプリケーションのデプロイについてご紹介します。
Nuxt は、その柔軟性から様々な方法でデプロイが可能です。実際のメンテナンスやコストパフォーマンスを考えて、最適なデプロイ方法を模索するための一つの目安をご紹介します。

### 静的サイトか SSR サーバーか？

まず一つに、 静的サイトとして運用するか、 SSR サーバーを建てるかという選択があります。
Nuxt は、 Vue 単体のアプリケーションにはない generate 機能が実装されています。

generate を利用すると、  generate の段階で Nuxt の asyncData などが実行された上で、その
 SSR 結果を HTML ファイルとして出力します。

これにより、静的サイトホスティングサービスへのデプロイなどが可能となるため、運用コストを時間面でも金銭面でも抑えることができるため、積極的に活用するべきでしょう。

本当の意味でのリアルタイムである必要がなく、ただ動的なコンテンツを更新管理したいという場合は、そもそも Web アプリケーションではない、 Web サイトなどでの利用は、まずは SSR にとらわれることなく、 generate から検討することを強くオススメします。

### デプロイ先について

運用方法によりますが、今回はざっくりと「静的サイトホスティング」と「SSR サーバー運用」で分けてみましょう。

勿論、最終的にはただの静的 Web サイトもしくは Node.js サーバーとして動作させることが可能であるため、 Amazon EC2 などの IaaS サーバーでの運用も可能ですが、今回は省きます。

### 静的サイトホスティング

静的サイトの場合は、個人やコミュニティ利用であれば GitHub Pages や Netlify 、商用では Amazon S3 + CloudFront などでの運用がオススメです。

GitHub Pages, Netlify ともに、 Vue コミュニティでの運用実績があり、特に Netlify は、 Vue.js 公式ドキュメントが GitHub Pages から移行するなど、大きな盛り上がりをみせています。

一方で、 Nuxt のドキュメントは現在も GitHub Pages でホスティングされているため、非商用や個人利用であればどちらでもよろしいでしょう。筆者としては、これからを考えると Netlify 利用をオススメしておきます。

商用の場合は可用性や柔軟性、ロギングなどを考えると Amazon S3 + CloudFront が安定するところに落ち着くでしょう。

### SSR サーバー運用

SSR サーバーを運用する場合、試しに Heroku 利用からはじめてみると良いでしょう。
Heroku を利用すると、無料かつ最小限の設定で Nuxt サーバーを構築することができます。

大きな欠点として 現状 US/UK リージョンしかありませんので、レイテンシなどを考えると本格的なアプリケーションのホスティングには向きませんが、 Hobby Use やステージング環境の構築においてはそのポテンシャルを遺憾なく発揮してくれることでしょう。

Heroku については、 Nuxt 公式ドキュメント上でも言及されており、 Nuxt サーバーの起動にあたって必要な設定がいくつか書かれています。詳しくはそちらをご参照ください

> How to deploy on Heroku?
> https://nuxtjs.org/faq/heroku-deployment

また、本格的な本番環境のホスティングは、 AWS ECS などの Docker ベースのコンテナエンジンを利用することとなるでしょう。
Nuxt は、内部としてはオートドックな Node.js サーバーとして作られていますので、通常の Node.js v8 以降のイメージで動作します。
