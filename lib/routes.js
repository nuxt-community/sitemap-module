const { Minimatch } = require('minimatch')

/**
 * Exclude routes by matching glob patterns on url
 *
 * @param   {string[]} patterns
 * @param   {Array}    routes
 * @returns {Array}
 */
function excludeRoutes(patterns, routes) {
  patterns.forEach((pattern) => {
    const minimatch = new Minimatch(pattern)
    minimatch.negate = true
    routes = routes.filter(({ url }) => minimatch.match(url))
  })
  return routes
}

/**
 * Get all routes from Nuxt router
 *
 * @param   {Object} router
 * @returns {Object}
 */
function getRoutes(router) {
  const flattenedRoutes = flattenRoutes(router)
  // dissociate static and dynamic routes
  const routes = {
    staticRoutes: [],
    dynamicRoutes: [],
  }
  flattenedRoutes.forEach((route) => {
    const isStatic = ![':', '*'].some((c) => route.url.includes(c))
    if (isStatic) {
      routes.staticRoutes.push(route)
    } else {
      routes.dynamicRoutes.push(route)
    }
  })
  return routes
}

/**
 * Recursively flatten all routes and their nested routes
 *
 * @param   {Object} router
 * @param   {string} path
 * @param   {Array}  routes
 * @returns {Array}
 */
function flattenRoutes(router, path = '', routes = []) {
  router.forEach((route) => {
    // Nested routes
    if (route.children) {
      return flattenRoutes(route.children, path + route.path + '/', routes)
    }
    // Normalize url (without trailing slash)
    route.url = path.length && !route.path.length ? path.slice(0, -1) : path + route.path
    routes.push(route)
  })
  return routes
}

module.exports = { excludeRoutes, getRoutes }
