# Sitemap Module

[![npm (scoped with tag)](https://img.shields.io/npm/v/@nuxtjs/sitemap/latest?style=flat-square)](https://npmjs.com/package/@nuxtjs/sitemap)
[![Downloads](https://img.shields.io/npm/dw/@nuxtjs/sitemap?style=flat-square)](https://npmjs.com/package/@nuxtjs/sitemap)
[![Build Status](https://img.shields.io/circleci/project/github/nuxt-community/sitemap-module?style=flat-square)](https://app.circleci.com/pipelines/github/nuxt-community/sitemap-module)
[![Coverage Status](https://img.shields.io/codecov/c/github/nuxt-community/sitemap-module?style=flat-square)](https://codecov.io/gh/nuxt-community/sitemap-module)
[![License](https://img.shields.io/npm/l/@nuxtjs/sitemap?style=flat-square)](http://standardjs.com)

> Automatically generate or serve dynamic [sitemap.xml](https://www.sitemaps.org/protocol.html) for Nuxt.js projects!

[📖 **Release Notes**](./CHANGELOG.md)

## Features

- Module based on the awesome **[sitemap.js](https://github.com/ekalinin/sitemap.js) package** ❤️
- Create **sitemap** or **sitemap index**
- Automatically add the static routes to each sitemap
- Support **i18n** routes from **nuxt-i18n** (latest version)
- Works with **all modes** (SSR, SPA, generate)
- For **Nuxt 2.x** and higher

---

## Table of Contents

- [Install](#installation)
- [Setup](#setup)
- [Usage](#usage)
- [Sitemap Options](#sitemap-options)
- [Sitemap Index Options](#sitemap-index-options)
- [Routes Declaration](#routes-declaration)
- [Hooks](#hooks)

## Installation

```shell
npm install @nuxtjs/sitemap
```

or

```shell
yarn add @nuxtjs/sitemap
```

## Setup

Add `@nuxtjs/sitemap` to the `modules` section of your `nuxt.config.js` file:

```js
{
  modules: [
    '@nuxtjs/sitemap'
  ],
}
```

> **notice:**  
> If you use other modules (eg. `nuxt-i18n`), always declare the sitemap module at end of array  
> eg. `modules: ['nuxt-i18n', '@nuxtjs/sitemap']`

### Configuration

Add a custom configuration with the `sitemap` property:

```js
// nuxt.config.js

{
  modules: [
    '@nuxtjs/sitemap'
  ],
  sitemap: {
    // options
  },
}
```

The module option parameter can be:

### `Object`

A single item of [sitemap](#sitemap-options) or [sitemap index](#sitemap-index-options):

```js
{
  sitemap: {
    // ...
  },
}
```

### `Array`

A list of [sitemap](#sitemap-options) or [sitemap index](#sitemap-index-options) items:

```js
{
  sitemap: [
    {
      // ...
    },
    {
      // ...
    },
  ],
}
```

### `Function`

A function that returns a valid sitemap configuration:

```js
{
  sitemap: function () {
    return {
      // ...
    }
  },
}
```

### `Boolean`

You can disable the sitemap module with a boolean value at `false`:

```js
{
  sitemap: false
}
```

## Usage

### Setup a Sitemap

By default, the sitemap is setup to the following path: `/sitemap.xml`  
All static routes (eg. `/pages/about.vue`) are automatically add to the sitemap, but you can exclude each of them with the [`exclude`](#exclude-optional---string-array) property.  
For dynamic routes (eg. `/pages/_id.vue`), you have to declare them with the [`routes`](#routes-optional---array--function) property. This option can be an array or a function. In addition, the routes defined in `generate.routes` will be automatically used for the sitemap.

```js
// nuxt.config.js

{
  sitemap: {
    hostname: 'https://example.com',
    gzip: true,
    exclude: [
      '/secret',
      '/admin/**'
    ],
    routes: [
      '/page/1',
      '/page/2',
      {
        url: '/page/3',
        changefreq: 'daily',
        priority: 1,
        lastmod: '2017-06-30T13:30:00.000Z'
      }
    ]
  }
}
```

### Setup a Sitemap Index

To declare a sitemap index and its linked sitemaps, use the [`sitemaps`](#sitemaps---array-of-object) property.  
By default, the sitemap index is setup to the following path: `/sitemapindex.xml`  
Each item of the `sitemaps` array can be setup with its own [sitemap options](#sitemap-options).

```js
// nuxt.config.js

{
  sitemap: {
    hostname: 'https://example.com',
    lastmod: '2017-06-30',
    sitemaps: [
      {
        path: '/sitemap-foo.xml',
        routes: ['foo/1', 'foo/2'],
        gzip: true
      }, {
        path: '/folder/sitemap-bar.xml',
        routes: ['bar/1', 'bar/2'],
        exclude: ['/**']
      }
    ]
  }
}
```

### Setup a list of sitemaps

To declare a list of sitemaps, use an `array` to setup each sitemap with its own configuration.  
You can combine sitemap and sitemap index configurations.

```js
// nuxt.config.js

{
  sitemap: [
    {
      path: '/sitemap-products.xml',
      routes: [
        // array of URL
      ]
    }, {
      path: '/sitemap-news.xml',
      routes: () => // promise or function
    }, {
      path: '/sitemapindex.xml',
      sitemaps: [{
        // array of Sitemap configuration
      }]
    }
  }
}
```

## Sitemap Options

### `routes` (optional) - array | function

- Default: `[]` or [`generate.routes`](https://nuxtjs.org/api/configuration-generate#routes) value from your `nuxt.config.js`

The `routes` parameter follows the same way than the `generate` [configuration](https://nuxtjs.org/api/configuration-generate#routes).

See as well the [routes declaration](#routes-declaration) examples below.

### `path` (optional) - string

- Default: `/sitemap.xml`

The URL path of the generated sitemap.

### `hostname` (optional) - string

- Default:
  1. `sitemap.hostname` value from your `nuxt.config.js`
  2. [`build.publicPath`](https://nuxtjs.org/api/configuration-build/#publicpath) value from your `nuxt.config.js` (⚠️ **deprecated**)
  3. [`os.hostname()`](https://nodejs.org/api/os.html#os_os_hostname) in **generate** or **spa** mode, or dynamically based on request URL (`headers.host`) in **ssr** mode

This value is **mandatory** for generation sitemap file, and you should explicitly provide it in **generate** or **spa** mode.

⚠️ The usage of `build.publicPath` as default value is deprecated and will be removed on release v3.0.  
To disable it on the current release, set a falsy value (eg. `hostname: false`).

### `cacheTime` (optional) - number

- Default: `1000 * 60 * 15` (15 Minutes)

Defines how frequently sitemap **routes** should be updated (value in milliseconds).  
Setting a negative value will disable the cache.

Please note that after each invalidation, `routes` will be evaluated again (see [routes declaration](#routes-declaration) section).

This option is only available in **ssr** mode.

### `etag` (optional) - object

- Default: [`render.etag`](https://nuxtjs.org/api/configuration-render#etag) value from your `nuxt.config.js`

Enable the etag cache header on sitemap (see [etag](https://nuxtjs.org/api/configuration-render#etag) docs for possible options).

To disable etag for sitemap set `etag: false`

This option is only available in **ssr** mode.

### `exclude` (optional) - string array

- Default: `[]`

The `exclude` parameter is an array of [glob patterns](https://github.com/isaacs/minimatch#features) to exclude static routes from the generated sitemap.

### `filter` (optional) - function

- Default: `undefined`

If the `filter` option is set as a function, all routes will be filtered through it.

This option is useful to customize or extend the features of the module, before the sitemap generation.

Examples:

```js
// nuxt.config.js

// Filter routes by language
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

// Add a trailing slash to each route
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

### `gzip` (optional) - boolean

- Default: `false`

Enable the creation of the `.xml.gz` sitemap compressed with gzip.

### `xmlNs` (optional) - string

- Default: `undefined`

Set the XML namespaces by override all default `xmlns` attributes in `<urlset>` element.

```js
// nuxt.config.js

{
  sitemap: {
    xmlNs: 'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'
  }
}
```

### `xslUrl` (optional) - string

- Default: `undefined`

The URL path of the XSL file to style the sitemap.

### `trailingSlash` (optional) - boolean

- Default: `false`

Add a trailing slash to each route URL (eg. `/page/1` => `/page/1/`)

> **notice:** To avoid [duplicate content](https://support.google.com/webmasters/answer/66359) detection from crawlers, you have to configure an HTTP 301 redirect between the 2 URLs (see [redirect-module](https://github.com/nuxt-community/redirect-module) or [nuxt-trailingslash-module](https://github.com/WilliamDASILVA/nuxt-trailingslash-module)).

### `i18n` (optional) - string | object

- Default: `undefined`

Configure the support of localized routes from **[nuxt-i18n](https://www.npmjs.com/package/nuxt-i18n)** module.

If the `i18n` option is configured, the sitemap module will automatically add the default locale URL of each page in a `<loc>` element, with child `<xhtml:link>` entries listing every language/locale variant of the page including itself (see [Google sitemap guidelines](https://support.google.com/webmasters/answer/189077)).

Example:

```js
// nuxt.config.js

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

### `defaults` (optional) - object

- Default: `{}`

The `defaults` parameter set the default options for all routes.

```js
// nuxt.config.js

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

See available options: https://github.com/ekalinin/sitemap.js/blob/4.1.1/README.md#sitemap-item-options

## Sitemap Index Options

### `path` (optional) - string

- Default: `/sitemapindex.xml`

The URL path of the generated sitemap index.

### `hostname` (optional) - string

Set the `hostname` value to each sitemap linked to its sitemap index.

### `sitemaps` - array of object

- Default: `[]`

Array of [sitemap configuration](#sitemap-options]) linked to the sitemap index.

```js
// nuxt.config.js

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

See more [examples](#usage) above.

### `lastmod` (optional) - string

Set the `lastmod` value to each sitemap linked to its sitemap index.

In addition, the `lastmod` can be defined for each linked sitemap.

```js
// nuxt.config.js

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

### `etag` (optional) - object

- Default: [`render.etag`](https://nuxtjs.org/api/configuration-render#etag) value from your `nuxt.config.js`

Enable the etag cache header on sitemap index (See [etag](https://nuxtjs.org/api/configuration-render#etag) docs for possible options).

To disable etag for sitemap index set `etag: false`

This option is only available in **ssr** mode.

### `gzip` (optional) - boolean

- Default: `false`

Enable the creation of the `.xml.gz` sitemap index compressed with gzip.

### `xmlNs` (optional) - string

- Default: `undefined`

Set the XML namespaces by override all default `xmlns` attributes in `<sitemapindex>` element.

```js
// nuxt.config.js

{
  sitemap: {
    xmlNs: 'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    sitemaps: [...]
  }
}
```

### `xslUrl` (optional) - string

- Default: `undefined`

The URL path of the XSL file to style the sitemap index.

## Routes Declaration

By default, the dynamic routes are ignored by the sitemap module.  
Nuxt cannot automatically provide this type of complex routes.

Example:

```
-| pages/
---| index.vue  --> static route
---| about.vue  --> static route
---| users/
-----| _id.vue  --> dynamic route
```

If you want the module to add any route with dynamic parameters, you have to set an array of dynamic routes.

eg. add routes for `/users/:id` in the configuration:

### From a static list

```js
// nuxt.config.js

{
  sitemap: {
    routes: ['/users/1', '/users/2', '/users/3']
  }
}
```

### From a function which returns a Promise

```js
// nuxt.config.js

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


## Hooks

Hooks are listeners to Nuxt events. [Learn more](https://nuxtjs.org/api/configuration-hooks)

You can register hooks on certain life cycle events.

| Hook  | Arguments  | When  | 
|---|---|---|
| sitemap:generate:before  | (nuxt, sitemapOptions)  | Hook on before site generation  |
| sitemap:generate:done  |  (nuxt) | Hook on sitemap generation finished |

## License

[MIT License](./LICENSE)

## Contributors

- [Nicolas Pennec](https://github.com/NicoPennec)
- [Pooya Parsa](https://github.com/pi0)
