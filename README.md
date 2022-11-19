[![@nuxtjs/sitemap](docs/static/preview.png)](https://sitemap.nuxtjs.org)

# Sitemap Module

[![npm (scoped with tag)](https://img.shields.io/npm/v/@funken-studio/sitemap-nuxt-3/latest?style=flat-square)](https://www.npmjs.com/package/@funken-studio/sitemap-nuxt-3)
[![Downloads](https://img.shields.io/npm/dw/@funken-studio/sitemap-nuxt-3?style=flat-square)](https://www.npmjs.com/package/@funken-studio/sitemap-nuxt-3)
[![Build Status](https://img.shields.io/circleci/project/github/nuxt-community/sitemap-module?style=flat-square)](https://app.circleci.com/pipelines/github/nuxt-community/sitemap-module)
[![Coverage Status](https://img.shields.io/codecov/c/github/nuxt-community/sitemap-module?style=flat-square)](https://codecov.io/gh/nuxt-community/sitemap-module)
[![License](https://img.shields.io/npm/l/@nuxtjs/sitemap?style=flat-square)](http://standardjs.com)

> Automatically generate or serve dynamic [sitemap.xml](https://www.sitemaps.org/protocol.html) for Nuxt projects!

<p align="center">
  <a href="https://sitemap.nuxtjs.org">Read Documentation</a>
</p>

[📖 **Release Notes**](./CHANGELOG.md)


## Generate sitemap.xml
Normally the sitemap.xml is served via a server middleware / handler, it is only generated in `.output/public` when running `nuxi generate`.

If you want to generate the sitemap.xml on every build, you can set the `generateOnBuild` option to `true` in the module configuration.
(That option might not work if you are using dynamic routes)

```js
// nuxt.config.js
modules: {
  ...
  ['@funken-studio/sitemap-nuxt-3', { generateOnBuild: true }],
  ...
}
```

## Using dynamic routes
- **you are not able to use imports!!**
- see below for a usable workaround:

`nuxt.config.ts`
```js
import dynamicRoutes from './helpers/dynamicRoutes'
...
 modules: [
    '@funken-studio/sitemap-nuxt-3',
],
sitemap: {
    hostname: 'https://example.com', 
    cacheTime: 1,
    routes: dynamicRoutes,
    defaults: {
      changefreq: 'daily',
      priority: 1,
      lastmod: new Date().toISOString(),
    },
},
...
```

`/helpers/dynamicRoutes`
```js
/**
 * since we can't use imports here we just fetch
 * all our routes from a custom API endpoint where we can use imports
 */
export default async () => {
  return await $fetch('/api/sitemap_routes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

```

`/server/api/sitemap_routes.ts`
```js
import { apiPlugin } from '@storyblok/vue'
import { eventHandler } from 'h3'

/**
 * We are using Storyblok as our CMS,
 * in order to have all news and testimonials pages in our sitemap
 * we need to fetch some from Storyblok
 */
export default eventHandler(async (event) => {
  const { req, res } = event
  if (req.method !== 'POST') {
    res.statusCode = 405
    res.end()
    return
  }
  const config = useRuntimeConfig()
  const { storyblokApi } = apiPlugin({ apiOptions: config.public.storyblok })
  console.log('[vue-sitemap] generate dynamic routes')

  const fetchRoutes = async (slug) => {
    const routes = []
    const pageInfo = await storyblokApi.get(`cdn/stories/?starts_with=${slug}`, {
      version: 'published',
      per_page: 1,
      page: 1,
    })

    const totalPages = Math.ceil(pageInfo.headers.total / 25)
    for (let page = 1; page <= totalPages; page++) {
      const pageNews = await storyblokApi.get(`cdn/stories/?starts_with=${slug}`, {
        version: 'published',
        page: page,
      })

      for (const news of pageNews.data.stories) {
        routes.push(`/${slug}/${news.slug}`)
      }

      routes.push(`/${slug}/${page}`)
    }
    return routes
  }

  return [...(await fetchRoutes('news')), ...(await fetchRoutes('testimonials'))]
})
```

## License

[MIT License](./LICENSE)

## Contributors

- [Nicolas Pennec](https://github.com/NicoPennec)
- [Pooya Parsa](https://github.com/pi0)
