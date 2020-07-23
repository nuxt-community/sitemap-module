const { readFileSync } = require('fs')
const { resolve } = require('path')
const { gunzipSync } = require('zlib')

const fetch = require('node-fetch')
const { Nuxt, Builder, Generator } = require('nuxt')

const config = require('./fixture/nuxt.config')
config.dev = false
config.modules = [require('..')]
config.sitemap = {}

const PORT = 3000
const url = (path) => `http://localhost:${PORT}${path}`
const request = (path, options = {}) => fetch(url(path), options)
const requestGzip = (path, options = {}) => request(path, { compress: true, ...options })
const get = (path) => request(path).then((res) => res.text())
const getGzip = (path) => request(path, { compress: true }).then((res) => res.buffer())

const startServer = async (config) => {
  const nuxt = new Nuxt(config)
  await nuxt.ready()
  await new Builder(nuxt).build()
  await nuxt.listen(PORT)
  return nuxt
}
const runGenerate = async (config) => {
  const nuxt = new Nuxt(config)
  await nuxt.ready()
  const builder = new Builder(nuxt)
  const generator = new Generator(nuxt, builder)
  await generator.generate()
}

jest.setTimeout(60000)

describe('ssr - pages', () => {
  test('should render all pages', async () => {
    const nuxt = await startServer(config)

    // static routes
    let html = await get('/')
    expect(html).toContain('/index')
    html = await get('/sub/')
    expect(html).toContain('/sub/index')
    html = await get('/sub/sub')
    expect(html).toContain('/sub/sub')

    // static child-routes
    html = await get('/parent')
    expect(html).toContain('/parent')
    html = await get('/parent/child')
    expect(html).toContain('/parent/child')
    html = await get('/parent/child/subchild')
    expect(html).toContain('/parent/child/subchild')

    // dynamic routes
    html = await get('/child/')
    expect(html).toContain('/child/index')
    html = await get('/child/1')
    expect(html).toContain('/child/1')
    html = await get('/1/')
    expect(html).toContain('/1/index')

    // excluded routes
    html = await get('/exclude')
    expect(html).toContain('/exclude')

    // filtered routes
    html = await get('/filtered')
    expect(html).toContain('/filtered')

    await nuxt.close()
  })
})

describe('sitemap - init options', () => {
  let nuxt = null
  let xml = null

  afterEach(async () => {
    await nuxt.close()
  })

  test('as object', async () => {
    nuxt = await startServer({
      ...config,
      sitemap: {
        hostname: 'https://example.com/',
      },
    })

    xml = await get('/sitemap.xml')
    expect(xml).toContain('<loc>https://example.com/</loc>')
  })

  test('as array', async () => {
    nuxt = await startServer({
      ...config,
      sitemap: [
        {
          hostname: 'https://example.com/',
        },
      ],
    })

    xml = await get('/sitemap.xml')
    expect(xml).toContain('<loc>https://example.com/</loc>')
  })

  test('as function', async () => {
    nuxt = await startServer({
      ...config,
      sitemap: () => ({
        hostname: 'https://example.com/',
      }),
    })

    xml = await get('/sitemap.xml')
    expect(xml).toContain('<loc>https://example.com/</loc>')
  })

  test('as boolean', async () => {
    nuxt = await startServer({
      ...config,
      sitemap: false,
    })

    xml = await get('/sitemap.xml')
    expect(xml).toContain('<!doctype html>')
    expect(xml).not.toContain('<loc>https://example.com/</loc>')
  })

  test('as boolean from function', async () => {
    nuxt = await startServer({
      ...config,
      sitemap: () => false,
    })

    xml = await get('/sitemap.xml')
    expect(xml).toContain('<!doctype html>')
    expect(xml).not.toContain('<loc>https://example.com/</loc>')
  })
})

describe('sitemap - minimal configuration', () => {
  test('sitemap.xml', async () => {
    const nuxt = await startServer({
      ...config,
      generate: {
        routes: null,
      },
      sitemap: {
        hostname: 'https://example.com/',
      },
    })

    const xml = await get('/sitemap.xml')
    expect(xml).toMatchSnapshot()

    await nuxt.close()
  })
})

