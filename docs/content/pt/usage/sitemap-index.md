---
title: Índice de sitemap
description: 'Declarar um índice de sitemap e seus sitemaps ligados'
position: 5
category: Usage
---

### Configurar um índice de sitemap

Para declarar um índice o sitemap e seus sitemaps ligados, use a propriedade [`sitemaps`](/usage/sitemap-options#sitemaps---array-of-object).

Por padrão, o índice do sitemap é configurado para o seguinte caminho: `/Sitemap.xml`

Todo item do arranjo `sitemaps` pode ser configurado com as suas próprias [opções de sitemap]/usage/sitemap-options).

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

### Configurar uma lista de sitemaps

Para declarar uma lista de sitemaps, use um `array` para configurar cada sitemap com sua própria configuração.

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
