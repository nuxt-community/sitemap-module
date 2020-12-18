---
title: Installation
description: 'Installation du module de plan de site pour Nuxt'
position: 2
category: Guide
---

## Installation

Ajoutez la dépendance `@nuxtjs/sitemap` à votre projet :

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

Ajouter `@nuxtjs/sitemap` dans la section `modules` de votre fichier `nuxt.config.js` :

```js[nuxt.config.js]
{
  modules: [
    '@nuxtjs/sitemap'
  ],
}
```

> **Remarque:**  
> Si vous utilisez d'autres modules (eg. `nuxt-i18n`), déclarez toujours le module sitemap à la fin du tableau
> ex: `modules: ['nuxt-i18n', '@nuxtjs/sitemap']`
