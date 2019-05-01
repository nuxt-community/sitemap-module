const { readFileSync } = require('fs')
const { Nuxt, Builder, Generator } = require('nuxt')
const path = require('path')
const request = require('request-promise-native')
const { gunzipSync } = require('zlib')

const config = require('./fixture/nuxt.config')

const url = path => `http://localhost:3000${path}`
const get = path => request(url(path))
const getGzip = path => request({ url: url(path), encoding: null })

describe('ssr', () => {
  let nuxt

  beforeAll(async () => {
    nuxt = new Nuxt(config)
    await new Builder(nuxt).build()
    await nuxt.listen(3000)
  }, 60000)

  afterAll(async () => {
    await nuxt.close()
  })

  test('render', async () => {
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
  })

  test('sitemap', async () => {
    const xml = await get('/sitemap.xml')

    // static routes
    expect(xml).toContain('<loc>http://localhost:3000/</loc>')
    expect(xml).toContain('<loc>http://localhost:3000/sub</loc>')
    expect(xml).toContain('<loc>http://localhost:3000/sub/sub</loc>')

    // static child-routes
    expect(xml).toContain('<loc>http://localhost:3000/parent</loc>')
    expect(xml).toContain('<loc>http://localhost:3000/parent/child</loc>')
    expect(xml).toContain('<loc>http://localhost:3000/parent/child/subchild</loc>')
    expect(xml).not.toContain('<loc>http://localhost:3000/parent/</loc>')
    expect(xml).not.toContain('<loc>http://localhost:3000/parent/child/</loc>')

    // dynamic routes
    expect(xml).toContain('<loc>http://localhost:3000/child</loc>')
    expect(xml).toContain('<loc>http://localhost:3000/child/1</loc>')
    expect(xml).toContain('<loc>http://localhost:3000/1/</loc>')

    // excluded routes
    expect(xml).not.toContain('<loc>http://localhost:3000/exclude</loc>')

    // filtered routes
    expect(xml).not.toContain('<loc>http://localhost:3000/filtered</loc>')

    // custom XSL
    expect(xml).toContain('<?xml-stylesheet type="text/xsl" href="sitemap.xsl"?>')

    // default options
    expect(xml).toContain('<url><loc>http://localhost:3000/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>')
  })

  test('sitemap gzip', async () => {
    const xml = await get('/sitemap.xml')
    const gz = await getGzip('/sitemap.xml.gz')
    const sitemap = gunzipSync(gz).toString()
    expect(xml).toEqual(sitemap)
  })
})

describe('generate', () => {
  let nuxt

  beforeAll(async () => {
    nuxt = new Nuxt(config)
    const builder = new Builder(nuxt)
    const generator = new Generator(nuxt, builder)
    await generator.generate()
  }, 60000)

  afterAll(async () => {
    await nuxt.close()
  })

  test('sitemap', async () => {
    const xml = readFileSync(path.resolve(__dirname, '../dist/sitemap.xml'), 'utf8')
    expect(xml).toContain('<loc>http://localhost:3000/</loc>')
  })
})
