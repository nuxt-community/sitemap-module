---
title: 开始
description: '为Nuxt项目安装 sitemap module'
position: 2
category: 指南
---

## 安装

为您的项目添加 `@nuxtjs/sitemap` 依赖:

<code-group>
  <code-block label="Yarn" active>

  ```bash
  yarn add @nuxtjs/sitemap
  ```

  </code-block>
  <code-block label="NPM">

  ```bash
  npm install @nuxtjs/sitemap
  ```

  </code-block>
</code-group>

## 初始化

打开`nuxt.config.js`文件，添加 `@nuxtjs/sitemap` 到 `modules` 子配置:

```js[nuxt.config.js]
{
  modules: [
    '@nuxtjs/sitemap'
  ],
}
```

> **注意:**  
> 如果您还使用了其他模组(modules)，比如 `nuxt-i18n`，请把sitemap放在列表的最后  
> 例如 `modules: ['nuxt-i18n', '@nuxtjs/sitemap']`
