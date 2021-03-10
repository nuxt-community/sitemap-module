---
title: Configuration
description: 'Add a custom configuration for the sitemap module'
position: 3
category: Guide
---

Add a custom configuration with the `sitemap` property:

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

The module option parameter can be:

### `Object`

A single item of [sitemap](/usage/sitemap) or [sitemap index](#sitemap-index-options):

```js
{
  sitemap: {
    // ...
  },
}
```

### `Array`

A list of [sitemap](#sitemap-options) or [sitemap index](#sitemap-index-options) items:

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

A function that returns a valid sitemap configuration:

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

You can disable the sitemap module with a boolean value at `false`:

```js
{
  sitemap: false
}
```