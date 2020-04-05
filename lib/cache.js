const { promisify } = require('util')

const AsyncCache = require('async-cache')
const unionBy = require('lodash.unionby')

/**
 * Initialize a cache instance for sitemap routes
 *
 * @param   {Object} globalCache
 * @param   {Object} options
 * @returns {AsyncCache.Cache<any>} Cache instance
 */
function createRoutesCache(globalCache, options) {
  const cache = new AsyncCache({
    maxAge: options.cacheTime,
    async load(_, callback) {
      try {
        let routes = await promisifyRoute(options.routes)
        routes = joinRoutes(globalCache.staticRoutes ? globalCache.staticRoutes() : [], routes)
        callback(null, routes)
      } catch (err) {
        /* istanbul ignore next */
        callback(err)
      }
    },
  })
  cache.get = promisify(cache.get)

  return cache
}

/* istanbul ignore next */
/* eslint-disable */

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
      fn(function (err, routeParams) {
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
/* eslint-enable */

/**
 * Join static and dynamic routes into a single list
 *
 * @param   {Array} staticRoutes
 * @param   {Array} dynamicRoutes
 * @returns {Array} List of routes
 */
function joinRoutes(staticRoutes, dynamicRoutes) {
  // Validate routes
  staticRoutes = staticRoutes.map(ensureIsValidRoute)
  dynamicRoutes = dynamicRoutes.map(ensureIsValidRoute)
  // Join sitemap routes by URL
  return unionBy(dynamicRoutes, staticRoutes, 'url')
}

/**
 * Make sure a route is an object with an "url" string property
 *
 * @param   {Object | string} route Route Object or Payload Object or String value
 * @returns {Object} A valid route object
 */
function ensureIsValidRoute(route) {
  route = typeof route === 'object' ? (route.route ? { url: route.route } : route) : { url: route }
  // force as string
  route.url = String(route.url)
  return route
}

module.exports = { createRoutesCache }
