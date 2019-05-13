jest.setTimeout(60000)

const { resolve } = require('path')
const { readFileSync } = require('fs')
const { gunzipSync } = require('zlib')
const { Nuxt, Builder, Generator } = require('nuxt-edge')
const request = require('request-promise-native')
const getPort = require('get-port')
const logger = require('@/logger')

const config = require('./fixture/nuxt.config')
config.dev = false

let nuxt, port

logger.mockTypes(() => jest.fn())

const url = path => `http://localhost:${port}${path}`
const get = path => request(url(path))
const getGzip = path => request({ url: url(path), encoding: null })
const hostname = 'http://localhost:3000/'

const setupNuxt = async (config) => {
  const nuxt = new Nuxt(config)
  await nuxt.ready()
  await new Builder(nuxt).build()
  port = await getPort()
  await nuxt.listen(port)

  return nuxt
}

describe('module', () => {
  beforeAll(async () => {
    nuxt = await setupNuxt(config)
  })

  afterAll(async () => {
    if (nuxt) {
      await nuxt.close()
    }
  })

  test('render', async () => {
    // static routes
    expect(await get('/')).toContain('/index')
    expect(await get('/sub')).toContain('/sub/index')
    expect(await get('/sub/sub')).toContain('/sub/sub')

    // static child-routes
    expect(await get('/parent')).toContain('/parent')
    expect(await get('/parent/child')).toContain('/parent/child')
    expect(await get('/parent/child/subchild')).toContain('/parent/child/subchild')

    // dynamic routes
    expect(await get('/child')).toContain('/child/index')
    expect(await get('/child/1')).toContain('/child/1')
    expect(await get('/child/2')).toContain('/child/2')

    // excluded routes
    expect(await get('/exclude')).toContain('/exclude')

    // filtered routes
    expect(await get('/filtered')).toContain('/filtered')
  })

  test('sitemap', async () => {
    const xml = await get('/sitemap.xml')

    // static routes
    expect(xml).toContain(`<loc>${hostname}</loc>`)
    expect(xml).toContain(`<loc>${hostname}sub</loc>`)
    expect(xml).toContain(`<loc>${hostname}sub/sub</loc>`)

    // static child-routes
    expect(xml).toContain(`<loc>${hostname}parent</loc>`)
    expect(xml).toContain(`<loc>${hostname}parent/child</loc>`)
    expect(xml).toContain(`<loc>${hostname}parent/child/subchild</loc>`)
    expect(xml).not.toContain(`<loc>${hostname}parent/</loc>`)
    expect(xml).not.toContain(`<loc>${hostname}parent/child/</loc>`)

    // dynamic routes
    expect(xml).toContain(`<loc>${hostname}child</loc>`)
    expect(xml).toContain(`<loc>${hostname}child/1</loc>`)
    expect(xml).toContain(`<loc>${hostname}child/2</loc>`)

    // excluded routes
    expect(xml).not.toContain(`<loc>${hostname}exclude</loc>`)

    // filtered routes
    expect(xml).not.toContain(`<loc>${hostname}filtered</loc>`)

    // custom XML namespaces
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')

    // custom XSL
    expect(xml).toContain('<?xml-stylesheet type="text/xsl" href="sitemap.xsl"?>')

    // default options
    expect(xml).toContain(`<url><loc>${hostname}</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`)
  })

  test('sitemap gzip', async () => {
    const xml = await get('/sitemap.xml')
    const gz = await getGzip('/sitemap.xml.gz')
    const sitemap = gunzipSync(gz).toString()
    expect(xml).toEqual(sitemap)
  })
})

describe('custom options', () => {
  beforeAll(async () => {
    nuxt = await setupNuxt({
      ...config,
      sitemap: {
        path: 'my-sitemap.xml',
        generate: true,
        hostname
      }
    })
  })

  afterAll(async () => {
    if (nuxt) {
      await nuxt.close()
    }
  })

  test('includes all static routes', async () => {
    const xml = await get('/my-sitemap.xml')

    // static routes
    expect(xml).toContain(`<loc>${hostname}</loc>`)
    expect(xml).toContain(`<loc>${hostname}sub</loc>`)
    expect(xml).toContain(`<loc>${hostname}sub/sub</loc>`)

    // static child-routes
    expect(xml).toContain(`<loc>${hostname}parent</loc>`)
    expect(xml).toContain(`<loc>${hostname}parent/child</loc>`)
    expect(xml).toContain(`<loc>${hostname}parent/child/subchild</loc>`)
    expect(xml).not.toContain(`<loc>${hostname}parent/</loc>`)
    expect(xml).not.toContain(`<loc>${hostname}parent/child/</loc>`)

    // dynamic routes
    expect(xml).toContain(`<loc>${hostname}child</loc>`)
    expect(xml).not.toContain(`<loc>${hostname}child/1</loc>`)
    expect(xml).not.toContain(`<loc>${hostname}child/2</loc>`)

    // excluded routes
    expect(xml).toContain(`<loc>${hostname}exclude</loc>`)

    // filtered routes
    expect(xml).toContain(`<loc>${hostname}filtered</loc>`)
  })

  test('custom sitemap path', async () => {
    await expect(get('/sitemap.xml')).rejects.toMatchObject({
      statusCode: 404
    })
  })

  test('option generate', () => {
    expect(logger.warn).toHaveBeenCalledWith('The option `sitemap.generate` isn\'t needed anymore')
  })
})

describe('generate', () => {
  beforeAll(async () => {
    nuxt = new Nuxt(config)
    await nuxt.ready()
    const builder = new Builder(nuxt)
    const generator = new Generator(nuxt, builder)
    await generator.generate()
  })

  afterAll(async () => {
    if (nuxt) {
      await nuxt.close()
    }
  })

  test('sitemap', () => {
    const xml = readFileSync(resolve(__dirname, '../dist/sitemap.xml'), 'utf8')

    // static routes
    expect(xml).toContain(`<loc>${hostname}</loc>`)
    expect(xml).toContain(`<loc>${hostname}sub</loc>`)
    expect(xml).toContain(`<loc>${hostname}sub/sub</loc>`)

    // static child-routes
    expect(xml).toContain(`<loc>${hostname}parent</loc>`)
    expect(xml).toContain(`<loc>${hostname}parent/child</loc>`)
    expect(xml).toContain(`<loc>${hostname}parent/child/subchild</loc>`)
    expect(xml).not.toContain(`<loc>${hostname}parent/</loc>`)
    expect(xml).not.toContain(`<loc>${hostname}parent/child/</loc>`)

    // dynamic routes
    expect(xml).toContain(`<loc>${hostname}child</loc>`)
    expect(xml).toContain(`<loc>${hostname}child/1</loc>`)
    expect(xml).toContain(`<loc>${hostname}child/2</loc>`)

    // excluded routes
    expect(xml).not.toContain(`<loc>${hostname}exclude</loc>`)

    // filtered routes
    expect(xml).not.toContain(`<loc>${hostname}filtered</loc>`)
  })

  test('sitemap gzip', () => {
    const xml = readFileSync(resolve(__dirname, '../dist/sitemap.xml'), 'utf8')
    const gz = readFileSync(resolve(__dirname, '../dist/sitemap.xml.gz'))
    const sitemap = gunzipSync(gz).toString()
    expect(xml).toEqual(sitemap)
  })
})
