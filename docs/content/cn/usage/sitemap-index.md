---
title: 站点地图索引
description: '声明一个站点地图索引和它所链接的站点地图'
position: 5
category: 使用
---

### 设置一个站点地图索引

要声明一个站点地图索引和它所链接的站点地图，请使用 [`sitemaps`](/cn/usage/sitemap-options#sitemaps---array-of-object)。

默认情况下，站点地图索引存放在路径: `/sitemapindex.xml`  

您可以给 `sitemaps` 数组内的子项目设置独自的 [sitemap options](/cn/usage/sitemap-options)。

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

### 设置多个sitemaps

要声明多个sitemaps，请使用 `array` 给每个sitemap设置独立的配置。  
您可以结合 sitemap 和 sitemap index 的配置。

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