describe('sitemap - advanced configuration', () => {
  let nuxt = null
  let xml = null

  afterEach(async () => {
    await nuxt.close()
  })

  describe('custom options', () => {
    beforeAll(async () => {
      nuxt = await startServer({
        ...config,
        sitemap: {
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
        },
      })
    })

    test('custom path', async () => {
      xml = await get('/custom-sitemap.xml')
      expect(xml).toContain('<loc>https://example.com/</loc>')
    })

    test('static routes', () => {
      // static routes
      expect(xml).toContain('<loc>https://example.com/</loc>')
      expect(xml).toContain('<loc>https://example.com/sub</loc>')
      expect(xml).toContain('<loc>https://example.com/sub/sub</loc>')

      // static child-routes
      expect(xml).toContain('<loc>https://example.com/parent</loc>')
      expect(xml).toContain('<loc>https://example.com/parent/child</loc>')
      expect(xml).toContain('<loc>https://example.com/parent/child/subchild</loc>')
      expect(xml).not.toContain('<loc>https://example.com/parent/</loc>')
      expect(xml).not.toContain('<loc>https://example.com/parent/child/</loc>')
    })

    test('dynamic routes', () => {
      expect(xml).toContain('<loc>https://example.com/child</loc>')
      expect(xml).toContain('<loc>https://example.com/child/1</loc>')
      expect(xml).toContain('<loc>https://example.com/1/</loc>')
      expect(xml).toContain('<loc>https://example.com/test/</loc>')
    })

    test('excluded routes', () => {
      expect(xml).not.toContain('<loc>https://example.com/exclude</loc>')
    })

    test('filtered routes', () => {
      expect(xml).not.toContain('<loc>https://example.com/filtered</loc>')
    })

    test('default options', () => {
      expect(xml).toContain(
        '<url><loc>https://example.com/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>'
      )
      expect(xml).toContain(
        '<url><loc>https://example.com/child</loc><changefreq>daily</changefreq><priority>1.0</priority></url>'
      )
    })

    test('custom XML namespaces', () => {
      expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    })

    test('custom XSL', () => {
      expect(xml).toContain('<?xml-stylesheet type="text/xsl" href="sitemap.xsl"?>')
    })
  })

  describe('custom options', () => {
    test('etag enabled', async () => {
      nuxt = await startServer({
        ...config,
        sitemap: {
          gzip: true,
        },
      })

      // 1st call
      let response = await request('/sitemap.xml')
      let etag = response.headers.get('etag')
      expect(response.status).toEqual(200)
      expect(etag).toBeTruthy()
      // 2nd call
      response = await request('/sitemap.xml', {
        headers: {
          'If-None-Match': etag,
        },
      })
      expect(response.status).toEqual(304)

      // 1st call
      response = await requestGzip('/sitemap.xml.gz')
      etag = response.headers.get('etag')
      expect(response.status).toEqual(200)
      expect(etag).toBeTruthy()
      // 2nd call
      response = await requestGzip('/sitemap.xml.gz', {
        headers: {
          'If-None-Match': etag,
        },
      })
      expect(response.status).toEqual(304)
    })

    test('etag disabled', async () => {
      nuxt = await startServer({
        ...config,
        sitemap: {
          etag: false,
          gzip: true,
        },
      })

      let response = await request('/sitemap.xml')
      let etag = response.headers.get('etag')
      expect(response.status).toEqual(200)
      expect(etag).not.toBeTruthy()

      response = await requestGzip('/sitemap.xml.gz')
      etag = response.headers.get('etag')
      expect(response.status).toEqual(200)
      expect(etag).not.toBeTruthy()
    })

    test('gzip enabled', async () => {
      nuxt = await startServer({
        ...config,
        sitemap: {
          gzip: true,
        },
      })

      const xml = await get('/sitemap.xml')
      const gz = await getGzip('/sitemap.xml.gz')
      const sitemap = gunzipSync(gz).toString()
      expect(xml).toEqual(sitemap)
    })

    test('trailingSlash enabled', async () => {
      nuxt = await startServer({
        ...config,
        sitemap: {
          hostname: 'https://example.com',
          trailingSlash: true,
          routes: ['test'],
        },
      })

      const xml = await get('/sitemap.xml')
      expect(xml).not.toContain('<loc>https://example.com/sub</loc>')
      expect(xml).not.toContain('<loc>https://example.com/sub/sub</loc>')
      expect(xml).not.toContain('<loc>https://example.com/test</loc>')
      expect(xml).toContain('<loc>https://example.com/sub/</loc>')
      expect(xml).toContain('<loc>https://example.com/sub/sub/</loc>')
      expect(xml).toContain('<loc>https://example.com/test/</loc>')
    })
  })

  describe('i18n options', () => {
    const modules = [require('nuxt-i18n'), require('..')]

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
      nuxt = await startServer({
        ...config,
        modules,
        i18n: {
          ...nuxtI18nConfig,
          strategy: 'no_prefix',
        },
        sitemap: sitemapConfig,
      })

      const xml = await get('/sitemap.xml')
      expect(xml).toContain('<loc>https://example.com/</loc>')
      expect(xml).not.toContain('<loc>https://example.com/en/</loc>')
      expect(xml).not.toContain('<loc>https://example.com/fr/</loc>')
      expect(xml).not.toContain('<xhtml:link rel="alternate" hreflang="en" href="https://example.com/"/>')
      expect(xml).not.toContain('<xhtml:link rel="alternate" hreflang="en" href="https://example.com/en/"/>')
      expect(xml).not.toContain('<xhtml:link rel="alternate" hreflang="fr" href="https://example.com/fr/"/>')
      expect(xml).not.toContain('<xhtml:link rel="alternate" hreflang="x-default" href="https://example.com/"/>')
    })

    test('strategy "prefix"', async () => {
      nuxt = await startServer({
        ...config,
        modules,
        i18n: {
          ...nuxtI18nConfig,
          strategy: 'prefix',
        },
        sitemap: sitemapConfig,
      })

      const links = [
        '<xhtml:link rel="alternate" hreflang="en" href="https://example.com/en/"/>',
        '<xhtml:link rel="alternate" hreflang="fr" href="https://example.com/fr/"/>',
      ].join('')

      const xml = await get('/sitemap.xml')
      expect(xml).not.toContain('<loc>https://example.com/</loc>')
      expect(xml).toContain(`<url><loc>https://example.com/en/</loc>${links}</url>`)
      expect(xml).toContain(`<url><loc>https://example.com/fr/</loc>${links}</url>`)
      expect(xml).not.toContain('<xhtml:link rel="alternate" hreflang="x-default" href="https://example.com/"/>')
      expect(xml).not.toContain('<xhtml:link rel="alternate" hreflang="x-default" href="https://example.com/en/"/>')
      expect(xml).not.toContain('<xhtml:link rel="alternate" hreflang="x-default" href="https://example.com/fr/"/>')
    })

    test('strategy "prefix_except_default"', async () => {
      nuxt = await startServer({
        ...config,
        modules,
        i18n: {
          ...nuxtI18nConfig,
          strategy: 'prefix_except_default',
        },
        sitemap: sitemapConfig,
      })

      const links = [
        '<xhtml:link rel="alternate" hreflang="en" href="https://example.com/"/>',
        '<xhtml:link rel="alternate" hreflang="fr" href="https://example.com/fr/"/>',
      ].join('')

      const xml = await get('/sitemap.xml')
      expect(xml).not.toContain('<loc>https://example.com/en/</loc>')
      expect(xml).toContain(`<url><loc>https://example.com/</loc>${links}</url>`)
      expect(xml).toContain(`<url><loc>https://example.com/fr/</loc>${links}</url>`)
      expect(xml).not.toContain('<xhtml:link rel="alternate" hreflang="x-default" href="https://example.com/"/>')
      expect(xml).not.toContain('<xhtml:link rel="alternate" hreflang="x-default" href="https://example.com/en/"/>')
      expect(xml).not.toContain('<xhtml:link rel="alternate" hreflang="x-default" href="https://example.com/fr/"/>')
    })

    test('strategy "prefix_and_default"', async () => {
      nuxt = await startServer({
        ...config,
        modules,
        i18n: {
          ...nuxtI18nConfig,
          strategy: 'prefix_and_default',
        },
        sitemap: {
          ...sitemapConfig,
        },
      })

      const links = [
        '<xhtml:link rel="alternate" hreflang="en" href="https://example.com/en/"/>',
        '<xhtml:link rel="alternate" hreflang="fr" href="https://example.com/fr/"/>',
        '<xhtml:link rel="alternate" hreflang="x-default" href="https://example.com/"/>',
      ].join('')

      const xml = await get('/sitemap.xml')
      expect(xml).toContain(`<url><loc>https://example.com/</loc>${links}</url>`)
      expect(xml).toContain(`<url><loc>https://example.com/fr/</loc>${links}</url>`)
      expect(xml).toContain(`<url><loc>https://example.com/en/</loc>${links}</url>`)
      expect(xml).not.toContain('<xhtml:link rel="alternate" hreflang="x-default" href="https://example.com/en/"/>')
      expect(xml).not.toContain('<xhtml:link rel="alternate" hreflang="x-default" href="https://example.com/fr/"/>')
    })

    test('locales with iso values', async () => {
      const locales = [
        { code: 'en', iso: 'en-US' },
        { code: 'gb', iso: 'en-GB' },
      ]
      nuxt = await startServer({
        ...config,
        modules,
        i18n: {
          ...nuxtI18nConfig,
          locales,
        },
        sitemap: {
          ...sitemapConfig,
          i18n: {
            locales,
          },
        },
      })

      const xml = await get('/sitemap.xml')
      expect(xml).toContain('<loc>https://example.com/</loc>')
      expect(xml).toContain('<xhtml:link rel="alternate" hreflang="en-US" href="https://example.com/"/>')
      expect(xml).toContain('<xhtml:link rel="alternate" hreflang="en-GB" href="https://example.com/gb/"/>')
    })
  })

  describe('external options', () => {
    test('default hostname from build.publicPath', async () => {
      nuxt = await startServer({
        ...config,
        build: {
          publicPath: 'https://example.com',
        },
      })

      xml = await get('/sitemap.xml')
      expect(xml).toContain('<loc>https://example.com/</loc>')
    })

    test('default routes from generate.routes', async () => {
      nuxt = await startServer({
        ...config,
        generate: {
          routes: ['test'],
        },
        sitemap: {
          hostname: 'https://example.com/',
        },
      })

      xml = await get('/sitemap.xml')
      expect(xml).toContain('<loc>https://example.com/test</loc>')
    })

    test('custom base from router.base', async () => {
      nuxt = await startServer({
        ...config,
        router: {
          base: '/base',
        },
        sitemap: {
          hostname: 'https://example.com/',
        },
      })

      xml = await get('/base/sitemap.xml')
      expect(xml).toMatchSnapshot()
    })
  })
})

