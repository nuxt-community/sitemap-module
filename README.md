[![@nuxtjs/sitemap](docs/static/preview.png)](https://sitemap.nuxtjs.org)

# Sitemap Module

[![npm (scoped with tag)](https://img.shields.io/npm/v/@nuxtjs/sitemap/latest?style=flat-square)](https://npmjs.com/package/@nuxtjs/sitemap)
[![Downloads](https://img.shields.io/npm/dw/@nuxtjs/sitemap?style=flat-square)](https://npmjs.com/package/@nuxtjs/sitemap)
[![Build Status](https://img.shields.io/circleci/project/github/nuxt-community/sitemap-module?style=flat-square)](https://app.circleci.com/pipelines/github/nuxt-community/sitemap-module)
[![Coverage Status](https://img.shields.io/codecov/c/github/nuxt-community/sitemap-module?style=flat-square)](https://codecov.io/gh/nuxt-community/sitemap-module)
[![License](https://img.shields.io/npm/l/@nuxtjs/sitemap?style=flat-square)](http://standardjs.com)

> Automatically generate or serve dynamic [sitemap.xml](https://www.sitemaps.org/protocol.html) for Nuxt projects!

<p align="center">
  <a href="https://sitemap.nuxtjs.org">Read Documentation</a>
</p>

[📖 **Release Notes**](./CHANGELOG.md)

# Warning
this package is highly experimental, and may cause unknown issues, feel free to report them.

## Currently broken
- Tests for nuxt-i18n are not working, since nuxt-i18n is not Nuxt 3 ready yet.
- when you're using a function in the sitemap config e.g. for dynamic routes, you need make to sure to use require instead of imports, when using external dependencies.  Example:

`nuxt.config.ts`
```js
import dynamicRoutes from './helpers/dynamicRoutes'
...
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

`/helpers/dynamicRoutes.ts`
```js
/**
 * We are using Storyblok as our CMS,
 * in order to have all news and testimonials pages in our sitemap
 * we need to fetch some from Storyblok
 */
export default async () => {
  const config = useRuntimeConfig()

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { apiPlugin } = require('@storyblok/js')
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
}
```

## License

[MIT License](./LICENSE)

## Contributors

- [Nicolas Pennec](https://github.com/NicoPennec)
- [Pooya Parsa](https://github.com/pi0)
