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

// Defaults
const defaults = {
  path: '/sitemap.xml',
  hostname: null,
  generate: false,
  exclude: [],
  routes: [],
  cacheTime: 1000 * 60 * 15,
  gzip: false
}

module.exports = function module (moduleOptions) {
  const options = {
    sitemaps: []
  }

  // Merge the options with the default values
  mergeOrPushSitemaps(this.options.sitemap, options)
  mergeOrPushSitemaps(moduleOptions, options)

  // sitemap-routes.json is written to dist dir on build mode
  const jsonStaticRoutesPath = path.resolve(this.options.buildDir, path.join('dist', 'sitemap-routes.json'))
  let staticRoutes = fs.readJsonSync(jsonStaticRoutesPath, { throws: false })

  options.sitemaps.map((sitemap) => {
    // sitemap.xml is written to static dir on generate mode
    const xmlGeneratePath = path.resolve(this.options.srcDir, path.join('static', sitemap.path))

    sitemap.pathGzip = (sitemap.gzip) ? `${sitemap.path}.gz` : sitemap.path
    const gzipGeneratePath = path.resolve(this.options.srcDir, path.join('static', sitemap.pathGzip))

    // Ensure no generated file exists
    fs.removeSync(xmlGeneratePath)
    fs.removeSync(gzipGeneratePath)

    sitemap.cache = null

    // TODO find a better way to detect if is a "build", "start" or "generate" command
    // on "start" cmd only
    if (staticRoutes && !this.options.dev) {
      // Create a cache for routes
      sitemap.cache = createCache(staticRoutes, sitemap)
      // Hydrate cache
      sitemap.cache.get('routes')
    }

    // Extend routes
    this.extendRoutes(routes => {
      // Map to path and filter dynamic routes
      let staticRoutes = routes
        .map(r => r.path)
        .filter(r => !r.includes(':') && !r.includes('*'))

      // Exclude routes
      sitemap.exclude.forEach(pattern => {
        const minimatch = new Minimatch(pattern)
        minimatch.negate = true
        staticRoutes = staticRoutes.filter(route => minimatch.match(route))
      })

      if (this.options.dev || sitemap.generate) {
        // Create a cache for routes
        sitemap.cache = createCache(staticRoutes, sitemap)
      }

      if (!this.options.dev) {
        // TODO on build process only
        // Save static routes
        fs.ensureDirSync(path.resolve(this.options.buildDir, 'dist'))
        fs.writeJsonSync(jsonStaticRoutesPath, staticRoutes)

        // TODO on generate process only and not on build process
        if (sitemap.generate) {
          (async () => {
            // Generate static sitemap.xml
            const routes = await sitemap.cache.get('routes')
            const sm = await createSitemap(sitemap, routes)
            const xml = await sitemap.toXML()
            await fs.ensureFile(xmlGeneratePath)
            await fs.writeFile(xmlGeneratePath, xml)
            if (sitemap.gzip) {
              const gzip = await sm.toGzip()
              await fs.writeFile(gzipGeneratePath, gzip)
            }
          })()
        }
      }
    })

    return sitemap
  })

  options.sitemaps.forEach((sitemap) => {
    if (sitemap.gzip) {
      // Add server middleware for sitemap.xml.gz
      this.addServerMiddleware({
        path: sitemap.pathGzip,
        handler (req, res, next) {
          sitemap.cache.get('routes')
            .then(routes => createSitemap(sitemap, routes, req))
            .then(sm => sm.toGzip())
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
      path: sitemap.path,
      handler (req, res, next) {
        sitemap.cache.get('routes')
          .then(routes => createSitemap(sitemap, routes, req))
          .then(sm => sm.toXML())
          .then(xml => {
            res.setHeader('Content-Type', 'application/xml')
            res.end(xml)
          }).catch(err => {
            next(err)
          })
      }
    })
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

/**
 * Merge or push the value in the sitemap list whenever the value is an array or an object
 * @function mergeOrPushSitemaps
 * @param {Object|Array} value - The value to be merged or pushed
 * @param {Object} options - Options object
 */
function mergeOrPushSitemaps (value, options) {
  if (!value) return
  if (value instanceof Array && value.length > 0) {
    const sitemapsMapped = value.map(v => Object.assign({}, defaults, v))
    options.sitemaps = [...options.sitemaps, ...sitemapsMapped]
  } else if (Object.keys(value).length > 0) {
    // Add object to the sitemap array only if there is a value & the value contains
    // at least one property
    const sitemapMapped = Object.assign({}, defaults, value)
    options.sitemaps.push(sitemapMapped)
  }
}
