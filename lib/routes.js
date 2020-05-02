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
 * Get static routes from Nuxt router and ignore dynamic routes
 *
 * @param   {Object} router
 * @returns {Array}
 */
function getStaticRoutes(router) {
  return flattenStaticRoutes(router)
}

/**
 * Recursively flatten all static routes and their nested routes
 *
 * @param   {Object} router
 * @param   {string} path
 * @param   {Array}  routes
 * @returns {Array}
 */
function flattenStaticRoutes(router, path = '', routes = []) {
  router.forEach((route) => {
    // Skip dynamic routes
    if ([':', '*'].some((c) => route.path.includes(c))) {
      return
    }
    // Nested routes
    if (route.children) {
      return flattenStaticRoutes(route.children, path + route.path + '/', routes)
    }
    // Normalize url (without trailing slash)
    route.url = path.length && !route.path.length ? path.slice(0, -1) : path + route.path

    routes.push(route)
  })
  return routes
}

module.exports = { excludeRoutes, getStaticRoutes }
