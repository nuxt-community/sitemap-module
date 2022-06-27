---
title: Sitemap
description: 'Configurar um sitemap'
position: 4
category: Usage
---

### Configurar um sitemap

Por padrão, o sitemap é configurado para o seguinte caminho: `/sitemap.xml`

Todas as rotas estáticas (exemplo, `/pages/about.vue`) são automaticamente adicionado ao sitemap, mas você pode excluir cada um deles com a propriedade [`exclude`](/usage/sitemap-options#exclude-optional---string-array)

Para as rotas dinâmicas (exemplo, `/pages/_id.vue`), você precisa declará-los com a propriedade [`routes`](/usage/sitemap-options#routes-optional---array--function). Esta opção pode ser um arranjo ou uma função. Além disso, as rotas definidas em `generate.routes` serão automaticamente usados pelo sitemap.

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