describe('sitemap - multiple configuration', () => {
  let nuxt = null

  beforeAll(async () => {
    nuxt = await startServer({
      ...config,
      sitemap: [
        {
          path: 'sitemap-foo.xml',
          hostname: 'https://example.com/',
        },
        {
          path: 'sitemap-bar.xml',
          hostname: 'https://example.org/',
        },
      ],
    })
  })

  test('sitemap-foo.xml', async () => {
    const xml = await get('/sitemap-foo.xml')
    expect(xml).toMatchSnapshot()
  })

  test('sitemap-bar.xml', async () => {
    const xml = await get('/sitemap-bar.xml')
    expect(xml).toMatchSnapshot()
  })

  afterAll(async () => {
    await nuxt.close()
  })
})

describe('sitemapindex - minimal configuration', () => {
  let nuxt = null

  beforeAll(async () => {
    nuxt = await startServer({
      ...config,
      sitemap: {
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
      },
    })
  })

  test('sitemapindex.xml', async () => {
    const xml = await get('/sitemapindex.xml')
    expect(xml).toContain('<loc>https://example.com/sitemap-foo.xml</loc>')
    expect(xml).toContain('<loc>https://example.com/sitemap-bar.xml</loc>')
  })

  test('sitemap-foo.xml', async () => {
    const xml = await get('/sitemap-foo.xml')
    expect(xml).toContain('<loc>https://example.com/foo/1</loc>')
    expect(xml).toContain('<loc>https://example.com/foo/2</loc>')
  })

  test('sitemap-bar.xml', async () => {
    const xml = await get('/sitemap-bar.xml')
    expect(xml).toContain('<loc>https://example.com/bar/1</loc>')
    expect(xml).toContain('<loc>https://example.com/bar/2</loc>')
  })

  afterAll(async () => {
    await nuxt.close()
  })
})

