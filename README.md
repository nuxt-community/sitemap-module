# Sitemap Module

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![Circle CI][circle-ci-src]][circle-ci-href]
[![Codecov][codecov-src]][codecov-href]
[![Dependencies][david-dm-src]][david-dm-href]
[![Standard JS][standard-js-src]][standard-js-href]

> Automatically generate or serve dynamic [sitemap.xml](https://www.sitemaps.org/protocol.html) for Nuxt.js projects!

[📖 **Release Notes**](./CHANGELOG.md)

## Features

- Module based on the awesome **[sitemap.js](https://github.com/ekalinin/sitemap.js) package** ❤️
- Automatically add the static routes to the sitemap
- Works with **all modes** (universal, spa, generate)
- For **Nuxt 1.x** and higher

## Setup

1. Add the `@nuxtjs/sitemap` dependency with `yarn` or `npm` to your project
2. Add `@nuxtjs/sitemap` to the `modules` section of `nuxt.config.js`
3. Configure it:

```js
{
  modules: [
    '@nuxtjs/sitemap'
  ]
```

> **notice:** If you use other modules (eg. `nuxt-i18n`), always declare the sitemap module at end of array (eg. `modules: ['nuxt-i18n', '@nuxtjs/sitemap']`)

- Configure it:

```js
{
  modules: [
    '@nuxtjs/sitemap'
  ],
  sitemap: {
    hostname: 'https://example.com',
    gzip: true,
    exclude: [
      '/secret',
      '/admin/**'
    ],
    routes: [
      '/page/1',
      {
        url: '/page/2',
        changefreq: 'daily',
        priority: 1,
        lastmodISO: '2017-06-30T13:30:00.000Z'
      }
    ]
  }
}
```

## Options

### `routes` (optional)

- Default: `[]` or [`generate.routes`](https://nuxtjs.org/api/configuration-generate#routes) value from your `nuxt.config.js`

The `routes` parameter follows the same way than the `generate` [configuration](https://nuxtjs.org/api/configuration-generate).

See as well the [routes](#routes-1) examples below.

### `path` (optional)

- Default: `/sitemap.xml`

The URL path of the generated sitemap.

### `hostname` (optional)

- Default:
  1. `sitemap.hostname` value from your `nuxt.config.js`
  2. [`build.publicPath`](https://nuxtjs.org/api/configuration-build/#publicpath) value from your `nuxt.config.js`
  3. [`os.hostname()`](https://nodejs.org/api/os.html#os_os_hostname) for **generate** or **spa** mode, or dynamically based on request URL (`headers.host`) for **universal** mode

This value is **mandatory** for generation sitemap file, and you should explicitly provide it for **generate** or **spa** mode.

### `exclude` (optional)

- Default: `[]`

The `exclude` parameter is an array of [glob patterns](https://github.com/isaacs/minimatch#features) to exclude static routes from the generated sitemap.

### `cacheTime` (optional)

- Default: `1000 * 60 * 15` (15 Minutes)

Defines how frequently should sitemap **routes** being updated.

Please note that after each invalidation, `routes` will be evaluated again. (See [routes](#routes-1) section)

### `filter` (optional)

- Default: `undefined`

If `filter` option is set as a function, all routes will be filtered through it.

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
      return routes.map(route => route.url = `${route.url}/`)
    }
  }
}
```

### `gzip` (optional)

- Default: `false`

Enable the creation of the `.xml.gz` sitemap compressed with gzip.

### `xmlNs` (optional)

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

### `xslUrl` (optional)

- Default: `undefined`

The URL path of the XSL file to style the sitemap.

### `defaults` (optional)

- Default: `{}`

The `defaults` parameter set the default options for all routes.

```js
// nuxt.config.js

{
  sitemap: {
    defaults: {
      changefreq: 'daily',
      priority: 1,
      lastmod: new Date(),
      lastmodrealtime: true
    }
  }
}
```

See available options: <https://github.com/ekalinin/sitemap.js#usage>

## Routes

By default, the dynamic routes are ignored by the sitemap module.  
Nuxt cannot automatically provide this type of complex routes.

Example:

```bash
-| pages/
---| index.vue  --> static route
---| about.vue  --> static route
---| users/
-----| _id.vue  --> dynamic route
```

If you want the module to add any route with dynamic parameters, you have to set an array of dynamic routes.

eg. add routes for `/users/:id` in the configuration:

```js
// nuxt.config.js

{
  sitemap: {
    routes: [
      '/users/1',
      '/users/2',
      '/users/3'
    ]
  }
}
```

### Function which returns a Promise

```js
// nuxt.config.js

const axios = require('axios')

{
  sitemap: {
    routes () {
      return axios.get('https://jsonplaceholder.typicode.com/users')
        .then(res => res.data.map(user => '/users/' + user.username))
    }
  }
}
```

### Function with a callback

**This feature is deprecated**. Use a promise-based approach instead.

```js
// nuxt.config.js

const axios = require('axios')

{
  sitemap: {
    routes (callback) {
      axios.get('https://jsonplaceholder.typicode.com/users')
      .then(res => {
        let routes = res.data.map(user => '/users/' + user.username)
        callback(null, routes)
      })
      .catch(callback)
    }
  }
}
```

## Development

1. Clone this repository
2. Install dependencies using `yarn install` or `npm install`
3. Start development server using `npm run dev`

## License

[MIT License](./LICENSE)

Copyright (c) Nuxt Community

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/dt/@nuxtjs/sitemap-module.svg?style=flat-square
[npm-version-href]: https://npmjs.com/package/@nuxtjs/sitemap-module

[npm-downloads-src]: https://img.shields.io/npm/v/@nuxtjs/sitemap-module/latest.svg?style=flat-square
[npm-downloads-href]: https://npmjs.com/package/@nuxtjs/sitemap-module

[circle-ci-src]: https://img.shields.io/circleci/project/github/nuxt-community/sitemap-module.svg?style=flat-square
[circle-ci-href]: https://circleci.com/gh/nuxt-community/sitemap-module

[codecov-src]: https://img.shields.io/codecov/c/github/nuxt-community/sitemap-module.svg?style=flat-square
[codecov-href]: https://codecov.io/gh/nuxt-community/sitemap-module

[david-dm-src]: https://david-dm.org/nuxt-community/sitemap-module/status.svg?style=flat-square
[david-dm-href]: https://david-dm.org/nuxt-community/sitemap-module

[standard-js-src]: https://img.shields.io/badge/code_style-standard-brightgreen.svg?style=flat-square
[standard-js-href]: https://standardjs.com
