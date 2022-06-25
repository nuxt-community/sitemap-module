---
title: Opções de sitemap
description: 'Módulo de opções de sitemap'
position: 6
category: Usage
---

### `routes` (opcional) - array | function

- Valor predefinido: `[]` ou valor de [`generate.routes`](https://nuxtjs.org/api/configuration-generate#routes) do seu `nuxt.config.js`


O parâmetro `routes` segue o mesmo caminho da [configuração]https://nuxtjs.org/api/configuration-generate#routes) do `generate`.

Consulte também os exemplos de [declaração das rotas](/usage/sitemap-options#routes-declaration) abaixo.

### `path` (opcional) - string

- Valor predefinido: `/sitemap.xml`

O caminho da URL do sitemap gerado.

### `hostname` (opcional) - string

- Valor predefinido:
  1. Valor de `sitemap.hostname` do seu `nuxt.config.js`
  2. Valor de [`build.publicPath`](https://nuxtjs.org/api/configuration-build/#publicpath) do seu `nuxt.config.js` (⚠️ **depreciado**)
  3. [`os.hostname()`](https://nodejs.org/api/os.html#os_os_hostname) no modo **generate** ou **spa**, ou dinamicamente baseado na URL (`headers.host`) da requisição no modo **spa**.

Este valor é **obrigatório** para geração do ficheiro sitemap, e você deve fornecê-lo explicitamente no modo **generate** ou **spa**.

<alert type="warning">

  O uso do `build.publicPath` como valor padrão está depreciado e será removido no lançamento da versão 3.0.
  Para desativá-lo no lançamento atual, defina um valor falso (exemplo, `hostname: false`).

</alert>

### `cacheTime` (opcional) - number

- Valor predefinido: `1000 * 60 * 15` (15 Minutos)

Define com que frequência as **rotas** do sitemap devem ser atualizadas (valor em milissegundos).
A definição de um valor negativo desativará o cache.

Por favor repare que depois de cada invalidação, as `rotas` serão avaliadas novamente (consulte a secção [declaração de rotas](/usage/sitemap-options#declaração-de-rotas)).

This option is only available in **ssr** mode.
Este opção apenas está disponível no modo **ssr**.

### `etag` (opcional) - object

- Valor predefinido: valor de [`render.etag`](https://nuxtjs.org/api/configuration-render#etag) do seu `nuxt.config.js`

Ativa o cabeçalho de cache do `etag` no sitemap (consulte documentação [etag](https://nuxtjs.org/api/configuration-render#etag) para possíveis opções).

Para desativar o `etag` para o sitemap defina `etag: false`

Esta opção está apenas disponível no modo **ssr**.

### `exclude` (opcional) - string array

- Valor predefinido: `[]`

O parâmetro `exclude` é um arranjo de [padrões glob](https://github.com/isaacs/minimatch#features) para excluir rotas estáticas a partir do sitemap gerado.

### `filter` (opcional) - function

- Valor predefinido: `undefined`

Se a opção `filter` estiver definida como função, todas as rotas serão filtradas através dela.

Esta opção é útil para personalizar ou estender as funcionalidades do módulo, antes da geração do sitemap.

Exemplos:

```js[nuxt.config.js]
// Filtrar as rotas por linguagem
{
  sitemap: {
    filter ({ routes, options }) {
      if (options.hostname === 'example.com') {
        return routes.filter(route => route.locale === 'en')
      }
      return routes.filter(route => route.locale === 'fr')
    }
  }
}

// Adicionar uma barra final para cada rota
{
  sitemap: {
    filter ({ routes }) {
      return routes.map(route => {
        route.url = `${route.url}/`
        return route
      })
    }
  }
}
```

### `gzip` (opcional) - boolean

- Valor predefinido: `false`

Ativa a criação do sitemap `.xml.gz` comprimida com o gzip.

### `xmlNs` (opcional) - string

- Valor predefinido: `undefined`

Define os nomes de espaços de XML pela sobrescrição de todos atributos predefinidos no elemento `<urlset>`.

```js[nuxt.config.js]
{
  sitemap: {
    xmlNs: 'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'
  }
}
```

### `xslUrl` (opcional) - string

- Valor predefinido: `undefined`

O caminho da URL do ficheiro XSL para estilizar o sitemap.

### `trailingSlash` (opcional) - boolean

- Valor predefinido: `false`

Adiciona uma barra final para cada rota de URL (exemplo, `/page/1` => `/page/1/`)

> **aviso:** para evitar deteção de [conteúdo duplicado](https://support.google.com/webmasters/answer/66359) a partir dos rastreadores, você precisa configurar um redirecionamento de código 301 de HTTP entre 2 URLs (consulte [redirect-module](https://github.com/nuxt-community/redirect-module) ou [nuxt-trailingslash-module](https://github.com/WilliamDASILVA/nuxt-trailingslash-module)).

### `i18n` (opcional) - string | object

- Valor predefinido: `undefined`

Configura o suporte de rotas localizadas a partir do módulo **[nuxt-i18n](https://i18n.nuxtjs.org/)**.

Se a opção `i18n` estiver configurada, o módulo sitemap adicionará automaticamente o local da URL padrão de cada página em um elemento `<loc>`, com entradas `<xhtml:link>` filhas listando todas variedade de idiomas/local da página incluindo a si mesma (consulte as [orientações de sitemap do Google](https://support.google.com/webmasters/answer/189077)).

Exemplo:

```js[nuxt.config.js]
{
  modules: [
    'nuxt-i18n',
    '@nuxtjs/sitemap'
  ],
  i18n: {
    locales: ['en', 'es', 'fr'],
    defaultLocale: 'en'
  },
  sitemap: {
    hostname: 'https://example.com',
    // notação de atalho (básico)
    i18n: true,
    // notação do nuxt-i18n (avançado)
    i18n: {
      locales: ['en', 'es', 'fr'],
      routesNameSeparator: '___'
    }
  }
}
```

```xml
  <url>
    <loc>https://example.com/</loc>
    <xhtml:link rel="alternate" hreflang="en" href="https://example.com/"/>
    <xhtml:link rel="alternate" hreflang="es" href="https://example.com/es/"/>
    <xhtml:link rel="alternate" hreflang="fr" href="https://example.com/fr/"/>
  </url>
  <url>
    <loc>https://example.com/es/</loc>
    <xhtml:link rel="alternate" hreflang="en" href="https://example.com/"/>
    <xhtml:link rel="alternate" hreflang="es" href="https://example.com/es/"/>
    <xhtml:link rel="alternate" hreflang="fr" href="https://example.com/fr/"/>
  </url>
  <url>
    <loc>https://example.com/fr/</loc>
    <xhtml:link rel="alternate" hreflang="en" href="https://example.com/"/>
    <xhtml:link rel="alternate" hreflang="es" href="https://example.com/es/"/>
    <xhtml:link rel="alternate" hreflang="fr" href="https://example.com/fr/"/>
  </url>
```

### `defaults` (opcional) - object

- Valor predefinido: `{}`

O parâmetro `defaults` define as opções padrão para todas rotas.

```js[nuxt.config.js]
{
  sitemap: {
    defaults: {
      changefreq: 'daily',
      priority: 1,
      lastmod: new Date()
    }
  }
}
```

[Consulte as opções disponíveis](https://github.com/ekalinin/sitemap.js/blob/4.1.1/README.md#sitemap-item-options)

## Opções do Índice do Sitemap

### `path` (opcional) - string

- Valor predefinido: `/sitemapindex.xml`

O caminho da URL do índice do sitemap gerado.

### `hostname` (opcional) - string

Defina o valor `hostname` para cada sitemap ligados ao seu índice de sitemap.

### `sitemaps` - array of object

- Valor predefinido: `[]`

Arranjo de [configuração de sitemap](/usage/sitemap-options#routes-opcional---array--function) ligados ao índice do sitemap.

```js[nuxt.config.js]
{
  sitemap: {
    path: '/sitemapindex.xml',
    hostname: 'https://example.com',
    sitemaps: [
      {
        path: '/sitemap-foo.xml',
        // ...
      }, {
        path: '/folder/sitemap-bar.xml',
        // ...
      }
    ]
  }
}
```

```xml
<!-- generated sitemapindex.xml -->

<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://example.com/sitemap-foo.xml</loc>
  </sitemap>
  <sitemap>
    <loc>https://example.com/folder/sitemap-bar.xml</loc>
  </sitemap>
</sitemapindex>
```

Consulte mais [exemplos](/usage/sitemap#setup-a-sitemap acima.

### `lastmod` (opcional) - string

Defina o valor `lastmod` para cada sitemap ligado para o seu índice de sitemap.

Além disso, o `lastmod` pode ser definido para cada sitemap ligado.

```js[nuxt.config.js]
{
  sitemap: {
    lastmod: "2020-01-01",
    sitemaps: [
      {
        path: '/sitemap-foo.xml',
        lastmod: "2020-01-02"
      }, {
        path: '/sitemap-bar.xml'
      }
    ]
  }
}
```

### `etag` (opcional) - object

- Valor predefinido: valor de [`render.etag`](https://nuxtjs.org/api/configuration-render#etag) do seu `nuxt.config.js`

Ativa o cabeçalho de cache `etag` no índice do sitemap (Consulte a documentação [etag](https://nuxtjs.org/api/configuration-render#etag) para possíveis opções).

Para desativar o `etag` para o índice de sitemap defina o `etag: false`

Esta opção está apenas disponível no modo **ssr**.

### `gzip` (opcional) - boolean

- Valor predefinido: `false`

Ativa a criação do `.xml.gz` do índice do sitemap comprimido com gzip.

### `xmlNs` (opcional) - string

- Valor predefinido: `undefined`

Define o nome de espaços de XML pela sobrescrição de todos atributos padrão `xmls` no elemento `<sitemapindex>`.

```js[nuxt.config.js]
{
  sitemap: {
    xmlNs: 'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    sitemaps: [...]
  }
}
```

### `xslUrl` (opcional) - string

- Valor predefinido: `undefined`

O caminho da URL do ficheiro XSL para estilizar o índice do sitemap.

## Declaração de Rotas

Por padrão, as rotas dinâmicas são ignoradas pelo módulo sitemap.
A Nuxt não consegue fornecer este tipo de rotas complexa automaticamente.

Exemplo:

```
-| pages/
---| index.vue  --> static route
---| about.vue  --> static route
---| users/
-----| _id.vue  --> dynamic route
```

Se você quiser que o módulo adicione qualquer rota com parâmetros dinâmicos, você precisa definir um arranjo de rotas dinâmicas.

Por exemplo, adicionar rotas para `/users/:id` na configuração:

### A partir de uma lista estática

```js[nuxt.config.js]
{
  sitemap: {
    routes: ['/users/1', '/users/2', '/users/3']
  }
}
```

### A partir de uma função que retorna uma Promessa

```js[nuxt.config.js]
const axios = require('axios')

{
  sitemap: {
    routes: async () => {
      const { data } = await axios.get('https://jsonplaceholder.typicode.com/users')
      return data.map((user) => `/users/${user.username}`)
    }
  }
}
```
