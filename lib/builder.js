const { hostname } = require('os')
const { join } = require('path')
const { URL } = require('url')

const isHTTPS = require('is-https')
const sm = require('sitemap')

const logger = require('./logger')

/**
 * Initialize a fresh sitemap instance
 *
 * @param   {Object}  options
 * @param   {Array}   routes
 * @param   {String}  base
 * @param   {Request} req
 * @returns {Sitemap} sitemap instance
 */
function createSitemap(options, routes, base = null, req = null) {
  const sitemapConfig = {}

  // Set cacheTime
  sitemapConfig.cacheTime = options.cacheTime || 0

  // Set sitemap hostname
  sitemapConfig.hostname = getHostname(options, req, base)

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

  // Normalize to absolute path each route URL
  routes = routes.map(route => ({
    ...route,
    url: join('.', route.url)
  }))

  // Set urls and ensure they are unique
  sitemapConfig.urls = [...new Set(routes)]

  // Create sitemap instance
  return sm.createSitemap(sitemapConfig)
}

/**
 * Initialize a fresh sitemapindex instance
 *
 * @param   {Object}  options
 * @param   {String}  base
 * @param   {Request} req
 * @returns {string}
 */
function createSitemapIndex(options, base = null, req = null) {
  const sitemapIndexConfig = {}

  // Set urls
  const defaultHostname = options.hostname
  sitemapIndexConfig.urls = options.sitemaps.map(options => {
    // Normalize to absolute path
    const path = join('.', options.gzip ? `${options.path}.gz` : options.path)
    const hostname = getHostname(options.hostname ? options : { ...options, hostname: defaultHostname }, req, base)
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
 * @param   {string}  base
 * @returns {string}
 */
function getHostname(options, req, base) {
  /* istanbul ignore if */
  if (!options.hostname && !req) {
    logger.fatal('The `hostname` option is mandatory in your config on `spa` or `generate` build mode', options)
  }
  return join(
    options.hostname || (req && `${isHTTPS(req) ? 'https' : 'http'}://${req.headers.host}`) || `http://${hostname()}`,
    base
  )
}

module.exports = { createSitemap, createSitemapIndex }
