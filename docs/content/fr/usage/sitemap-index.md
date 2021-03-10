---
title: Index de plan de site
description: 'Déclarer un index de plan de site et ses plans de site associés'
position: 5
category: Utilisation
---

### Configurer un index de plan de site

Pour déclarer un index de plan de site et ses plans de site associés, utilisez la propriété [`sitemaps`](/usage/sitemap-options#sitemaps---array-of-object) property.

Par défaut, l'index du plan de site est configuré sur le chemin suivant : `/sitemapindex.xml`  

Chaque élément du tableau `sitemaps` peut être configuré avec a propre [option de plan de site](/usage/sitemap-options).

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

### Configurer une liste de plans de site

Pour déclarer une liste de plans de site, utilisez un `array` pour configurer chaque plan de site avec sa propre configuration.
Vous pouvez combiner des configurations d'index de plan de site et des plans de site.

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
