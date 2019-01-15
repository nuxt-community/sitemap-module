const { Minimatch } = require('minimatch')
const sm = require('sitemap')
const isHTTPS = require('is-https')
const unionBy = require('lodash/unionBy')
const uniq = require('lodash/uniq')
const path = require('path')
const fs = require('fs-extra')
const AsyncCache = require('async-cache')
const { promisify } = require('util')
const { hostname } = require('os')
const debug = require('debug')('nuxt:pwa')

const defaults = {
  path: '/sitemap.xml',
  hostname: undefined,
  generate: false,
  exclude: [],
  routes: [],
  cacheTime: 1000 * 60 * 15,
  filter: undefined,
  gzip: false
}

module.exports = function nuxtSitemap (options) {
  const hook = () => {
    debug('Adding sitemap')
    addSitemap.call(this, options)
  }

  if (this.options.mode === 'spa') {
    return hook()
  }

  this.nuxt.hook('build:before', hook)
}

function addSitemap (moduleOptions) {
  const options = Object.assign({}, defaults, this.options.sitemap, moduleOptions)

  options.pathGzip = (options.gzip) ? `${options.path}.gz` : options.path

  // sitemap-routes.json is written to dist dir on build mode
  const jsonStaticRoutesPath = path.resolve(this.options.buildDir, path.join('dist', 'sitemap-routes.json'))

  let staticRoutes = fs.readJsonSync(jsonStaticRoutesPath, { throws: false })
  let cache = null

  // TODO find a better way to detect if is a "build", "start" or "generate" command
  // on "start" cmd only
  if (staticRoutes && !this.options.dev) {
    // Create a cache for routes
    cache = createCache(staticRoutes, options)
    // Hydrate cache
    cache.get('routes')
  }

  // Extend routes
  this.extendRoutes(routes => {
    // Map to path and filter dynamic routes
    let staticRoutes = routes
      .map(r => r.path)
      .filter(r => !r.includes(':') && !r.includes('*'))

    // Exclude routes
    options.exclude.forEach(pattern => {
      const minimatch = new Minimatch(pattern)
      minimatch.negate = true
      staticRoutes = staticRoutes.filter(route => minimatch.match(route))
    })

    if (this.options.dev || options.generate) {
      // Create a cache for routes
      cache = createCache(staticRoutes, options)
    }

    if (!this.options.dev) {
      // TODO on build process only
      // Save static routes
      fs.ensureDirSync(path.resolve(this.options.buildDir, 'dist'))
      fs.writeJsonSync(jsonStaticRoutesPath, staticRoutes)

      // TODO on generate process only and not on build process
      if (options.generate) {
        // Register webpack plugin to emit sitemap
        this.options.build.plugins.push({
          apply (compiler) {
            compiler.hooks.emit.tap('nuxt-sitemap', async (compilation) => {
              const routes = await cache.get('routes')
              const sitemap = await createSitemap(options, routes)
              const xml = await sitemap.toXML()

              compilation.assets[options.path] = {
                source: () => xml,
                size: () => xml.length
              }

              if (options.gzip) {
                const gzip = await sitemap.toGzip()

                compilation.assets[options.pathGzip] = {
                  source: () => gzip,
                  size: () => gzip.length
                }
              }
            })
          }
        })
      }
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

  // Enable filter function for each declared route
  if (typeof options.filter === 'function') {
    routes = options.filter({ routes, options: Object.assign({}, options, sitemapConfig) })
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
  // add static routes to options routes, discarding any defined in options
  return unionBy(optionsRoutes, staticRoutes, 'url')
}

// Make sure a passed route is an object
function ensureRouteIsObject (route) {
  return typeof route === 'object' ? route : { url: route }
}
