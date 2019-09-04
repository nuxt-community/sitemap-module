const { promisify } = require('util')

const AsyncCache = require('async-cache')
const unionBy = require('lodash.unionby')

/**
 * Initialize a AsyncCache instance for routes
 *
 * @param {string[]} staticRoutes
 * @param {Object} options
 * @returns {AsyncCache.Cache<any>} Cache instance
 */
function createCache(staticRoutes, options) {
  const cache = new AsyncCache({
    maxAge: options.cacheTime,
    load(_, callback) {
      promisifyRoute(options.routes)
        .then(routes => routesUnion(staticRoutes, routes))
        .then(routes => {
          callback(null, routes)
        })
        .catch(err => {
          /* istanbul ignore next */
          callback(err)
        })
    }
  })
  cache.get = promisify(cache.get)

  return cache
}

/* istanbul ignore next */

/**
 * Promisify the `options.routes` option
 *
 * @remarks Borrowed from nuxt/common/utils
 *
 * @param {Function} fn Function that fetch dynamic routes
 * @returns {Promise.<Array>} Promise that return a list of routes
 */
function promisifyRoute(fn) {
  // If routes is an array
  if (Array.isArray(fn)) {
    return Promise.resolve(fn)
  }
  // If routes is a function expecting a callback
  if (fn.length === 1) {
    return new Promise((resolve, reject) => {
      fn(function(err, routeParams) {
        if (err) {
          reject(err)
        }
        resolve(routeParams)
      })
    })
  }
  let promise = fn()
  if (!promise || (!(promise instanceof Promise) && typeof promise.then !== 'function')) {
    promise = Promise.resolve(promise)
  }
  return promise
}

/**
 * Join static and options-defined routes into single array
 *
 * @param {string[]} staticRoutes
 * @param {Array} optionsRoutes
 * @returns {Array} List of routes
 */
function routesUnion(staticRoutes, optionsRoutes) {
  // Make sure any routes passed as strings are converted to objects with url properties
  staticRoutes = staticRoutes.map(ensureRouteIsObject)
  optionsRoutes = optionsRoutes.map(ensureRouteIsObject)
  // Add static routes to options routes, discarding any defined in options
  return unionBy(optionsRoutes, staticRoutes, 'url')
}

/**
 * Make sure a passed route is an object
 *
 * @param {Object | string} route Route Object or String value
 * @returns {Object} A valid route object
 */
function ensureRouteIsObject(route) {
  return typeof route === 'object' ? route : { url: route }
}

module.exports = { createCache }
