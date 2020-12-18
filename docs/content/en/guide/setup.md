---
title: Setup
description: 'Setup sitemap module for Nuxt'
position: 2
category: Guide
---

## Installation

Add `@nuxtjs/sitemap` dependency to your project:

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

## Setup

Add `@nuxtjs/sitemap` to the `modules` section of your `nuxt.config.js` file:

```js[nuxt.config.js]
{
  modules: [
    '@nuxtjs/sitemap'
  ],
}
```

> **notice:**  
> If you use other modules (eg. `nuxt-i18n`), always declare the sitemap module at end of array  
> eg. `modules: ['nuxt-i18n', '@nuxtjs/sitemap']`
