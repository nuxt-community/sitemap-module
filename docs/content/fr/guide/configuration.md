---
title: Configuration
description: 'Ajoutez une configuration personnalisée pour le module plan de site'
position: 3
category: Guide
---

Ajoutez une configuration personnalisée avec la propriété `sitemap` :

```js[nuxt.config.js]
{
  modules: [
    '@nuxtjs/sitemap'
  ],
  sitemap: {
    // options
  },
}
```

Le paramètre d'option de module peut être :

### `Object`

Un seul élément de [sitemap](/usage/sitemap) ou [sitemap index](#sitemap-index-options):

```js
{
  sitemap: {
    // ...
  },
}
```

### `Array`

Une liste de [sitemap](#sitemap-options) ou [sitemap index](#sitemap-index-options) items:

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

Une fonction qui renvoie une configuration de plan de site valide:

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

Vous pouvez désactiver le module sitemap avec une valeur booléenne à `false`:

```js
{
  sitemap: false
}
```