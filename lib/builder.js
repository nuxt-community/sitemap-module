const { hostname } = require('os')
const { URL } = require('url')

const isHTTPS = require('is-https')
const sm = require('sitemap')

/**
 * Initialize a fresh sitemap instance
 *
 * @param   {Object}  options
 * @param   {Array}   routes
 * @param   {Request} req
 * @returns {Sitemap} sitemap instance
 */
function createSitemap(options, routes, req = null) {
  const sitemapConfig = {}

  // Set cacheTime
  sitemapConfig.cacheTime = options.cacheTime || 0

  // Set sitemap hostname
  sitemapConfig.hostname = getHostname(options, req)

  // Set XML namespaces
  sitemapConfig.xmlNs = options.xmlNs

  // Set XSL url
  sitemapConfig.xslUrl = options.xslUrl

  // Set default values to each route
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
      options: { ...sitemapConfig },
      routes
    })
  }

  // Set urls and ensure they are unique
  sitemapConfig.urls = [...new Set(routes)]

  // Create sitemap instance
  return sm.createSitemap(sitemapConfig)
}

/**
 * Initialize a fresh sitemapindex instance
 *
 * @param   {Object}  options
 * @param   {Request} req
 * @returns {string}
 */
function createSitemapIndex(options, req = null) {
  const sitemapIndexConfig = {}

  // Set urls
  const defaultHostname = getHostname(options, req)
  sitemapIndexConfig.urls = options.sitemaps.map(options => {
    const path = options.gzip ? `${options.path}.gz` : options.path
    const hostname = options.hostname || defaultHostname
    const url = new URL(path, hostname)
    return url.href
  })

  // Set lastmod for each sitemap
  sitemapIndexConfig.lastmod = options.lastmod

  // Set XML namespaces
  sitemapIndexConfig.xmlNs = options.xmlNs

  // Set XSL url
  sitemapIndexConfig.xslUrl = options.xslUrl

  // Create a sitemapindex
  return sm.buildSitemapIndex(sitemapIndexConfig)
}

/**
 * Determine the current hostname
 *
 * @param   {Object}  options
 * @param   {Request} req
 * @returns {string}
 */
function getHostname(options, req) {
  return (
    options.hostname || (req && `${isHTTPS(req) ? 'https' : 'http'}://${req.headers.host}`) || `http://${hostname()}`
  )
}

module.exports = { createSitemap, createSitemapIndex }
