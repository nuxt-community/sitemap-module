import { promisify } from 'util'
import AsyncCache from 'async-cache'
import unionBy from 'lodash.unionby'
import generateETag from 'etag'
import fresh from 'fresh'

/**
 * Initialize a cache instance for sitemap routes
 *
 * @param   {Object} globalCache
 * @param   {Object} options
 * @returns {AsyncCache.Cache<any>} Cache instance
 */
export function createRoutesCache(globalCache, options) {
  const cache = new AsyncCache({
    maxAge: options.cacheTime,
    async load(_, callback) {
      try {
        let routes = await Promise.all(await promisifyRoute(options.routes))
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
 * @param {Array} fn Function that fetch dynamic routes
 * @returns {Promise.<Array>} Promise that return a list of routes
 */
function promisifyRoute(fn) {
  // If routes is an array
  if (Array.isArray(fn)) {
    return Promise.resolve(
      fn.map(async (r) => {
        if (typeof r === 'function') {
          return await promisifyRoute(r)
        }
        return r
      })
    )
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
  let _route = typeof route === 'object' ? { ...route } : route
  _route = typeof _route === 'object' ? (_route.route ? { url: _route.route } : _route) : { url: _route }
  // force as string
  _route.url = String(_route.url)
  return _route
}

/**
 * Validate the freshness of HTTP cache using headers
 *
 * @param {Object} entity
 * @param {Object} options
 * @param {Request} req
 * @param {Response} res
 * @returns {boolean}
 */
export function validHttpCache(entity, options, req, res) {
  if (!options) {
    return false
  }
  const { hash } = options
  const etag = hash ? hash(entity, options) : generateETag(entity, options)
  if (fresh(req.headers, { etag })) {
    // Resource not modified
    res.statusCode = 304
    res.end()
    return true
  }
  // Add ETag header
  res.setHeader('ETag', etag)
  return false
}
