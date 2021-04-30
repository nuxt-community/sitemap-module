---
title: 钩子
description: 'Sitemap module的钩子'
position: 7
category: 使用
---

钩子是 Nuxt 事件的监听者(listener)。 [了解详情](https://nuxtjs.org/api/configuration-hooks)

您可以在如下生命周期事件上注册钩子。

| 钩子  | 参数  | 何时触发  | 
|---|---|---|
| sitemap:generate:before  | (nuxt, sitemapOptions)  | 在生成站点前触发  |
| sitemap:generate:done  |  (nuxt) | 在生成站点完成后触发 |
