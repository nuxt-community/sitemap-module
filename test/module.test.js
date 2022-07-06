import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { existsSync, promises, readFileSync } from 'node:fs'
import { gunzipSync } from 'zlib'
import fetch from 'node-fetch'
import {
  setup,
  $fetch,
  buildFixture,
  startServer,
  useTestContext,
  stopServer,
  setTestContext,
  url,
} from '@nuxt/test-utils'
import { describe, expect, test, beforeEach } from 'vitest'
import { loadNuxt } from '@nuxt/kit'
import i18n from 'nuxt-i18n'
import sitemapModule from '..'

const request = (path, options = {}) => fetch(url(path), options)
const requestGzip = (path, options = {}) => request(path, { compress: true, ...options })
const getGzip = (path) => request(path, { compress: true }).then((res) => res.buffer())

// register hooks for vitest
setup({
  rootDir: fileURLToPath(new URL('./fixture', import.meta.url)),
  server: true,
})

/**
 * Custom loadFixture since we can not override the config otherwise ._.
 */
const isNuxtApp = (dir) => {
  return (
    existsSync(dir) &&
    (existsSync(resolve(dir, 'pages')) ||
      existsSync(resolve(dir, 'nuxt.config.js')) ||
      existsSync(resolve(dir, 'nuxt.config.ts')))
  )
}
const resolveRootDir = () => {
  const { options } = useTestContext()
  const dirs = [options.rootDir, resolve(options.testDir, options.fixture), process.cwd()]
  for (const dir of dirs) {
    if (dir && isNuxtApp(dir)) {
      return dir
    }
  }
  throw new Error('Invalid nuxt app. (Please explicitly set `options.rootDir` pointing to a valid nuxt app)')
}

async function updateConfig(config) {
  await stopServer()
  const ctx = useTestContext()
  ctx.options.nuxtConfig.sitemap = config
  ctx.options.rootDir = resolveRootDir()

  if (!ctx.options.dev) {
    const randomId = Math.random().toString(36).slice(2, 8)
    const buildDir = resolve(ctx.options.rootDir, '.nuxt', randomId)
    Object.assign(ctx.options.nuxtConfig, {
      buildDir,
      nitro: {
        output: {
          dir: resolve(buildDir, 'output'),
        },
      },
    })
  }

  ctx.nuxt = await loadNuxt({
    cwd: ctx.options.rootDir,
    dev: ctx.options.dev,
    overrides: ctx.options.nuxtConfig,
    configFile: ctx.options.configFile,
    ready: false,
  })

  // merge config or just assign
  if (Array.isArray(config) || !Object.keys(config).includes('sitemap')) {
    ctx.nuxt.options.sitemap = config
  } else {
    Object.keys(config).forEach((k) => {
      ctx.nuxt.options[k] = config[k]
    })
  }

  // start server
  try {
    await promises.mkdir(ctx.nuxt.options.buildDir, { recursive: true })
    await ctx.nuxt.ready()
    await setTestContext(ctx)
    await buildFixture()

    // start server if we are not only generating it
    if (!ctx.options.nuxtConfig._generate) {
      await startServer()
    }
  } catch (e) {
    await updateConfig(config)
  }
}
/** End custom load fixture */

describe('ssr - pages', () => {
  test('should render all pages', async () => {
    // static routes
    let html = await $fetch('/')

    expect(html).contain('/index')
    html = await $fetch('/sub/')
    expect(html).contain('/sub/index')
    html = await $fetch('/sub/sub')
    expect(html).contain('/sub/sub')

    // static child-routes
    html = await $fetch('/parent')
    expect(html).contain('/parent')
    html = await $fetch('/parent/child')
    expect(html).contain('/parent/child')
    html = await $fetch('/parent/child/subchild')
    expect(html).contain('/parent/child/subchild')

    // dynamic routes
    html = await $fetch('/child/')
    expect(html).contain('/child/index')
    html = await $fetch('/child/1')
    expect(html).contain('/child/1')
    html = await $fetch('/1/')
    expect(html).contain('/1/index')

    // excluded routes
    html = await $fetch('/exclude')
    expect(html).contain('/exclude')

    // filtered routes
    html = await $fetch('/filtered')
    expect(html).contain('/filtered')
  })
})

