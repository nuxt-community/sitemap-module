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
    load(_, callback) {
      try {
        let routes = []

        if (Array.isArray(options.routes)) {
          routes = options.routes
          // Assume `options.routes` is a function with no arguments
        } else if (options.routes.length === 0) {
          routes = options.routes()
        }

        routes = joinRoutes(globalCache.staticRoutes ? globalCache.staticRoutes() : [], routes)
        callback(null, routes)
      } catch (err) {
        /* istanbul ignore next */
        callback(err)
      }
    }
  })
  cache.get = promisify(cache.get)

  return cache
}

/**
 * Initialize a cache instance for dynamic(request based) sitemap routes
 *
 * @param   {Object} options
 * @returns {AsyncCache.Cache<any>} Cache instance
 */
function createDynamicRoutesCache(options) {
  const cache = new AsyncCache({
    maxAge: options.cacheTime,
    load(_, cb) {
      // Empty keys return undefined
      // Do nothing - cache keys should be set using `cache.set` method
      cb()
    }
  })

  cache.get = promisify(cache.get)
  cache.set = promisify(cache.set)

  return cache
}

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
 * Make sure a route is an object with "url" property
 *
 * @param   {Object | string} route Route Object or Payload Object or String value
 * @returns {Object} A valid route object
 */
function ensureIsValidRoute(route) {
  return typeof route === 'object' ? (route.route ? { url: route.route } : route) : { url: route }
}

/**
 * Get dynamic(request based) routes
 * @param {Object} options
 * @param {AsyncCache.Cache<any>} cache - a cache for dynamic routes
 * @param {Request} req
 * @returns {Array} List of dynamic routes
 */
async function getDynamicRoutes(options, cache, req = null) {
  if (Array.isArray(options.routes) || options.routes.length === 0 || !req) {
    return []
  }

  const routes = await options.routes({ req, cache })
  return routes
}

module.exports = { createRoutesCache, createDynamicRoutesCache, getDynamicRoutes, joinRoutes }
