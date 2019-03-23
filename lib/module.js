const { join, resolve } = require('path')
const { promisify } = require('util')
const { hostname } = require('os')
const { Minimatch } = require('minimatch')
const { outputFileSync } = require('fs-extra')
const sm = require('sitemap')
const isHTTPS = require('is-https')
const uniq = require('lodash/uniq')
const AsyncCache = require('async-cache')
const logger = require('./logger')
const { promisifyRoute, routesUnion } = require('./routes')

function sitemapModule(moduleOptions) {
  const defaults = {
    path: 'sitemap.xml',
    hostname: this.options.build.publicPath || undefined,
    exclude: [],
    routes: this.options.generate.routes || [],
    cacheTime: 1000 * 60 * 15,
    filter: undefined,
    gzip: false
  }

  const options = {
    ...defaults,
    ...this.options.sitemap,
    ...moduleOptions
  }

  const pathGzip = options.gzip ? `${options.path}.gz` : options.path

  // sitemap-routes.json is written to dist dir on build mode
  const jsonStaticRoutesPath = resolve(this.options.buildDir, join('dist', 'sitemap-routes.json'))

  let cache = null

  // Extend routes
  this.extendRoutes((routes) => {
    // Map to path and filter dynamic routes
    let staticRoutes = routes
      .map(r => r.path)
      .filter(r => !r.includes(':') && !r.includes('*'))

    // Exclude routes
    options.exclude.forEach((pattern) => {
      const minimatch = new Minimatch(pattern)
      minimatch.negate = true
      staticRoutes = staticRoutes.filter(route => minimatch.match(route))
    })

    if (!this.options.dev) {
      outputFileSync(jsonStaticRoutesPath, staticRoutes)
    }

    // Create a cache for routes
    cache = createCache(staticRoutes, options)
  })

  if (options.generate) {
    logger.warn('The option `sitemap.generate` isn\'t needed anymore')
  }

  // Generate sitemap.xml in dist
  this.nuxt.hook('generate:done', async () => {
    const routes = await cache.get('routes')
    const sitemap = await createSitemap(options, routes)
    const xml = await sitemap.toXML()
    const xmlGeneratePath = resolve(this.options.rootDir, this.options.generate.dir, options.path)
    outputFileSync(xmlGeneratePath, xml)

    if (options.gzip) {
      const gzip = await sitemap.toGzip()
      const gzipGeneratePath = resolve(this.options.rootDir, this.options.generate.dir, pathGzip)
      outputFileSync(gzipGeneratePath, gzip)
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

// Initialize a AsyncCache instance for
function createCache(staticRoutes, options) {
  const cache = new AsyncCache({
    maxAge: options.cacheTime,
    load(_, callback) {
      promisifyRoute(options.routes)
        .then(routes => routesUnion(staticRoutes, routes))
        .then((routes) => {
          callback(null, routes)
        })
        .catch((err) => {
          callback(err)
        })
    }
  })

  cache.get = promisify(cache.get)

  return cache
}

// Initialize a fresh sitemap instance
function createSitemap(options, routes, req) {
  const sitemapConfig = {}

  // Set sitemap hostname
  sitemapConfig.hostname = options.hostname ||
    (req && `${isHTTPS(req) ? 'https' : 'http'}://${req.headers.host}`) || `http://${hostname()}`

  // Enable filter function for each declared route
  if (typeof options.filter === 'function') {
    routes = options.filter({
      routes,
      options: { ...options, ...sitemapConfig }
    })
  }

  // Set urls and ensure they are unique
  sitemapConfig.urls = uniq(routes)

  // Set cacheTime
  sitemapConfig.cacheTime = options.cacheTime || 0

  // Create promisified instance and return
  const sitemap = sm.createSitemap(sitemapConfig)
  sitemap.toXML = promisify(sitemap.toXML)

  return sitemap
}

module.exports = sitemapModule
module.exports.meta = require('../package.json')