describe('sitemap - init options', () => {
  let xml = null

  test('as object', async () => {
    await updateConfig({
      hostname: 'https://example1.com/',
    })
    xml = await $fetch('/sitemap.xml')
    expect(xml).contain('<loc>https://example1.com/</loc>')
  })

  test('as array', async () => {
    await updateConfig([
      {
        hostname: 'https://example.com/',
      },
    ])

    xml = await $fetch('/sitemap.xml')
    expect(xml).contain('<loc>https://example.com/</loc>')
  })

  test('as function', async () => {
    await updateConfig(() => ({
      hostname: 'https://example2.com/',
    }))

    xml = await $fetch('/sitemap.xml')
    expect(xml).contain('<loc>https://example2.com/</loc>')
  })

  test('as boolean', async () => {
    await updateConfig(false)

    xml = await $fetch('/sitemap.xml')
    expect(xml).contain('<!DOCTYPE html>')
    expect(xml).not.contain('<loc>https://example.com/</loc>')
  })

  test('as boolean from function', async () => {
    await updateConfig(() => false)

    xml = await $fetch('/sitemap.xml')
    expect(xml).contain('<!DOCTYPE html>')
    expect(xml).not.contain('<loc>https://example.com/</loc>')
  })
})

describe('sitemap - minimal configuration', () => {
  test('sitemap.xml', async () => {
    await updateConfig({
      hostname: 'https://example.com/',
    })

    const xml = await $fetch('/sitemap.xml')
    expect(xml).toMatchSnapshot()
  })
})

