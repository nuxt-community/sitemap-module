const { createSitemap } = require('./builder.js')

/**
 * Register a middleware to serve a sitemap
 *
 * @param {Object} options
 * @param {Object} cache
 * @param {Nuxt} nuxtInstance
 */
function registerSitemap(options, cache, nuxtInstance) {
  if (options.gzip) {
    // Add server middleware for sitemap.xml.gz
    nuxtInstance.addServerMiddleware({
      path: options.pathGzip,
      handler(req, res, next) {
        cache.sitemap
          .get('routes')
          .then(routes => createSitemap(options, routes, req))
          .then(sitemap => sitemap.toGzip())
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
      cache.sitemap
        .get('routes')
        .then(routes => createSitemap(options, routes, req))
        .then(sitemap => sitemap.toXML())
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

module.exports = { registerSitemap }
