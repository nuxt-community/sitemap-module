---
title: 站点地图
description: '设置一个站点地图'
position: 4
category: 使用
---

### 设置一个站点地图

默认情况下，站点地图存放在路径: `/sitemap.xml`  

所有的静态路由 (例如 `/pages/about.vue`) 均会被自动添加到站点地图，但是您可以通过 [`exclude`](/cn/usage/sitemap-options#exclude-可选的---string-array) 排除某些项目。  
对于动态路由 (例如 `/pages/_id.vue`)，您必须通过 [`routes`](/cn/usage/sitemap-options#routes-可选的---array--function) 声明它们。 这个选项(即routes)可以是一个函数。 另外，站点地图会自动识别定义在 `generate.routes` 的路由。

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