describe('sitemap - advanced configuration', () => {
  let xml = null

  describe('custom options', () => {
    test('custom path', async () => {
      await updateConfig({
        path: '/custom-sitemap.xml',
        hostname: 'https://example.com/',
        exclude: ['/exclude'],
        routes: ['1/', 'child/1', { url: 'test/' }, { route: '/payload/1', payload: { id: 1 } }],
        filter: ({ routes }) => routes.filter((route) => route.url !== '/filtered'),
        defaults: {
          changefreq: 'daily',
          priority: 1,
        },
        xmlNs: 'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
        xslUrl: 'sitemap.xsl',
        gzip: false,
        cacheTime: 0,
      })
      xml = await $fetch('/custom-sitemap.xml')
      expect(xml).contain('<loc>https://example.com/</loc>')
    })

    test('static routes', () => {
      // static routes
      expect(xml).contain('<loc>https://example.com/</loc>')
      expect(xml).contain('<loc>https://example.com/sub</loc>')
      expect(xml).contain('<loc>https://example.com/sub/sub</loc>')

      // static child-routes
      expect(xml).contain('<loc>https://example.com/parent</loc>')
      expect(xml).contain('<loc>https://example.com/parent/child</loc>')
      expect(xml).contain('<loc>https://example.com/parent/child/subchild</loc>')
      expect(xml).not.contain('<loc>https://example.com/parent/</loc>')
      expect(xml).not.contain('<loc>https://example.com/parent/child/</loc>')
    })

    test('dynamic routes', () => {
      expect(xml).contain('<loc>https://example.com/child</loc>')
      expect(xml).contain('<loc>https://example.com/child/1</loc>')
      expect(xml).contain('<loc>https://example.com/1/</loc>')
      expect(xml).contain('<loc>https://example.com/test/</loc>')
    })

    test('excluded routes', () => {
      expect(xml).not.contain('<loc>https://example.com/exclude</loc>')
    })

    test('filtered routes', () => {
      expect(xml).not.contain('<loc>https://example.com/filtered</loc>')
    })

    test('default options', () => {
      expect(xml).contain(
        '<url><loc>https://example.com/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>'
      )
      expect(xml).contain(
        '<url><loc>https://example.com/child</loc><changefreq>daily</changefreq><priority>1.0</priority></url>'
      )
    })

    test('custom XML namespaces', () => {
      expect(xml).contain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    })

    test('custom XSL', () => {
      expect(xml).contain('<?xml-stylesheet type="text/xsl" href="sitemap.xsl"?>')
    })
  })

  describe('custom options', () => {
    test('etag enabled', async () => {
      await updateConfig({
        gzip: true,
      })

      // 1st call
      let response = await request('/sitemap.xml')
      let etag = response.headers.get('etag')
      expect(response.status).eq(200)
      expect(etag).toBeTruthy()
      // 2nd call
      response = await request('/sitemap.xml', {
        headers: {
          'If-None-Match': etag,
        },
      })
      expect(response.status).eq(304)

      // 1st call
      response = await requestGzip('/sitemap.xml.gz')
      etag = response.headers.get('etag')
      expect(response.status).eq(200)
      expect(etag).toBeTruthy()
      // 2nd call
      response = await requestGzip('/sitemap.xml.gz', {
        headers: {
          'If-None-Match': etag,
        },
      })
      expect(response.status).eq(304)
    })

    test('etag disabled', async () => {
      await updateConfig({
        etag: false,
        gzip: true,
      })

      let response = await request('/sitemap.xml')
      let etag = response.headers.get('etag')
      expect(response.status).eq(200)
      expect(etag).not.toBeTruthy()

      response = await requestGzip('/sitemap.xml.gz')
      etag = response.headers.get('etag')
      expect(response.status).eq(200)
      expect(etag).not.toBeTruthy()
    })

    test('gzip enabled', async () => {
      await updateConfig({
        gzip: true,
      })

      const xml = await $fetch('/sitemap.xml')
      const gz = await getGzip('/sitemap.xml.gz')
      const sitemap = gunzipSync(gz).toString()
      expect(xml).eq(sitemap)
    })

    test('trailingSlash enabled', async () => {
      await updateConfig({
        hostname: 'https://example.com',
        trailingSlash: true,
        routes: ['test'],
      })

      const xml = await $fetch('/sitemap.xml')
      expect(xml).not.contain('<loc>https://example.com/sub</loc>')
      expect(xml).not.contain('<loc>https://example.com/sub/sub</loc>')
      expect(xml).not.contain('<loc>https://example.com/test</loc>')
      expect(xml).contain('<loc>https://example.com/sub/</loc>')
      expect(xml).contain('<loc>https://example.com/sub/sub/</loc>')
      expect(xml).contain('<loc>https://example.com/test/</loc>')
    })
  })

  /**
   * i18n is not supported by nuxt 3 yet
   */

  describe('i18n options', () => {
    const modules = [i18n, sitemapModule]

    const nuxtI18nConfig = {
      locales: ['en', 'fr'],
      defaultLocale: 'en',
    }

    const sitemapConfig = {
      hostname: 'https://example.com',
      trailingSlash: true,
      i18n: true,
      routes: ['foo', { url: 'bar' }],
    }

    test('strategy "no_prefix"', async () => {
      const ctx = useTestContext()
      ctx.options.nuxtConfig = {
        ...ctx.options.nuxtConfig,
        modules,
        i18n: {
          ...nuxtI18nConfig,
          strategy: 'no_prefix',
        },
      }
      await setTestContext(ctx)
      await updateConfig(sitemapConfig)

      const xml = await $fetch('/sitemap.xml')
      expect(xml).contain('<loc>https://example.com/</loc>')
      expect(xml).not.contain('<loc>https://example.com/en/</loc>')
      expect(xml).not.contain('<loc>https://example.com/fr/</loc>')
      expect(xml).not.contain('<xhtml:link rel="alternate" hreflang="en" href="https://example.com/"/>')
      expect(xml).not.contain('<xhtml:link rel="alternate" hreflang="en" href="https://example.com/en/"/>')
      expect(xml).not.contain('<xhtml:link rel="alternate" hreflang="fr" href="https://example.com/fr/"/>')
      expect(xml).not.contain('<xhtml:link rel="alternate" hreflang="x-default" href="https://example.com/"/>')
    })

    test('strategy "prefix"', async () => {
      const ctx = useTestContext()
      ctx.options.nuxtConfig = {
        ...ctx.options.nuxtConfig,
        modules,
        i18n: {
          ...nuxtI18nConfig,
          strategy: 'prefix',
        },
      }
      await setTestContext(ctx)
      await updateConfig(sitemapConfig)

      const links = [
        '<xhtml:link rel="alternate" hreflang="en" href="https://example.com/en/"/>',
        '<xhtml:link rel="alternate" hreflang="fr" href="https://example.com/fr/"/>',
      ].join('')

      const xml = await $fetch('/sitemap.xml')
      expect(xml).not.contain('<loc>https://example.com/</loc>')
      expect(xml).contain(`<url><loc>https://example.com/en/</loc>${links}</url>`)
      expect(xml).contain(`<url><loc>https://example.com/fr/</loc>${links}</url>`)
      expect(xml).not.contain('<xhtml:link rel="alternate" hreflang="x-default" href="https://example.com/"/>')
      expect(xml).not.contain('<xhtml:link rel="alternate" hreflang="x-default" href="https://example.com/en/"/>')
      expect(xml).not.contain('<xhtml:link rel="alternate" hreflang="x-default" href="https://example.com/fr/"/>')
    })

    test('strategy "prefix_except_default"', async () => {
      const ctx = useTestContext()
      ctx.options.nuxtConfig = {
        ...ctx.options.nuxtConfig,
        modules,
        i18n: {
          ...nuxtI18nConfig,
          strategy: 'prefix_except_default',
        },
      }
      await setTestContext(ctx)
      await updateConfig(sitemapConfig)

      const links = [
        '<xhtml:link rel="alternate" hreflang="en" href="https://example.com/"/>',
        '<xhtml:link rel="alternate" hreflang="fr" href="https://example.com/fr/"/>',
      ].join('')

      const xml = await $fetch('/sitemap.xml')
      expect(xml).not.contain('<loc>https://example.com/en/</loc>')
      expect(xml).contain(`<url><loc>https://example.com/</loc>${links}</url>`)
      expect(xml).contain(`<url><loc>https://example.com/fr/</loc>${links}</url>`)
      expect(xml).not.contain('<xhtml:link rel="alternate" hreflang="x-default" href="https://example.com/"/>')
      expect(xml).not.contain('<xhtml:link rel="alternate" hreflang="x-default" href="https://example.com/en/"/>')
      expect(xml).not.contain('<xhtml:link rel="alternate" hreflang="x-default" href="https://example.com/fr/"/>')
    })

    test('strategy "prefix_and_default"', async () => {
      const ctx = useTestContext()
      ctx.options.nuxtConfig = {
        ...ctx.options.nuxtConfig,
        modules,
        i18n: {
          ...nuxtI18nConfig,
          strategy: 'prefix_and_default',
        },
      }
      await setTestContext(ctx)
      await updateConfig({
        ...sitemapConfig,
      })

      const links = [
        '<xhtml:link rel="alternate" hreflang="en" href="https://example.com/en/"/>',
        '<xhtml:link rel="alternate" hreflang="fr" href="https://example.com/fr/"/>',
        '<xhtml:link rel="alternate" hreflang="x-default" href="https://example.com/"/>',
      ].join('')

      const xml = await $fetch('/sitemap.xml')
      expect(xml).contain(`<url><loc>https://example.com/</loc>${links}</url>`)
      expect(xml).contain(`<url><loc>https://example.com/fr/</loc>${links}</url>`)
      expect(xml).contain(`<url><loc>https://example.com/en/</loc>${links}</url>`)
      expect(xml).not.contain('<xhtml:link rel="alternate" hreflang="x-default" href="https://example.com/en/"/>')
      expect(xml).not.contain('<xhtml:link rel="alternate" hreflang="x-default" href="https://example.com/fr/"/>')
    })

    test('locales with iso values', async () => {
      const locales = [
        { code: 'en', iso: 'en-US' },
        { code: 'gb', iso: 'en-GB' },
      ]
      const ctx = useTestContext()
      ctx.options.nuxtConfig = {
        ...ctx.options.nuxtConfig,
        modules,
        i18n: {
          ...nuxtI18nConfig,
          locales,
        },
      }
      await setTestContext(ctx)
      await updateConfig({
        ...sitemapConfig,
        i18n: {
          locales,
        },
      })

      const xml = await $fetch('/sitemap.xml')
      expect(xml).contain('<loc>https://example.com/</loc>')
      expect(xml).contain('<xhtml:link rel="alternate" hreflang="en-US" href="https://example.com/"/>')
      expect(xml).contain('<xhtml:link rel="alternate" hreflang="en-GB" href="https://example.com/gb/"/>')

      // remove i18n for next tests
      ctx.options.nuxtConfig = {
        ...ctx.options.nuxtConfig,
        modules: [sitemapModule],
      }
      await setTestContext(ctx)
    })
  })

  describe('external options', () => {
    test('default routes from generate.routes', async () => {
      await updateConfig({
        generate: {
          routes: ['test'],
        },
        sitemap: {
          hostname: 'https://example.com/',
        },
      })

      xml = await $fetch('/sitemap.xml')
      expect(xml).contain('<loc>https://example.com/test</loc>')
    })

    test('custom base from router.base', async () => {
      const ctx = useTestContext()
      ctx.options.nuxtConfig.app = { baseURL: '/base' }
      await setTestContext(ctx)
      await updateConfig({
        hostname: 'https://example.com/',
      })

      xml = await $fetch('/base/sitemap.xml')
      expect(xml).toMatchSnapshot()

      // revert to default
      ctx.options.nuxtConfig.app = { baseURL: '/' }
      await setTestContext(ctx)
    })
  })
})

