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
 * @param   {string}  base
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
  routes = routes.map((route) => ({ ...options.defaults, ...route }))

  // Add a trailing slash to each route URL
  if (options.trailingSlash) {
    routes = routes.map((route) => {
      if (!route.url.endsWith('/')) {
        route.url = `${route.url}/`
      }
      return route
    })
  }

  // Group each route with its alternative languages
  if (options.i18n) {
    const { defaultLocale, locales, routesNameSeparator } = options.i18n

    // Set alternate routes for each page
    const i18nRoutes = routes.reduce((i18nRoutes, route, index) => {
      if (!route.name) {
        // Route without alternate link
        i18nRoutes[`#${index}`] = route
        return i18nRoutes
      }

      let [page, lang, isDefault] = route.name.split(routesNameSeparator) // eslint-disable-line prefer-const

      // Get i18n route, or init it
      const i18nRoute = i18nRoutes[page] || { ...route }

      if (lang) {
        // Set main link
        if (isDefault) {
          lang = 'x-default'
        }
        if (lang === defaultLocale) {
          i18nRoute.url = route.url
        }

        // Set alternate links
        if (!i18nRoute.links) {
          i18nRoute.links = []
        }

        const locale = locales.find(({ code }) => code === lang) || { iso: lang }
        i18nRoute.links.push({
          lang: locale.iso,
          url: route.url,
        })
      } else {
        // No alternate link found
        i18nRoute.url = route.url
      }

      i18nRoutes[page] = i18nRoute
      return i18nRoutes
    }, {})

    routes = Object.values(i18nRoutes)
  }

  // Enable the custom filter function for each declared route
  if (typeof options.filter === 'function') {
    routes = options.filter({
      options: { ...sitemapConfig },
      routes,
    })
  }

  routes = routes.map((route) => {
    // Omit the router data
    const { chunkName, component, name, path, ...sitemapOptions } = route

    // Normalize to absolute path
    return {
      ...sitemapOptions,
      url: join('.', String(sitemapOptions.url)),
    }
  })

  // Set urls
  sitemapConfig.urls = routes

  // Create sitemap instance
  return sm.createSitemap(sitemapConfig)
}

/**
 * Initialize a fresh sitemapindex instance
 *
 * @param   {Object}  options
 * @param   {string}  base
 * @param   {Request} req
 * @returns {string}
 */
function createSitemapIndex(options, base = null, req = null) {
  const sitemapIndexConfig = {}

  // Set urls
  const defaultHostname = options.hostname
  sitemapIndexConfig.urls = options.sitemaps.map((options) => {
    // Normalize to absolute path
    const path = join('.', options.gzip ? `${options.path}.gz` : options.path)
    const hostname = getHostname(options.hostname ? options : { ...options, hostname: defaultHostname }, req, base)
    const url = new URL(path, hostname)
    return { url: url.href, lastmod: options.lastmod }
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
