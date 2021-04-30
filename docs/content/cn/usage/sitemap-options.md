---
title: Sitemap 选项
description: 'Sitemap 的所有可用选项'
position: 6
category: 使用
---

### `routes` (可选的) - array | function

- 默认值: `[]` 或项目 `nuxt.config.js` 下的 [`generate.routes`](https://nuxtjs.org/api/configuration-generate#routes)

`routes` 完全遵循Nuxt的`generate` [配置](https://nuxtjs.org/api/configuration-generate#routes)。

请参阅下面的 [路由声明](/cn/usage/sitemap-options#路由声明)。

### `path` (可选的) - string

- 默认值: `/sitemap.xml`

用于存放站点地图的URL。

### `hostname` (可选的) - string

- 默认值:
  1. 项目 `nuxt.config.js` 内的 `sitemap.hostname`
  2. 项目 `nuxt.config.js` 内的 [`build.publicPath`](https://nuxtjs.org/api/configuration-build/#publicpath) (⚠️ **已废弃**)
  3. **generate** 或 **spa** 模式下的[`os.hostname()`](https://nodejs.org/api/os.html#os_os_hostname)，或者**ssr**模式下基于请求头 (`headers.host`)的动态值

`hostname`对于生成站点地图是**必需的**，所以在**generate** 或 **spa**模式下您需要显式的提供它。

<alert type="warning">

  使用 `build.publicPath` 作为默认值已被废弃，在release v3.0中将被移除。  
  要在当前版本中禁用它，您可以给它设置一个 falsy 值 (例如 `hostname: false`)。

</alert>

### `cacheTime` (可选的) - number

- 默认值: `1000 * 60 * 15` (15 分钟)

定义站点地图的 **路由** 多久更新一次 (单位为毫秒)。  
如果设置为一个负值，将会禁用缓存。

请注意，每次失效后，**路由**将重新计算 (详见 [路由声明](/cn/usage/sitemap-options#路由声明) 部分)。

此配选项仅在**ssr**模式下有效。

### `etag` (可选的) - object

- 默认值: 项目 `nuxt.config.js` 内的 [`render.etag`](https://nuxtjs.org/api/configuration-render#etag)。 

开启站点地图的 etag 缓存头 (请在 [etag](https://nuxtjs.org/api/configuration-render#etag) 查看可用选项)。

要关闭 etag 只需设置 `etag: false`

此配选项仅在**ssr**模式下有效。

### `exclude` (可选的) - string array

- 默认值: `[]`

`exclude` 是一个 [glob patterns](https://github.com/isaacs/minimatch#features) 数组，用于在站点地图中排除某些静态路由。

### `filter` (可选的) - function

- 默认值: `undefined`

如果 `filter` 被设置为一个函数，那么所有的路由均会被它过滤。

若要在生成站点地图之前自定义或扩展模组功能，那么此选项正是您需要的。

例子:

```js[nuxt.config.js]
// 用语言过滤路由
{
  sitemap: {
    filter ({ routes, options }) {
      if (options.hostname === 'example.com') {
        return routes.filter(route => route.locale === 'en')
      }
      return routes.filter(route => route.locale === 'fr')
    }
  }
}

// 给每个路由的尾巴都加上斜线
{
  sitemap: {
    filter ({ routes }) {
      return routes.map(route => {
        route.url = `${route.url}/`
        return route
      })
    }
  }
}
```

### `gzip` (可选的) - boolean

- 默认值: `false`

若设置为 `true`，则会创建用gzip压缩的`.xml.gz`站点地图。

### `xmlNs` (可选的) - string

- 默认值: `undefined`

覆盖 `<urlset>` 所有的 `xmlns` 属性，用于设置自定义的 XML 命名空间。

```js[nuxt.config.js]
{
  sitemap: {
    xmlNs: 'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'
  }
}
```

### `xslUrl` (可选的) - string

- 默认值: `undefined`

XSL 文件的路径，用于个性化站点地图。

### `trailingSlash` (可选的) - boolean

- 默认值: `false`

给每个路由加上尾斜线 (例如 `/page/1` => `/page/1/`)

> **注意:** 为了避免爬虫检测到 [重复内容](https://support.google.com/webmasters/answer/66359)， 您需要给这两个 URL 配置 HTTP 301 重定向 (详见 [redirect-module](https://github.com/nuxt-community/redirect-module) 或 [nuxt-trailingslash-module](https://github.com/WilliamDASILVA/nuxt-trailingslash-module)).

### `i18n` (可选的) - string | object

- 默认值: `undefined`

用于支持 [nuxt-i18n](https://i18n.nuxtjs.org/)，配置本地化路由。

如果配置了 `i18n` 选项，sitemap module 将会自动在 `<loc>` 元素中添加页面的默认区域URL ，以及子条目 `<xhtml:link>` 会列出该页面的所有 语言/区域 设置，包括默认的设置 (参考 [Google sitemap guidelines](https://support.google.com/webmasters/answer/189077)).

例如:

```js[nuxt.config.js]
{
  modules: [
    'nuxt-i18n',
    '@nuxtjs/sitemap'
  ],
  i18n: {
    locales: ['en', 'es', 'fr'],
    defaultLocale: 'en'
  },
  sitemap: {
    hostname: 'https://example.com',
    // shortcut notation (basic)
    i18n: true,
    // nuxt-i18n notation (advanced)
    i18n: {
      locales: ['en', 'es', 'fr'],
      routesNameSeparator: '___'
    }
  }
}
```

```xml
  <url>
    <loc>https://example.com/</loc>
    <xhtml:link rel="alternate" hreflang="en" href="https://example.com/"/>
    <xhtml:link rel="alternate" hreflang="es" href="https://example.com/es/"/>
    <xhtml:link rel="alternate" hreflang="fr" href="https://example.com/fr/"/>
  </url>
  <url>
    <loc>https://example.com/es/</loc>
    <xhtml:link rel="alternate" hreflang="en" href="https://example.com/"/>
    <xhtml:link rel="alternate" hreflang="es" href="https://example.com/es/"/>
    <xhtml:link rel="alternate" hreflang="fr" href="https://example.com/fr/"/>
  </url>
  <url>
    <loc>https://example.com/fr/</loc>
    <xhtml:link rel="alternate" hreflang="en" href="https://example.com/"/>
    <xhtml:link rel="alternate" hreflang="es" href="https://example.com/es/"/>
    <xhtml:link rel="alternate" hreflang="fr" href="https://example.com/fr/"/>
  </url>
```

### `defaults` (可选的) - object

- 默认值: `{}`

`defaults` 选项用于给所有路由设置默认配置。

```js[nuxt.config.js]
{
  sitemap: {
    defaults: {
      changefreq: 'daily',
      priority: 1,
      lastmod: new Date()
    }
  }
}
```

[查看可用配置](https://github.com/ekalinin/sitemap.js/blob/4.1.1/README.md#sitemap-item-options)

## Sitemap Index 选项

### `path` (可选的) - string

- 默认值: `/sitemapindex.xml`

用于存放站点地图索引的URL。

### `hostname` (可选的) - string

将 `hostname` 值设置为链接到其站点地图索引的每个站点地图。

### `sitemaps` - array of object

- 默认值: `[]`

包含[sitemap 配置](/cn/usage/sitemap-options#routes-可选的---array--function)的数组，链接到每个站点地图索引。

```js[nuxt.config.js]
{
  sitemap: {
    path: '/sitemapindex.xml',
    hostname: 'https://example.com',
    sitemaps: [
      {
        path: '/sitemap-foo.xml',
        // ...
      }, {
        path: '/folder/sitemap-bar.xml',
        // ...
      }
    ]
  }
}
```

```xml
<!-- generated sitemapindex.xml -->

<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://example.com/sitemap-foo.xml</loc>
  </sitemap>
  <sitemap>
    <loc>https://example.com/folder/sitemap-bar.xml</loc>
  </sitemap>
</sitemapindex>
```

查看更多 [例子](/cn/usage/sitemap#设置一个站点地图)。

### `lastmod` (可选的) - string

为所有的站点地图设置 `lastmod` 值。

此外，也可以给站点地图设置单独的 `lastmod` 值。

```js[nuxt.config.js]
{
  sitemap: {
    lastmod: "2020-01-01",
    sitemaps: [
      {
        path: '/sitemap-foo.xml',
        lastmod: "2020-01-02"
      }, {
        path: '/sitemap-bar.xml'
      }
    ]
  }
}
```

### `etag` (可选的) - object

- 默认值: 项目 `nuxt.config.js` 内的 [`render.etag`](https://nuxtjs.org/api/configuration-render#etag) 

开启站点地图的 etag 缓存头 (请在 [etag](https://nuxtjs.org/api/configuration-render#etag) 查看可用选项)。

要关闭 etag 只需设置 `etag: false`

此配选项仅在**ssr**模式下有效。

### `gzip` (可选的) - boolean

- 默认值: `false`

若设置为 `true`，则会创建用gzip压缩的`.xml.gz`站点地图。

### `xmlNs` (可选的) - string

- 默认值: `undefined`

覆盖 `<urlset>` 所有的 `xmlns` 属性，用于设置自定义的 XML 命名空间。

```js[nuxt.config.js]
{
  sitemap: {
    xmlNs: 'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    sitemaps: [...]
  }
}
```

### `xslUrl` (可选的) - string

- 默认值: `undefined`

XSL 文件的路径，用于个性化站点地图。

## 路由声明

默认情况下，sitemap module 会忽略动态路由。

Nuxt无法自动提供动态的复杂路由。

例如:

```
-| pages/
---| index.vue  --> 静态路由
---| about.vue  --> 静态路由
---| users/
-----| _id.vue  --> 动态路由
```

如果您想添加任意变量的路由，您需要设置一组动态路由。

例如，对于 `/users/:id` ，配置如下:

### 可以是静态列表

```js[nuxt.config.js]
{
  sitemap: {
    routes: ['/users/1', '/users/2', '/users/3']
  }
}
```

### 可以是返回 Promise 的函数

```js[nuxt.config.js]
const axios = require('axios')

{
  sitemap: {
    routes: async () => {
      const { data } = await axios.get('https://jsonplaceholder.typicode.com/users')
      return data.map((user) => `/users/${user.username}`)
    }
  }
}
```