describe('sitemap - multiple configuration', () => {
  beforeEach(async () => {
    await updateConfig([
      {
        path: 'sitemap-foo.xml',
        hostname: 'https://example.com/',
      },
      {
        path: 'sitemap-bar.xml',
        hostname: 'https://example.org/',
      },
    ])
  })

  test('sitemap-foo.xml', async () => {
    const xml = await $fetch('/sitemap-foo.xml')
    expect(xml).toMatchSnapshot()
  })

  test('sitemap-bar.xml', async () => {
    const xml = await $fetch('/sitemap-bar.xml')
    expect(xml).toMatchSnapshot()
  })
})

describe('sitemapindex - minimal configuration', () => {
  beforeEach(async () => {
    await updateConfig({
      hostname: 'https://example.com/',
      sitemaps: [
        {
          path: '/sitemap-foo.xml',
          routes: ['foo/1', 'foo/2'],
        },
        {
          path: '/sitemap-bar.xml',
          routes: ['bar/1', 'bar/2'],
        },
      ],
    })
  })

  test('sitemapindex.xml', async () => {
    const xml = await $fetch('/sitemapindex.xml')
    expect(xml).contain('<loc>https://example.com/sitemap-foo.xml</loc>')
    expect(xml).contain('<loc>https://example.com/sitemap-bar.xml</loc>')
  })

  test('sitemap-foo.xml', async () => {
    const xml = await $fetch('/sitemap-foo.xml')
    expect(xml).contain('<loc>https://example.com/foo/1</loc>')
    expect(xml).contain('<loc>https://example.com/foo/2</loc>')
  })

  test('sitemap-bar.xml', async () => {
    const xml = await $fetch('/sitemap-bar.xml')
    expect(xml).contain('<loc>https://example.com/bar/1</loc>')
    expect(xml).contain('<loc>https://example.com/bar/2</loc>')
  })
})

