const { join, resolve } = require('path')
const { Minimatch } = require('minimatch')
const { outputFileSync, outputJsonSync, readJsonSync } = require('fs-extra')
const logger = require('./logger')
const { createCache, createSitemap, getPathname, flatRoutes } = require('./utils')

const defaultPublicPath = '/_nuxt/'

function sitemapModule(moduleOptions) {
  const options = {
    path: '/sitemap.xml',
    hostname: this.options.build.publicPath !== defaultPublicPath ? this.options.build.publicPath : undefined,
    exclude: [],
    routes: this.options.generate.routes || [],
    cacheTime: 1000 * 60 * 15,
    filter: undefined,
    gzip: false,
    xmlNs: undefined,
    xslUrl: undefined,
    defaults: {},
    ...this.options.sitemap,
    ...moduleOptions
  }

  const pathGzip = options.gzip ? `${options.path}.gz` : options.path

  // sitemap-routes.json is written to dist dir on "build" mode
  const jsonStaticRoutesPath = !this.options.dev ? resolve(this.options.buildDir, join('dist', 'sitemap-routes.json')) : null

  const staticRoutes = readJsonSync(jsonStaticRoutesPath, { throws: false })
  let cache = null

  // On run cmd "start" or "generate [--no-build]"
  if (staticRoutes) {
    // Create a cache for routes
    cache = createCache(staticRoutes, options)

    // On server ready, hydrate cache
    this.nuxt.hook('listen', () => {
      cache.get('routes')
    })
  }

  // On extend routes
  this.extendRoutes((routes) => {
    // Get all static routes and ignore dynamic routes
    let staticRoutes = flatRoutes(routes)

    // Exclude routes
    options.exclude.forEach((pattern) => {
      const minimatch = new Minimatch(pattern)
      minimatch.negate = true
      staticRoutes = staticRoutes.filter(route => minimatch.match(route))
    })

    // Create a cache for routes
    cache = createCache(staticRoutes, options)

    if (!this.options.dev) {
      // Save static routes
      outputJsonSync(jsonStaticRoutesPath, staticRoutes)
    }
  })

  if (options.generate) {
    logger.warn('The option `sitemap.generate` isn\'t needed anymore')
  }

  // Generate sitemap.xml in dist
  this.nuxt.hook('generate:done', async () => {
    logger.info('Generating sitemaps')

    // Generate sitemap.xml
    const routes = await cache.get('routes')
    const sitemap = await createSitemap(options, routes)
    const xml = await sitemap.toXML()
    const xmlGeneratePath = join(this.options.generate.dir, options.path)
    outputFileSync(xmlGeneratePath, xml)
    logger.success('Generated', getPathname(this.options.generate.dir, xmlGeneratePath))

    // Generate sitemap.xml.gz
    if (options.gzip) {
      const gzip = await sitemap.toGzip()
      const gzipGeneratePath = join(this.options.generate.dir, pathGzip)
      outputFileSync(gzipGeneratePath, gzip)
      logger.success('Generated', getPathname(this.options.generate.dir, gzipGeneratePath))
    }
  })

  if (options.gzip) {
    // Add server middleware for sitemap.xml.gz
    this.addServerMiddleware({
      path: pathGzip,
      handler(req, res, next) {
        cache.get('routes')
          .then(routes => createSitemap(options, routes, req))
          .then(sitemap => sitemap.toGzip())
          .then((gzip) => {
            res.setHeader('Content-Type', 'application/x-gzip')
            res.setHeader('Content-Encoding', 'gzip')
            res.end(gzip)
          }).catch((err) => {
            next(err)
          })
      }
    })
  }

  // Add server middleware for sitemap.xml
  this.addServerMiddleware({
    path: options.path,
    handler(req, res, next) {
      cache.get('routes')
        .then(routes => createSitemap(options, routes, req))
        .then(sitemap => sitemap.toXML())
        .then((xml) => {
          res.setHeader('Content-Type', 'application/xml')
          res.end(xml)
        }).catch((err) => {
          next(err)
        })
    }
  })
}

module.exports = sitemapModule
module.exports.meta = require('../package.json')