describe('sitemapindex - advanced configuration', () => {
  let nuxt = null
  let xml = null
  const today = new Date().toISOString()
  const yesterday = new Date(new Date() - 1000 * 60 * 60 * 24).toISOString()

  beforeAll(async () => {
    nuxt = await startServer({
      ...config,
      sitemap: {
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
      },
    })

    xml = await get('/sitemapindex.xml')
  })

  test('cascading hostname', () => {
    expect(xml).toContain('<loc>https://example.com/sitemap-foo.xml</loc>')
    expect(xml).toContain('<loc>https://example.fr/sitemap-bar.xml</loc>')
  })

  test('custom lastmod', () => {
    expect(xml).toContain(`<lastmod>${today}</lastmod>`)
    expect(xml).toContain(`<lastmod>${yesterday}</lastmod>`)
  })

  test('etag enabled', async () => {
    // 1st call
    let response = await request('/sitemapindex.xml')
    let etag = response.headers.get('etag')
    expect(response.status).toEqual(200)
    expect(etag).toBeTruthy()
    // 2nd call
    response = await request('/sitemapindex.xml', {
      headers: {
        'If-None-Match': etag,
      },
    })
    expect(response.status).toEqual(304)

    // 1st call
    response = await requestGzip('/sitemapindex.xml.gz')
    etag = response.headers.get('etag')
    expect(response.status).toEqual(200)
    expect(etag).toBeTruthy()
    // 2nd call
    response = await requestGzip('/sitemapindex.xml.gz', {
      headers: {
        'If-None-Match': etag,
      },
    })
    expect(response.status).toEqual(304)
  })

  test('gzip enabled', async () => {
    const gz = await getGzip('/sitemapindex.xml.gz')
    const sitemap = gunzipSync(gz).toString()
    expect(xml).toEqual(sitemap)
  })

  test('custom XML namespaces', () => {
    expect(xml).toContain('<sitemapindex xmlns="https://example.com/schemas/sitemap/0.9">')
  })

  test('custom XSL', () => {
    expect(xml).toContain('<?xml-stylesheet type="text/xsl" href="sitemapindex.xsl"?>')
  })

  afterAll(async () => {
    await nuxt.close()
  })
})

