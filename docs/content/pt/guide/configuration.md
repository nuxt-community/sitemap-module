---
title: Configuração
description: 'Adicionar uma configuração personalizada para o módulo sitemap'
position: 3
category: Guide
---

Adicionar uma configuração personalizada com a propriedade `sitemap`:

```js[nuxt.config.js]
{
  modules: [
    '@nuxtjs/sitemap'
  ],
  sitemap: {
    // opções
  },
}
```

O parâmetro da opção do módulo pode ser:

### `Object`

Um item único de [sitemap](/usage/sitemap) ou [índice de sitemap](#sitemap-index-options):

```js
{
  sitemap: {
    // ...
  },
}
```

### `Array`

Uma lista de [sitemap](#sitemap-options) ou itens de [índice de sitemap](#sitemap-index-options) items:

```js
{
  sitemap: [
    {
      // ...
    },
    {
      // ...
    },
  ],
}
```

### `Function`

Uma função que retorna uma configuração de sitemap válida:

```js
{
  sitemap: function () {
    return {
      // ...
    }
  },
}
```

### `Boolean`

Você pode desativar o módulo sitemap com um valor booleano `false`:

```js
{
  sitemap: false
}
```
