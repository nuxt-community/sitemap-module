const { gzipSync } = require('zlib')

const consola = require('consola')

const { createSitemap, createSitemapIndex } = require('./builder.js')
const { createRoutesCache } = require('./cache.js')
const { setDefaultSitemapOptions, setDefaultSitemapIndexOptions } = require('./options.js')
const { excludeRoutes } = require('./routes.js')

/**
 * Register a middleware for each sitemap or sitemapindex
 *
 * @param {Object} options
 * @param {Object} globalCache
 * @param {Nuxt}   nuxtInstance
 * @param {number} depth
 */
function registerSitemaps(options, globalCache, nuxtInstance, depth = 0) {
  if (depth > 1) {
    // see https://webmasters.stackexchange.com/questions/18243/can-a-sitemap-index-contain-other-sitemap-indexes
    /* istanbul ignore next */
    consola.warn("A sitemap index file can't list other sitemap index files, but only sitemap files")
  }

  const isSitemapIndex = options && options.sitemaps && Array.isArray(options.sitemaps) && options.sitemaps.length > 0

  if (isSitemapIndex) {
    registerSitemapIndex(options, globalCache, nuxtInstance, depth)
  } else {
    registerSitemap(options, globalCache, nuxtInstance)
  }
}

/**
 * Register a middleware to serve a sitemap
 *
 * @param {Object} options
 * @param {Object} globalCache
 * @param {Nuxt}   nuxtInstance
 */
function registerSitemap(options, globalCache, nuxtInstance) {
  // Init options
  options = setDefaultSitemapOptions(options, nuxtInstance)

  // Init cache
  const cache = {}
  cache.staticRoutes = () => excludeRoutes(options.exclude, globalCache.staticRoutes)
  cache.routes = createRoutesCache(cache, options)

  // On run cmd "start" or "generate [--no-build]"
  if (globalCache.staticRoutes) {
    // On server ready
    nuxtInstance.nuxt.hook('listen', () => {
      // Hydrate cache
      cache.routes.get('routes')
    })
  }

  if (options.gzip) {
    // Add server middleware for sitemap.xml.gz
    nuxtInstance.addServerMiddleware({
      path: options.pathGzip,
      handler(req, res, next) {
        cache.routes
          .get('routes')
          .then(routes => createSitemap(options, routes, req).toGzip())
          .then(gzip => {
            res.setHeader('Content-Type', 'application/x-gzip')
            res.setHeader('Content-Encoding', 'gzip')
            res.end(gzip)
          })
          .catch(err => {
            /* istanbul ignore next */
            next(err)
          })
      }
    })
  }

  // Add server middleware for sitemap.xml
  nuxtInstance.addServerMiddleware({
    path: options.path,
    handler(req, res, next) {
      cache.routes
        .get('routes')
        .then(routes => createSitemap(options, routes, req).toXML())
        .then(xml => {
          res.setHeader('Content-Type', 'application/xml')
          res.end(xml)
        })
        .catch(err => {
          /* istanbul ignore next */
          next(err)
        })
    }
  })
}

/**
 * Register a middleware to serve a sitemapindex
 *
 * @param {Object} options
 * @param {Object} globalCache
 * @param {Nuxt}   nuxtInstance
 * @param {number} depth
 */
function registerSitemapIndex(options, globalCache, nuxtInstance, depth = 0) {
  // Init options
  options = setDefaultSitemapIndexOptions(options)

  if (options.gzip) {
    // Add server middleware for sitemapindex.xml.gz
    nuxtInstance.addServerMiddleware({
      path: options.pathGzip,
      handler(req, res, next) {
        const sitemapIndex = createSitemapIndex(options, req)
        const gzip = gzipSync(sitemapIndex)
        res.setHeader('Content-Type', 'application/x-gzip')
        res.setHeader('Content-Encoding', 'gzip')
        res.end(gzip)
      }
    })
  }

  // Add server middleware for sitemapindex.xml
  nuxtInstance.addServerMiddleware({
    path: options.path,
    handler(req, res, next) {
      const sitemapIndex = createSitemapIndex(options, req)
      res.setHeader('Content-Type', 'application/xml')
      res.end(sitemapIndex)
    }
  })

  // Register linked sitemaps
  options.sitemaps.forEach(sitemapOptions => registerSitemaps(sitemapOptions, globalCache, nuxtInstance, depth + 1))
}

module.exports = { registerSitemaps, registerSitemap, registerSitemapIndex }
