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

const setupNuxt = async (config) => {
  const nuxt = new Nuxt(config)
  await nuxt.ready()
  await new Builder(nuxt).build()
  port = await getPort()
  await nuxt.listen(port)

  return nuxt
}

describe('module', () => {
  beforeEach(() => {
    logger.clear()
  })

  afterEach(async () => {
    if (nuxt) {
      await nuxt.close()
    }
  })

  test('render', async () => {
    nuxt = await setupNuxt(config)

    expect(await get('/')).toContain('/index')
    expect(await get('/exclude')).toContain('/exclude')
    expect(await get('/filtered')).toContain('/filtered')
    expect(await get('/child')).toContain('/child/index')
    expect(await get('/child/1')).toContain('/child/1')
    expect(await get('/sub')).toContain('/sub/index')
    expect(await get('/sub/sub')).toContain('/sub/sub')
  })

  test('default options', async () => {
    nuxt = await setupNuxt(config)

    const xml = await get('/sitemap.xml')
    const hostname = nuxt.options.build.publicPath
    expect(xml).toContain(`<loc>${hostname}</loc>`)
    expect(xml).toContain(`<loc>${hostname}exclude</loc>`)
    expect(xml).toContain(`<loc>${hostname}filtered</loc>`)
    expect(xml).toContain(`<loc>${hostname}child</loc>`)
    expect(xml).toContain(`<loc>${hostname}sub</loc>`)
    expect(xml).toContain(`<loc>${hostname}sub/sub</loc>`)
  })

  test('option generate', async () => {
    nuxt = await setupNuxt({
      ...config,
      sitemap: {
        generate: true
      }
    })

    expect(logger.warn).toHaveBeenCalledWith('The option `sitemap.generate` isn\'t needed anymore')
  })

  test('custom options', async () => {
    const hostname = 'http://localhost:3000/'
    nuxt = await setupNuxt({
      ...config,
      sitemap: {
        path: 'my-sitemap.xml',
        hostname,
        exclude: [
          '/exclude'
        ],
        routes: [
          'child/1',
          'child/2'
        ],
        filter: ({ routes }) => routes.filter(route => route.url !== '/filtered'),
        gzip: true
      }
    })

    await expect(get('/sitemap.xml')).rejects.toMatchObject({
      statusCode: 404
    })

    const xml = await get('/my-sitemap.xml')
    expect(xml).toContain(`<loc>${hostname}</loc>`)
    expect(xml).toContain(`<loc>${hostname}child</loc>`)
    expect(xml).toContain(`<loc>${hostname}child/1</loc>`)
    expect(xml).toContain(`<loc>${hostname}child/2</loc>`)
    expect(xml).toContain(`<loc>${hostname}sub</loc>`)
    expect(xml).toContain(`<loc>${hostname}sub/sub</loc>`)
    expect(xml).not.toContain(`<loc>${hostname}filtered</loc>`)
    expect(xml).not.toContain(`<loc>${hostname}exclude</loc>`)

    const gz = await getGzip('/my-sitemap.xml.gz')
    const sitemap = gunzipSync(gz).toString()
    expect(xml).toEqual(sitemap)
  })
})

describe('generate', () => {
  beforeAll(async () => {
    nuxt = new Nuxt({
      ...config,
      sitemap: {
        hostname: 'http://localhost:3000/',
        exclude: [
          '/exclude'
        ],
        routes: [
          'child/1',
          'child/2'
        ],
        filter: ({ routes }) => routes.filter(route => route.url !== '/filtered'),
        gzip: true
      }
    })
    const builder = new Builder(nuxt)
    const generator = new Generator(nuxt, builder)
    await generator.generate()
  })

  afterAll(async () => {
    await nuxt.close()
  })

  test('sitemap', () => {
    const xml = readFileSync(resolve(__dirname, '../dist/sitemap.xml'), 'utf8')
    expect(xml).toContain('<loc>http://localhost:3000/</loc>')
    expect(xml).toContain('<loc>http://localhost:3000/child</loc>')
    expect(xml).toContain('<loc>http://localhost:3000/child/1</loc>')
    expect(xml).toContain('<loc>http://localhost:3000/child/2</loc>')
    expect(xml).toContain('<loc>http://localhost:3000/sub</loc>')
    expect(xml).toContain('<loc>http://localhost:3000/sub/sub</loc>')
    expect(xml).not.toContain('<loc>http://localhost:3000/filtered</loc>')
    expect(xml).not.toContain('<loc>http://localhost:3000/exclude</loc>')
  })

  test('sitemap gzip', () => {
    const xml = readFileSync(resolve(__dirname, '../dist/sitemap.xml'), 'utf8')
    const gz = readFileSync(resolve(__dirname, '../dist/sitemap.xml.gz'))
    const sitemap = gunzipSync(gz).toString()
    expect(xml).toEqual(sitemap)
  })
})
