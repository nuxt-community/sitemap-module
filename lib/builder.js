const { hostname } = require('os')
const { promisify } = require('util')

const isHTTPS = require('is-https')
const sm = require('sitemap')

/**
 * Initialize a fresh sitemap instance
 *
 * @param {Object} options
 * @param {Array} routes
 * @param {Request} req
 * @returns {Sitemap} sitemap builder
 */
function createSitemap(options, routes, req = null) {
  const sitemapConfig = {}

  // Set sitemap hostname
  sitemapConfig.hostname =
    options.hostname || (req && `${isHTTPS(req) ? 'https' : 'http'}://${req.headers.host}`) || `http://${hostname()}`

  routes = routes.map(route => ({ ...options.defaults, ...route }))

  // Add a trailing slash to each route URL
  if (options.trailingSlash) {
    routes = routes.map(route => {
      if (!route.url.endsWith('/')) route.url = `${route.url}/`
      return route
    })
  }

  // Enable filter function for each declared route
  if (typeof options.filter === 'function') {
    routes = options.filter({
      routes,
      options: { ...options, ...sitemapConfig }
    })
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

module.exports = { createSitemap }
