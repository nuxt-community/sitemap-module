const { Minimatch } = require('minimatch')
const sm = require('sitemap')
const isHTTPS = require('is-https')
const unionBy = require('lodash.unionby')
const path = require('path')
const fs = require('fs-extra')
const AsyncCache = require('async-cache')
const consola = require('consola')
const { promisify } = require('util')
const { hostname } = require('os')
const extractComponentOptions = require('./extractComponentOptions')
const { COMPONENT_OPTIONS_BLOCK, COMPONENT_OPTIONS_KEY } = require('./constants')
const defaultPublicPath = '/_nuxt/'

module.exports = function module (moduleOptions) {
  const defaults = {
    path: '/sitemap.xml',
    hostname: this.options.build.publicPath !== defaultPublicPath ? this.options.build.publicPath : undefined,
    exclude: [],
    routes: this.options.generate.routes || [],
    cacheTime: 1000 * 60 * 15,
    filter: undefined,
    gzip: false,
    xmlNs: undefined,
    xslUrl: undefined,
    defaults: {}
  }

  const options = {
    ...defaults,
    ...this.options.sitemap,
    ...moduleOptions
  }

  options.pathGzip = options.gzip ? `${options.path}.gz` : options.path

  // sitemap-routes.json is written to dist dir on "build" mode
  const jsonStaticRoutesPath = !this.options.dev ? path.resolve(this.options.buildDir, path.join('dist', 'sitemap-routes.json')) : null

  let staticRoutes = fs.readJsonSync(jsonStaticRoutesPath, { throws: false })
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
  this.extendRoutes(routes => {
    // Get all static routes and ignore dynamic routes
    let staticRoutes = flattenRoutes(routes)
      .filter(r => !r.url.includes(':') && !r.url.includes('*'))
      .filter(route => {
        return extractComponentOptions(route.component, COMPONENT_OPTIONS_BLOCK, COMPONENT_OPTIONS_KEY) !== false
      })

    // Exclude routes
    options.exclude.forEach(pattern => {
      const minimatch = new Minimatch(pattern)
      minimatch.negate = true
      staticRoutes = staticRoutes.filter(route => minimatch.match(route.url))
    })

    // Create a cache for routes
    cache = createCache(staticRoutes, options)

    if (!this.options.dev) {
      // Save static routes
      fs.outputJsonSync(jsonStaticRoutesPath, staticRoutes)
    }
  })

  if (options.generate) {
    consola.warn('The option `sitemap.generate` isn\'t needed anymore')
  }

  // Generate sitemap.xml in dist
  this.nuxt.hook('generate:done', async () => {
    consola.info('Generating sitemaps')

    // Generate sitemap.xml
    const routes = await cache.get('routes')
    const sitemap = await createSitemap(options, routes)
    const xml = await sitemap.toXML()
    const xmlGeneratePath = path.join(this.options.generate.dir, options.path)
    fs.outputFileSync(xmlGeneratePath, xml)
    consola.success('Generated', getPathname(this.options.generate.dir, xmlGeneratePath))

    // Generate sitemap.xml.gz
    if (options.gzip) {
      const gzip = await sitemap.toGzip()
      const gzipGeneratePath = path.join(this.options.generate.dir, options.pathGzip)
      fs.outputFileSync(gzipGeneratePath, gzip)
      consola.success('Generated', getPathname(this.options.generate.dir, gzipGeneratePath))
    }
  })

  if (options.gzip) {
    // Add server middleware for sitemap.xml.gz
    this.addServerMiddleware({
      path: options.pathGzip,
      handler (req, res, next) {
        cache.get('routes')
          .then(routes => createSitemap(options, routes, req))
          .then(sitemap => sitemap.toGzip())
          .then(gzip => {
            res.setHeader('Content-Type', 'application/x-gzip')
            res.setHeader('Content-Encoding', 'gzip')
            res.end(gzip)
          }).catch(err => {
            next(err)
          })
      }
    })
  }

  // Add server middleware for sitemap.xml
  this.addServerMiddleware({
    path: options.path,
    handler (req, res, next) {
      cache.get('routes')
        .then(routes => createSitemap(options, routes, req))
        .then(sitemap => sitemap.toXML())
        .then(xml => {
          res.setHeader('Content-Type', 'application/xml')
          res.end(xml)
        }).catch(err => {
          next(err)
        })
    }
  })
}

// Initialize a AsyncCache instance for
function createCache (staticRoutes, options) {
  let cache = new AsyncCache({
    maxAge: options.cacheTime,
    load (_, callback) {
      promisifyRoute(options.routes)
        .then(routes => routesUnion(staticRoutes, routes))
        .then(routes => {
          callback(null, routes)
        })
        .catch(err => {
          callback(err)
        })
    }
  })
  cache.get = promisify(cache.get)

  return cache
}

// Initialize a fresh sitemap instance
function createSitemap (options, routes, req) {
  const sitemapConfig = {}

  // Set sitemap hostname
  sitemapConfig.hostname = options.hostname ||
    (req && `${isHTTPS(req) ? 'https' : 'http'}://${req.headers.host}`) || `http://${hostname()}`

  routes = routes.map(route => ({ ...options.defaults, ...route }))

  // Enable filter function for each declared route
  if (typeof options.filter === 'function') {
    routes = options.filter({ routes, options: { ...options, ...sitemapConfig } })
  }

  // Set urls and ensure they are unique
  sitemapConfig.urls = [...new Set(routes)]

  // Set cacheTime
  sitemapConfig.cacheTime = options.cacheTime || 0

  // Set XML namespaces
  sitemapConfig.xmlNs = options.xmlNs

  // Set XSL url
  sitemapConfig.xslUrl = options.xslUrl

  // Create promisified instance and return
  const sitemap = sm.createSitemap(sitemapConfig)
  sitemap.toXML = promisify(sitemap.toXML)

  return sitemap
}

// Borrowed from nuxt/common/utils
function promisifyRoute (fn) {
  // If routes is an array
  if (Array.isArray(fn)) {
    return Promise.resolve(fn)
  }
  // If routes is a function expecting a callback
  if (fn.length === 1) {
    return new Promise((resolve, reject) => {
      fn(function (err, routeParams) {
        if (err) {
          reject(err)
        }
        resolve(routeParams)
      })
    })
  }
  let promise = fn()
  if (!promise || (!(promise instanceof Promise) && (typeof promise.then !== 'function'))) {
    promise = Promise.resolve(promise)
  }
  return promise
}

// Join static and options-defined routes into single array
function routesUnion (staticRoutes, optionsRoutes) {
  // Make sure any routes passed as strings are converted to objects with url properties
  staticRoutes = staticRoutes.map(ensureRouteIsObject)
  optionsRoutes = optionsRoutes.map(ensureRouteIsObject)
  // Add static routes to options routes, discarding any defined in options
  return unionBy(optionsRoutes, staticRoutes, 'url')
}

// Make sure a passed route is an object
function ensureRouteIsObject (route) {
  return typeof route === 'object' ? route : { url: route }
}

// Recursively flatten all routes and their child-routes
function flattenRoutes (router, path = '', routes = []) {
  router.forEach(r => {
    if (r.children) {
      flattenRoutes(r.children, path + r.path + '/', routes)
    }
    if (r.path !== '') {
      routes.push({ ...r, url: path + r.path })
    }
  })
  return routes
}

// Convert a file path to a url pathname
function getPathname (dirPath, filePath) {
  return [, ...path.relative(dirPath, filePath).split(path.sep)].join('/')
}

module.exports.meta = require('../package.json')
