const { relative, sep } = require('path')
const { promisify } = require('util')
const { hostname } = require('os')
const sm = require('sitemap')
const isHTTPS = require('is-https')
const AsyncCache = require('async-cache')
const unionBy = require('lodash/unionBy')

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

// Convert a file path to a url pathname
function getPathname(dirPath, filePath) {
  return [...relative(dirPath, filePath).split(sep)].join('/')
}

function promisifyRoute(fn, ...args) {
  // If routes is an array
  if (Array.isArray(fn)) {
    return Promise.resolve(fn)
  }
  // If routes is a function expecting a callback
  if (fn.length === arguments.length) {
    return new Promise((resolve, reject) => {
      fn((err, routeParams) => {
        if (err) {
          reject(err)
        }
        resolve(routeParams)
      }, ...args)
    })
  }
  let promise = fn(...args)
  if (
    !promise ||
    (!(promise instanceof Promise) && typeof promise.then !== 'function')
  ) {
    promise = Promise.resolve(promise)
  }
  return promise
}

// Join static and options-defined routes into single array
function routesUnion(staticRoutes, optionsRoutes) {
  // Make sure any routes passed as strings are converted to objects with url properties
  staticRoutes = staticRoutes.map(ensureRouteIsObject)
  optionsRoutes = optionsRoutes.map(ensureRouteIsObject)

  // add static routes to options routes, discarding any defined in options
  return unionBy(optionsRoutes, staticRoutes, 'url')
}

// Make sure a passed route is an object
function ensureRouteIsObject(route) {
  return typeof route === 'object' ? route : { url: route }
}

function flatRoutes(router, fileName = '', routes = []) {
  router.forEach((r) => {
    if ([':', '*'].some(c => r.path.includes(c))) {
      return
    }
    if (r.children) {
      if (fileName === '' && r.path === '/') {
        routes.push('/')
      }
      return flatRoutes(r.children, fileName + r.path + '/', routes)
    }
    fileName = fileName.replace(/^\/+$/, '/')
    routes.push(
      (r.path === '' && fileName[fileName.length - 1] === '/'
        ? fileName.slice(0, -1)
        : fileName) + r.path
    )
  })
  return routes
}

module.exports = {
  createCache,
  createSitemap,
  getPathname,
  flatRoutes
}
