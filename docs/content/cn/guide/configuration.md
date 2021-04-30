---
title: 配置项
description: '为sitemap module添加自定义配置'
position: 3
category: 指南
---

通过 `sitemap` 属性添加自定义配置:

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

options字段可以是以下内容:

### `Object`

一个简单的 [sitemap](/cn/usage/sitemap) 或 [sitemap index](/cn/usage/sitemap-index) :

```js
{
  sitemap: {
    // ...
  },
}
```

### `Array`

一组包含 [sitemap](/cn/usage/sitemap-options) 或 [sitemap index](/cn/usage/sitemap-index) 的列表:

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

一个返回有效sitemap配置的函数:

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

您可以通过设置 `false` 来关闭站点地图功能:

```js
{
  sitemap: false
}
```
