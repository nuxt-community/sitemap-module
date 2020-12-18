---
title: Sitemap index
description: 'Declare a sitemap index and its linked sitemaps'
position: 5
category: Usage
---

### Setup a Sitemap Index

To declare a sitemap index and its linked sitemaps, use the [`sitemaps`](/usage/sitemap-options#sitemaps---array-of-object) property.

By default, the sitemap index is setup to the following path: `/sitemapindex.xml`  

Each item of the `sitemaps` array can be setup with its own [sitemap options](/usage/sitemap-options).

```js[nuxt.config.js]
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

```js[nuxt.config.js]
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
