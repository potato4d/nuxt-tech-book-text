# Nuxt のエコシステム

ここまでの内容で、 Nuxt のシステムは一通り理解した上で、実際の開発を十分に行うことができる状態となりました。

勿論、このまま開発を進めることもできますが、 Nuxt での開発を行うのであれば、公式やその周辺の Nuxt のためのエコシステムを十分に活用するべきでしょう。

エコシステムをうまく活用することで、公式コミュニティによってメンテナンスされている Nuxt にとって最適であり高品質なコードベースを、簡単に活用することができます。

このセクションでは、そんなエコシステムのライブラリの中から、公式プラグインやその他サードパーティ製の拡張まで、特に有用なものをいくつかご紹介します。

## Nuxt の公式コミュニティプラグインの活用について

まずは Nuxt の公式コミュニティによって提供されているプラグインのご紹介します。

Nuxt のコードは、本体からドキュメントまで、すべて GitHub にて管理されていますが、公式のコミュニティプラグインも同様に管理されています。

公式コミュニティの成果物は、専用の Organization である https://github.com/nuxt-community にて管理されています。

この Organization では、プラグインだけではなく、ボイラープレートや CLI ツールも公開されているため、試しに覗いてみると良いでしょう。

また、公式コミュニティの成果物は、必ず  nuxtjs のもと、 Scoped Package として公開されています。

サードパーティ製かどうかを簡単に判断する一つの指標となっているため、適宜活用すると良いでしょう。

このセクションでは、そんな公式プラグインから、特にオススメなプラグインについて二つご紹介します。

## axios-module からの proxy-module の呼び出し

ここまでで何度も登場してきましたが、 Nuxt でのアプリケーション開発において、 axios-module は必須と言えるでしょう。
axios 単体ではカバーしきれていない、かゆいところに手が届くものであり、 Vuex との連携もシームレスです。

その上で、本番環境で API がサブディレクトリ構造になっている場合などは、追加で proxy-module を使うのも良いでしょう。

proxy-module は、その名の通りプロキシ機能を提供するプラグインであり、「本番環境では nginx を利用して同一ドメイン内に同居しているけれど、開発環境は別々のポートでサーバーが立っている。」といった場合の差異を吸収してくれるものとなります。

マッピングを行うだけで、 /api を、 http://localhost:8000/api にプロキシしてくれると言った具合です。

しかしながら、この proxy-module は現在 axios-module が依存対象としており、 axios-module を入れる場合は、 axios-module にて proxy-module 設定を書くことができるようになっています。

ですが、今回は axios-module を使わない場合の開発も想定し、試しに proxy-module を別途入れて設定しています。

以下に、導入方法と利用方法をご紹介します。
今回は、二つのプラグインを利用して、 Qiita APIを proxy して叩いてみます。

### axios / proxy の導入

Yarn で導入しましょう。

二つのパッケージ名は `@nuxtjs/axios` と `@nuxtjs/proxy` となっています。

```
$ yarn add @nuxtjs/axios @nuxtjs/proxy
```

### axios 設定の記述

まずは axios 書きましょう。なお、今回はプロキシ設定のための準備ですので、 axios-module 以外の HTTP ライブラリでも問題ありません。

nuxt.config.js を記述します。

```diff:nuxt.config.js
+++  modules: [
+++    '@nuxtjs/axios',
+++  ],
+++  axios: {
+++    prefix: '/api/v2'
+++  }
```

axios-module では、 prefix キーに設定したものが、 baseURL の接頭辞となります。
例えばこの場合、 `http://localhost:3000/api/v2` を叩くようになっています。

これで API 用の URL を指定できましたが、ただの Nuxt サーバーに API は生えていませんので、どこかにプロキシする必要があります。

### プロキシ設定の記述

そういった時に、 proxy-module の設定を追加すると、非常に簡単にプロキシが設定できます。

nuxt.config.js に、さらに設定を追記してください。

```diff:nuxt.config.js
  modules: [
    '@nuxtjs/axios',
+++    '@nuxtjs/proxy',
  ],
  axios: {
    prefix: '/api/v2'
  },
+++  proxy: {
+++    '/api/v2': 'http://qiita.com'
+++  }
```

このように設定すると、 `/api/v2` にアクセスしたときに、パス以前を置き換えることができます。
この場合、 `http://localhost:3000` の部分が `https://qiita.com` に置き換わるため、 `https://qiita.com/api/v2` が baseURL となります。

