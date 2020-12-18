---
title: Plan de site
description: 'Configurer un plan de site'
position: 4
category: Utilisation
---

### Configurer un plan de site

Par défaut, le plan du site est configuré sur le chemin suivant : `/sitemap.xml`  

Toutes les routes statiques (par exemple `/pages/about.vue`) sont automatiquement ajoutées au plan du site, mais vous pouvez exclure chacun d'eux avecc la propriété [`exclude`](/usage/sitemap-options#exclude-optional---string-array).  

Pour les routes dynamiques (eg. `/pages/_id.vue`), vous devez les déclarer avec la propriété [`routes`](/usage/sitemap-options#routes-optional---array--function). Cette option peut être un tableau ou une fonction. De plus, les routes définies dans `generate.routes` seront automatiquement utilisées pour le plan du site.

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
