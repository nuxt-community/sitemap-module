---
title: Configurar
description: 'Configurar o módulo sitemap para a Nuxt'
position: 2
category: Guide
---

## Instalação

Adicionar a dependência `@nuxtjs/sitemap` ao seu projeto:

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

## Configurar

Adicionar `@nuxtjs/sitemap` para a secção `modules` do seu ficheiro `nuxt.config.js`:

```js[nuxt.config.js]
{
  modules: [
    '@nuxtjs/sitemap'
  ],
}
```

> **Atenção:**
> Se você usa outros módulos (exemplo, `nuxt-i18n`), sempre declare o módulo sitemap no final do arranjo
> exemplo, `modules: ['nuxt-i18n', '@nuxtjs/sitemap']`