describe('sitemapindex - advanced configuration', () => {
  let xml = null
  const today = new Date().toISOString()
  const yesterday = new Date(new Date() - 1000 * 60 * 60 * 24).toISOString()

  beforeEach(async () => {
    await updateConfig({
      path: '/sitemapindex.xml',
      hostname: 'https://example.com/',
      lastmod: today,
      sitemaps: [
        {
          path: '/sitemap-foo.xml',
          routes: ['foo/1', 'foo/2'],
          lastmod: yesterday,
        },
        {
          hostname: 'https://example.fr/',
          path: '/sitemap-bar.xml',
          routes: ['bar/1', 'bar/2'],
        },
      ],
      gzip: true,
      xmlNs: 'xmlns="https://example.com/schemas/sitemap/0.9"',
      xslUrl: 'sitemapindex.xsl',
    })
  })

  test('cascading hostname', async () => {
    xml = await $fetch('/sitemapindex.xml')
    expect(xml).contain('<loc>https://example.com/sitemap-foo.xml</loc>')
    expect(xml).contain('<loc>https://example.fr/sitemap-bar.xml</loc>')
  })

  test('custom lastmod', () => {
    expect(xml).contain(`<lastmod>${today}</lastmod>`)
    expect(xml).contain(`<lastmod>${yesterday}</lastmod>`)
  })

  test('etag enabled', async () => {
    // 1st call
    let response = await request('/sitemapindex.xml')
    let etag = response.headers.get('etag')
    expect(response.status).eq(200)
    expect(etag).toBeTruthy()
    // 2nd call
    response = await request('/sitemapindex.xml', {
      headers: {
        'If-None-Match': etag,
      },
    })
    expect(response.status).eq(304)

    // 1st call
    response = await requestGzip('/sitemapindex.xml.gz')
    etag = response.headers.get('etag')
    expect(response.status).eq(200)
    expect(etag).toBeTruthy()
    // 2nd call
    response = await requestGzip('/sitemapindex.xml.gz', {
      headers: {
        'If-None-Match': etag,
      },
    })
    expect(response.status).eq(304)
  })

  test('gzip enabled', async () => {
    const gz = await getGzip('/sitemapindex.xml.gz')
    const sitemap = gunzipSync(gz).toString()
    expect(xml).eq(sitemap)
  })

  test('custom XML namespaces', () => {
    expect(xml).contain('<sitemapindex xmlns="https://example.com/schemas/sitemap/0.9">')
  })

  test('custom XSL', () => {
    expect(xml).contain('<?xml-stylesheet type="text/xsl" href="sitemapindex.xsl"?>')
  })
})

