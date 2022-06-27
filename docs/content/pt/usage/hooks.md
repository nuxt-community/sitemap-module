---
title: Gatilhos
description: 'Gatilhos para o módulo sitemap'
position: 7
category: Usage
---

Os gatilhos são observadores para eventos da Nuxt. [Leia mais](https://nuxtjs.org/api/configuration-hooks)

Você pode registar os gatilhos em certos eventos do ciclo de vida.

| Gatilho  | Argumentos  | Quando | 
|---|---|---|
| sitemap:generate:before  | (nuxt, sitemapOptions) | Acionado antes da geração do sítio |
| sitemap:generate:done  | (nuxt) | Acionado depois de terminado a geração do sitemap |
