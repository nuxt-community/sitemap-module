---
title: Sitemap
description: 'Setup a Sitemap'
position: 4
category: Usage
---

### Setup a Sitemap

By default, the sitemap is setup to the following path: `/sitemap.xml`  

All static routes (eg. `/pages/about.vue`) are automatically add to the sitemap, but you can exclude each of them with the [`exclude`](/usage/sitemap-options#exclude-optional---string-array) property.  

For dynamic routes (eg. `/pages/_id.vue`), you have to declare them with the [`routes`](/usage/sitemap-options#routes-optional---array--function) property. This option can be an array or a function. In addition, the routes defined in `generate.routes` will be automatically used for the sitemap.

```js[nuxt.config.js]
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