ですので、この状態で `this.$axios.$get('/users')` などを叩くと、 `https://qiita.com/api/v2/users` が叩かれることとなります。
試してみたいかたは、 pages/index.vue に以下を記述してみると良いでしょう。

```html:index.vue
<template>
  <section class="container">
    <ul>
      <li v-for="user in users" :key="user.id">
        <p>
          <img :src="user.profile_image_url" alt="" ><br>
          <strong>{{user.id}}</strong><br>
          {{user.description}}
        </p>
      </li>
    </ul>
  </section>
</template>

<script>
import AppLogo from '~/components/AppLogo.vue'

export default {
  async asyncData({ app }) {
    const users = await app.$axios.$get('/users')
    return {
      users
    }
  }
}
</script>

<style>
p {
  margin: 0 0 16px;
  line-height: 1.5;
}
</style>
```

実際に動作させると、以下のように表示されます。

※ サンプルではアイコンをぼかしています

![Screen Shot 2018-03-31 at 15.50.45.png (161.9 kB)](https://img.esa.io/uploads/production/attachments/4699/2018/03/31/11203/fd9d948f-416a-4327-846f-3a87261d1d44.png)

こちらの動作デモ及びレポジトリは以下となります。
適宜ご参照ください。

- Demo: https://potato4d.github.io/nuxt-tech-book/examples/section06/06_API_And_Proxy
- GitHub: https://github.com/potato4d/nuxt-tech-book/tree/master/examples/section06/06_API_And_Proxy

## pwa-module によるオフライン対応

pwa-module を利用すると、イマドキな PWA の対応を、簡単な設定だけで行うことが可能です。

Service Worker ベースの技術である、オフライン対応や、 OneSignal を利用しての Web プッシュ通知まで、 PWA 開発に必要なものが nuxt.config.js への記述だけで解決する、非常に優秀なプラグインとなっています。

今回は、基本的な Server Worker のインストールと、デフォルトでついているオフライン対応を行ってみましょう。

### pwa-module の導入

パッケージ名は `@nuxtjs/pwa` となります。

```
$ yarn add @nuxtjs/pwa
```

### config への PWA オプションの追加

PWA への最低限の設定追加は、 module の追加だけで可能です。
あなたのプロジェクトの nuxt.config.js に以下を追加しましょう。

```js:nuxt.config.js
+++  modules: [
+++    '@nuxtjs/pwa'
+++  ]
```

### 専用のファイルの gitignore の追加

次に、 gitignore の追加を行います。
PWA モジュールは、 Service Worker のためのコードを追加で吐き出すため、 ignore しないと誤ってビルド後のファイルが Git レポジトリに入ってしまうこととなります。

.gitignore に、 `sw.*` を追加しておきましょう。

### generate しての動作確認

導入は全てできたので、静的サイトを generate をして動作確認してみましょう。
PWA モジュールは、開発環境での事故を避けるため、 Service Worker のインストールを本番ビルドに限定して行っています。

スクリーンショット左のように、開発中はオンラインでしか動作しませんが、本番ビルドを行うと、スクリーンショット右のようにオフライン対応が可能となります。

簡単に試したい場合は、以下のように行うと良いでしょう。

```bash:terminal
$ yarn generate
$ cd dist
$ php -S 0.0.0.0:8080
$ # or python -m SimpleHTTPServer
```

を実行した上で、立ち上がるサーバーにアクセス。

Chrome Devtools など、お使いのブラウザの開発者ツールでオフラインにしてみると、オフラインでアクセスできていることがわかるはずです。

![Screen Shot 2018-03-31 at 14.06.23.png (55.6 kB)](https://img.esa.io/uploads/production/attachments/4699/2018/03/31/11203/5ce1ac3f-fcd5-4d64-b474-02fd0d5071e6.png)

最後に、実際のこの表示切り替えまでも含めたサンプルの URL を掲載します。
スクリーンショットのように、オンラインかオフラインかで表示を切り替えるコードも追加しておりますので、是非ご活用ください。

- Demo: https://potato4d.github.io/nuxt-tech-book/examples/section06/06_PWA
- GitHub: https://github.com/potato4d/nuxt-tech-book/tree/master/examples/section06/06_PWA
