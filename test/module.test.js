const { readFileSync } = require('fs')
const { resolve } = require('path')
const { gunzipSync } = require('zlib')

const { Nuxt, Builder, Generator } = require('nuxt')
const request = require('request-promise-native')

const config = require('./fixture/nuxt.config')
config.dev = false
config.sitemap = {}

const url = path => `http://localhost:3000${path}`
const get = path => request(url(path))
const getGzip = path => request({ url: url(path), encoding: null })

const startServer = async config => {
  const nuxt = new Nuxt(config)
  await nuxt.ready()
  await new Builder(nuxt).build()
  await nuxt.listen(3000)
  return nuxt
}
const runGenerate = async config => {
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

describe('sitemap - minimal configuration', () => {
  test('sitemap.xml', async () => {
    const nuxt = await startServer({
      ...config,
      generate: {
        routes: null
      },
      sitemap: {
        hostname: 'https://example.com/'
      }
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
          filter: ({ routes }) => routes.filter(route => route.url !== '/filtered'),
          defaults: {
            changefreq: 'daily',
            priority: 1
          },
          xmlNs: 'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
          xslUrl: 'sitemap.xsl',
          gzip: false,
          cacheTime: 0
        }
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
    test('gzip enabled', async () => {
      nuxt = await startServer({
        ...config,
        sitemap: {
          gzip: true
        }
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
          routes: ['test']
        }
      })

      const xml = await get('/sitemap.xml')

      // trailing slash
      expect(xml).not.toContain('<loc>https://example.com/sub</loc>')
      expect(xml).not.toContain('<loc>https://example.com/sub/sub</loc>')
      expect(xml).not.toContain('<loc>https://example.com/test</loc>')
      expect(xml).toContain('<loc>https://example.com/sub/</loc>')
      expect(xml).toContain('<loc>https://example.com/sub/sub/</loc>')
      expect(xml).toContain('<loc>https://example.com/test/</loc>')
    })
  })

  describe('external options', () => {
    test('default hostname from build.publicPath', async () => {
      nuxt = await startServer({
        ...config,
        build: {
          publicPath: 'https://example.com'
        }
      })

      xml = await get('/sitemap.xml')
      expect(xml).toContain('<loc>https://example.com/</loc>')
    })

    test('default routes from generate.routes', async () => {
      nuxt = await startServer({
        ...config,
        generate: {
          routes: ['test']
        },
        sitemap: {
          hostname: 'https://example.com/'
        }
      })

      xml = await get('/sitemap.xml')
      expect(xml).toContain('<loc>https://example.com/test</loc>')
    })

    test('custom base from router.base', async () => {
      nuxt = await startServer({
        ...config,
        router: {
          base: '/base'
        },
        sitemap: {
          hostname: 'https://example.com/'
        }
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
          hostname: 'https://example.com/'
        },
        {
          path: 'sitemap-bar.xml',
          hostname: 'https://example.org/'
        }
      ]
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
            routes: ['foo/1', 'foo/2']
          },
          {
            path: '/sitemap-bar.xml',
            routes: ['bar/1', 'bar/2']
          }
        ]
      }
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
  const lastmod = new Date().toISOString()

  beforeAll(async () => {
    nuxt = await startServer({
      ...config,
      sitemap: {
        path: '/sitemapindex.xml',
        hostname: 'https://example.com/',
        sitemaps: [
          {
            path: '/sitemap-foo.xml',
            routes: ['foo/1', 'foo/2']
          },
          {
            hostname: 'https://example.fr/',
            path: '/sitemap-bar.xml',
            routes: ['bar/1', 'bar/2']
          }
        ],
        gzip: true,
        lastmod,
        xmlNs: 'xmlns="https://example.com/schemas/sitemap/0.9"',
        xslUrl: 'sitemapindex.xsl'
      }
    })

    xml = await get('/sitemapindex.xml')
  })

  test('cascading hostname', () => {
    expect(xml).toContain('<loc>https://example.com/sitemap-foo.xml</loc>')
    expect(xml).toContain('<loc>https://example.fr/sitemap-bar.xml</loc>')
  })

  test('gzip enabled', async () => {
    const gz = await getGzip('/sitemapindex.xml.gz')
    const sitemap = gunzipSync(gz).toString()
    expect(xml).toEqual(sitemap)
  })

  test('custom lastmod', () => {
    expect(xml).toContain(`<lastmod>${lastmod}</lastmod>`)
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
        base: '/base'
      },
      sitemap: {
        hostname: 'https://example.com/',
        sitemaps: [
          {
            path: '/sitemap-foo.xml',
            routes: ['foo/1', 'foo/2']
          },
          {
            hostname: 'https://example.fr/',
            path: '/sitemap-bar.xml',
            routes: ['bar/1', 'bar/2']
          }
        ]
      }
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
        exclude: ['/exclude']
      }
    })

    const xml = readFileSync(resolve(__dirname, '../dist/sitemap.xml'), 'utf8')
    expect(xml).toMatchSnapshot()
  })

  test('sitemap.xml.gz', async () => {
    await runGenerate({
      ...config,
      sitemap: {
        hostname: 'https://example.com/',
        gzip: true
      }
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
            routes: ['foo/1', 'foo/2']
          },
          {
            hostname: 'https://example.fr/',
            path: '/sitemap-bar.xml',
            routes: ['bar/1', 'bar/2']
          }
        ],
        gzip: true
      }
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
