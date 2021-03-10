---
title: Sitemap options
description: 'Sitemap options module'
position: 6
category: Usage
---

### `routes` (optional) - array | function

- Default: `[]` or [`generate.routes`](https://nuxtjs.org/api/configuration-generate#routes) value from your `nuxt.config.js`

The `routes` parameter follows the same way than the `generate` [configuration](https://nuxtjs.org/api/configuration-generate#routes).

See as well the [routes declaration](/usage/sitemap-options#routes-declaration) examples below.

### `path` (optional) - string

- Default: `/sitemap.xml`

The URL path of the generated sitemap.

### `hostname` (optional) - string

- Default:
  1. `sitemap.hostname` value from your `nuxt.config.js`
  2. [`build.publicPath`](https://nuxtjs.org/api/configuration-build/#publicpath) value from your `nuxt.config.js` (⚠️ **deprecated**)
  3. [`os.hostname()`](https://nodejs.org/api/os.html#os_os_hostname) in **generate** or **spa** mode, or dynamically based on request URL (`headers.host`) in **ssr** mode

This value is **mandatory** for generation sitemap file, and you should explicitly provide it in **generate** or **spa** mode.

<alert type="warning">

  The usage of `build.publicPath` as default value is deprecated and will be removed on release v3.0.  
  To disable it on the current release, set a falsy value (eg. `hostname: false`).

</alert>

### `cacheTime` (optional) - number

- Default: `1000 * 60 * 15` (15 Minutes)

Defines how frequently sitemap **routes** should be updated (value in milliseconds).  
Setting a negative value will disable the cache.

Please note that after each invalidation, `routes` will be evaluated again (see [routes declaration](/usage/sitemap-options#routes-declaration) section).

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

```js[nuxt.config.js]
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

```js[nuxt.config.js]
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

Configure the support of localized routes from **[nuxt-i18n](https://i18n.nuxtjs.org/)** module.

If the `i18n` option is configured, the sitemap module will automatically add the default locale URL of each page in a `<loc>` element, with child `<xhtml:link>` entries listing every language/locale variant of the page including itself (see [Google sitemap guidelines](https://support.google.com/webmasters/answer/189077)).

Example:

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

### `defaults` (optional) - object

- Default: `{}`

The `defaults` parameter set the default options for all routes.

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

[See available options](https://github.com/ekalinin/sitemap.js/blob/4.1.1/README.md#sitemap-item-options)

## Sitemap Index Options

### `path` (optional) - string

- Default: `/sitemapindex.xml`

The URL path of the generated sitemap index.

### `hostname` (optional) - string

Set the `hostname` value to each sitemap linked to its sitemap index.

### `sitemaps` - array of object

- Default: `[]`

Array of [sitemap configuration](/usage/sitemap-options#routes-optional---array--function) linked to the sitemap index.

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

See more [examples](/usage/sitemap#setup-a-sitemap) above.

### `lastmod` (optional) - string

Set the `lastmod` value to each sitemap linked to its sitemap index.

In addition, the `lastmod` can be defined for each linked sitemap.

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

```js[nuxt.config.js]
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

```js[nuxt.config.js]
{
  sitemap: {
    routes: ['/users/1', '/users/2', '/users/3']
  }
}
```

### From a function which returns a Promise

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
