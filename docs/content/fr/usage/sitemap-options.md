---
title: Options de plan du site
description: 'Options du module de plan du site'
position: 6
category: Utilisation
---

### `routes` (optionnel) - array | function

- Défaut: `[]` ou la valeur [`generate.routes`](https://nuxtjs.org/api/configuration-generate#routes) depuis votre `nuxt.config.js`

Le paramètre `routes` suit la même logique que la [configuration `generate`](https://nuxtjs.org/api/configuration-generate#routes).

Voir aussi la [déclaration des routes](/usage/sitemap-options#routes-declaration) des exemples ci-dessous.

### `path` (optionnel) - chaine de caractère

- Défaut: `/sitemap.xml`

Le chemin de l'URL du plan de site généré.

### `hostname` (optionnel) - chaine de caractère

- Défaut:
  1. `sitemap.hostname` valeur de votre `nuxt.config.js`
  2. [`build.publicPath`](https://nuxtjs.org/api/configuration-build/#publicpath) valeur de votre `nuxt.config.js` (⚠️ **obsolète**)
  3. [`os.hostname()`](https://nodejs.org/api/os.html#os_os_hostname) dans **generate** ou le mode **spa**, ou dynamiquement en fonction de l'URL de la demande (`headers.host`) dans le mode **ssr**

Cette valeur est **obligatoire** pour le fichier de génération de plan de site, et vous devez la fournir explicitement en mode **generate** ou **spa**.

<alert type="warning">

  L'utilisation de `build.publicPath` comme valeur par défaut est obsolète et sera supprimée à la version v3.0.
  Pour le désactiver sur la version actuelle, définissez une valeur falsifiée (par exemple, `hostname: false`).

</alert>

### `cacheTime` (optionnel) - nombre

- Défaut: `1000 * 60 * 15` (15 Minutes)

Définit la fréquence à laquelle le plan du site **routes** doit être mis à jour (valeur en millisecondes).
La définition d'une valeur négative désactivera le cache.

Veuillez noter qu'après chaque invalidation, les `routes` seront évaluées à nouveau (voir la section [déclaration de routes](/usage/sitemap-options#routes-declaration)).

Cette option n'est disponible qu'en mode **ssr**.

### `etag` (optionnel) - objet

- Défaut: [`render.etag`](https://nuxtjs.org/api/configuration-render#etag) valeur de votre `nuxt.config.js`

Activer l'en-tête du cache etag sur le plan du site (voir la documentation [etag](https://nuxtjs.org/api/configuration-render#etag) pour les options possibles).

Pour désactiver etag pour le plan de site défini `etag: false`

Cette option n'est disponible qu'en mode **ssr**.

### `exclude` (optionnel) - tableau de chaine de caractère

- Défaut: `[]`

Le paramètre `exclude` est un tableau de [glob patterns](https://github.com/isaacs/minimatch#features) pour exclure les routes statiques du plan de site généré.

### `filter` (optionnel) - fonction

- Défaut: `undefined`

Si l'option `filter` est définie comme une fonction, toutes les routes seront filtrées à travers elle.

Cette option est utile pour personnaliser ou étendre les fonctionnalités du module, avant la génération du plan de site.

Exemples:

```js[nuxt.config.js]
// Filter routes by language
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

// Add a trailing slash to each route
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

### `gzip` (optionnel) - boolean

- Défaut: `false`

Activez la création du plan de site `.xml.gz` compressé avec gzip.

### `xmlNs` (optionnel) - chaine de caractère

- Défaut: `undefined`

Définissez les espaces de noms XML en remplaçant tous les attributs par défaut `xmlns` dans l'élément `<urlset>`.

```js[nuxt.config.js]
{
  sitemap: {
    xmlNs: 'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'
  }
}
```

### `xslUrl` (optionnel) - chaine de caractère

- Défaut: `undefined`

The URL path of the XSL file to style the sitemap.

### `trailingSlash` (optionnel) - booléen

- Défaut: `false`

Ajouter une barre oblique à chaque URL de route (ex. `/page/1` => `/page/1/`)

> **remarque:** Pour éviter la détection de [contenu dupliqué](https://support.google.com/webmasters/answer/66359) des robots d'exploration, vous devez configurer une redirection HTTP 301 entre les 2 URLs (voir [redirect-module](https://github.com/nuxt-community/redirect-module) ou [nuxt-trailingslash-module](https://github.com/WilliamDASILVA/nuxt-trailingslash-module)).

### `i18n` (optionnel) - chaine de caractère | objet

- Défaut: `undefined`

Configurer la prise en charge des routes localisées à partir du module **[nuxt-i18n](https://i18n.nuxtjs.org/)**

Si l'option `i18n` est configurée, le module de plan de site ajoutera automatiquement l'URL de la locale par défaut de chaque page dans un élément `<loc>`, avec des entrées enfants `<xhtml:link>` listant toutes les variantes de langue/locale de la page y compris elle-même (voir les [Consignes relatives au plan du site Google](https://support.google.com/webmasters/answer/189077)).

Exemple:

```js[nuxt.config.js]
{
  modules: [
    'nuxt-i18n',
    '@nuxtjs/sitemap'
  ],
  i18n: {
    locales: ['en', 'es', 'fr'],
    DefaultLocale: 'en'
  },
  sitemap: {
    hostname: 'https://example.com',
    // shortcut notation (basic)
    i18n: true,
    // nuxt-i18n notation (advanced)
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

### `Default` (optionnel) - objet

- Défaut: `{}`

Le paramètre `Default` définit les options pour toutes les routes.

```js[nuxt.config.js]
{
  sitemap: {
    Default: {
      changefreq: 'daily',
      priority: 1,
      lastmod: new Date()
    }
  }
}
```

[Voir les options disponibles](https://github.com/ekalinin/sitemap.js/blob/4.1.1/README.md#sitemap-item-options)

## Options de plan du site

### `path` (optionnel) - chaine de caractère

- Défaut: `/sitemapindex.xml`

Chemin de l'URL de l'index de sitemap généré.

### `hostname` (optionnel) - chaine de caractère

Définissez la valeur `hostname` sur chaque plan de site lié à son index de plan de site.

### `sitemaps` - tableau d'objets

- Défaut: `[]`

Tableau de [configuration du plan du site](/usage/sitemap-options#routes-optionnel---array--function) lié à l'index du plan du site.

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

Voir les [exemples](/usage/sitemap#setup-a-sitemap) au dessus.

### `lastmod` (optionnel) - chaine de caractère

Définissez la valeur `lastmod` sur chaque plan de site lié à son index de plan de site.

De plus, la valeur `lastmod` peut être définie pour chaque plan de site lié.

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

### `etag` (optionnel) - objet

- Défaut: [`render.etag`](https://nuxtjs.org/api/configuration-render#etag) valeur de votre `nuxt.config.js`

Activer l'en-tête du cache etag sur l'index du plan de site (Voir la documentation [etag](https://nuxtjs.org/api/configuration-render#etag) pour les options possibles).

Pour désactiver etag pour l'ensemble d'index de plan de site, définissez `etag: false`

Cette option n'est disponible qu'en mode **ssr**.

### `gzip` (optionnel) - boolean

- Défaut: `false`

Activez la création de l'index du plan de site `.xml.gz` compressé avec gzip.

### `xmlNs` (optionnel) - chaine de caractère

- Défaut: `undefined`

Définissez les espaces de noms XML en remplaçant tous les attributs par défaut `xmlns` dans l'élément `<sitemapindex> `.

```js[nuxt.config.js]
{
  sitemap: {
    xmlNs: 'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    sitemaps: [...]
  }
}
```

### `xslUrl` (optionnel) - chaine de caractère

- Défaut: `undefined`

Chemin d'accès URL du fichier XSL pour styliser l'index du plan de site.

## Déclarations des routes

Par Défaut, les routes dynamiques sont ignorées par le module plan du site.
Nuxt ne peut pas fournir automatiquement ce type de routes complexes.

Exemple:

```
-| pages/
---| index.vue  --> static route
---| about.vue  --> static route
---| users/
-----| _id.vue  --> dynamic route
```

Si vous souhaitez que le module ajoute une route avec des paramètres dynamiques, vous devez définir un tableau de routes dynamiques.

ex. ajoutez des routes pour `/users/:id` dans la configuration:

### À partir d'une liste statique

```js[nuxt.config.js]
{
  sitemap: {
    routes: ['/users/1', '/users/2', '/users/3']
  }
}
```

### À partir d'une fonction qui renvoie une promesse

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