describe('sitemapindex - custom router base', () => {
  beforeEach(async () => {
    const ctx = useTestContext()
    ctx.options.nuxtConfig.app = { baseURL: '/base' }
    await setTestContext(ctx)
    await updateConfig({
      hostname: 'https://example.com/',
      sitemaps: [
        {
          path: '/sitemap-foo.xml',
          routes: ['foo/1', 'foo/2'],
        },
        {
          hostname: 'https://example.fr/',
          path: '/sitemap-bar.xml',
          routes: ['bar/1', 'bar/2'],
        },
      ],
    })
  })
  test('sitemapindex.xml', async () => {
    const xml = await $fetch('/base/sitemapindex.xml')
    expect(xml).contain('<loc>https://example.com/base/sitemap-foo.xml</loc>')
    expect(xml).contain('<loc>https://example.fr/base/sitemap-bar.xml</loc>')
  })

  test('sitemap-foo.xml', async () => {
    const xml = await $fetch('/base/sitemap-foo.xml')
    expect(xml).contain('<loc>https://example.com/base/foo/1</loc>')
    expect(xml).contain('<loc>https://example.com/base/foo/2</loc>')
  })

  test('sitemap-bar.xml', async () => {
    const xml = await $fetch('/base/sitemap-bar.xml')
    expect(xml).contain('<loc>https://example.fr/base/bar/1</loc>')
    expect(xml).contain('<loc>https://example.fr/base/bar/2</loc>')
  })
})

describe('sitemap - generate mode', () => {
  beforeEach(async () => {
    const ctx = await useTestContext()
    ctx.options.nuxtConfig = {
      _generate: true,
    }
  })

  test('sitemap.xml', async () => {
    await updateConfig({
      hostname: 'https://example.com/',
      exclude: ['/exclude'],
    })

    const xml = readFileSync(resolve(__dirname, './fixture/.output/public/sitemap.xml'), 'utf8')
    expect(xml).toMatchSnapshot()
  })

  test('sitemap.xml.gz', async () => {
    await updateConfig({
      hostname: 'https://example.com/',
      gzip: true,
    })

    const xml = readFileSync(resolve(__dirname, './fixture/.output/public/sitemap.xml'), 'utf8')
    const gz = readFileSync(resolve(__dirname, './fixture/.output/public/sitemap.xml.gz'))
    const sitemap = gunzipSync(gz).toString()
    expect(xml).eq(sitemap)
  })
})

describe('sitemapindex - generate mode', () => {
  beforeEach(async () => {
    const ctx = await useTestContext()
    ctx.options.nuxtConfig.app = { baseURL: '/' }
    ctx.options.nuxtConfig = {
      _generate: true,
    }
    await setTestContext(ctx)
    await updateConfig({
      hostname: 'https://example.com/',
      sitemaps: [
        {
          path: '/sitemap-foo.xml',
          routes: ['foo/1', 'foo/2'],
        },
        {
          hostname: 'https://example.fr/',
          path: '/sitemap-bar.xml',
          routes: ['bar/1', 'bar/2'],
        },
      ],
      gzip: true,
    })
  })

  test('sitemapindex.xml', () => {
    const xml = readFileSync(resolve(__dirname, './fixture/.output/public/sitemapindex.xml'), 'utf8')
    expect(xml).toMatchSnapshot()
  })

  test('sitemapindex.xml.gz', () => {
    const xml = readFileSync(resolve(__dirname, './fixture/.output/public/sitemapindex.xml'), 'utf8')
    const gz = readFileSync(resolve(__dirname, './fixture/.output/public/sitemapindex.xml.gz'))
    const sitemapindex = gunzipSync(gz).toString()
    expect(xml).eq(sitemapindex)
  })

  test('sitemap-foo.xml', () => {
    const xml = readFileSync(resolve(__dirname, './fixture/.output/public/sitemap-foo.xml'), 'utf8')
    expect(xml).toMatchSnapshot()
  })

  test('sitemap-bar.xml', () => {
    const xml = readFileSync(resolve(__dirname, './fixture/.output/public/sitemap-bar.xml'), 'utf8')
    expect(xml).toMatchSnapshot()
  })
})