describe('sitemapindex - custom router base', () => {
  let nuxt = null

  beforeAll(async () => {
    nuxt = await startServer({
      ...config,
      router: {
        base: '/base',
      },
      sitemap: {
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
      },
    })
  })

  test('sitemapindex.xml', async () => {
    const xml = await get('/base/sitemapindex.xml')
    expect(xml).toContain('<loc>https://example.com/base/sitemap-foo.xml</loc>')
    expect(xml).toContain('<loc>https://example.fr/base/sitemap-bar.xml</loc>')
  })

  test('sitemap-foo.xml', async () => {
    const xml = await get('/base/sitemap-foo.xml')
    expect(xml).toContain('<loc>https://example.com/base/foo/1</loc>')
    expect(xml).toContain('<loc>https://example.com/base/foo/2</loc>')
  })

  test('sitemap-bar.xml', async () => {
    const xml = await get('/base/sitemap-bar.xml')
    expect(xml).toContain('<loc>https://example.fr/base/bar/1</loc>')
    expect(xml).toContain('<loc>https://example.fr/base/bar/2</loc>')
  })

  afterAll(async () => {
    await nuxt.close()
  })
})

// TODO: describe('sitemapindex - multiple configuration', () => { ... })

describe('sitemap - generate mode', () => {
  test('sitemap.xml', async () => {
    await runGenerate({
      ...config,
      sitemap: {
        hostname: 'https://example.com/',
        exclude: ['/exclude'],
      },
    })

    const xml = readFileSync(resolve(__dirname, '../dist/sitemap.xml'), 'utf8')
    expect(xml).toMatchSnapshot()
  })

  test('sitemap.xml.gz', async () => {
    await runGenerate({
      ...config,
      sitemap: {
        hostname: 'https://example.com/',
        gzip: true,
      },
    })

    const xml = readFileSync(resolve(__dirname, '../dist/sitemap.xml'), 'utf8')
    const gz = readFileSync(resolve(__dirname, '../dist/sitemap.xml.gz'))
    const sitemap = gunzipSync(gz).toString()
    expect(xml).toEqual(sitemap)
  })
})

describe('sitemapindex - generate mode', () => {
  beforeAll(async () => {
    await runGenerate({
      ...config,
      sitemap: {
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
      },
    })
  })

  test('sitemapindex.xml', () => {
    const xml = readFileSync(resolve(__dirname, '../dist/sitemapindex.xml'), 'utf8')
    expect(xml).toMatchSnapshot()
  })

  test('sitemapindex.xml.gz', () => {
    const xml = readFileSync(resolve(__dirname, '../dist/sitemapindex.xml'), 'utf8')
    const gz = readFileSync(resolve(__dirname, '../dist/sitemapindex.xml.gz'))
    const sitemapindex = gunzipSync(gz).toString()
    expect(xml).toEqual(sitemapindex)
  })

  test('sitemap-foo.xml', () => {
    const xml = readFileSync(resolve(__dirname, '../dist/sitemap-foo.xml'), 'utf8')
    expect(xml).toMatchSnapshot()
  })

  test('sitemap-bar.xml', () => {
    const xml = readFileSync(resolve(__dirname, '../dist/sitemap-bar.xml'), 'utf8')
    expect(xml).toMatchSnapshot()
  })
})
