const { Minimatch } = require('minimatch')

/**
 * Exclude routes by glob patterns
 *
 * @param   {string[]} patterns
 * @param   {string[]} routes
 * @returns {string[]}
 */
function excludeRoutes(patterns, routes) {
  patterns.forEach(pattern => {
    const minimatch = new Minimatch(pattern)
    minimatch.negate = true
    routes = routes.filter(route => minimatch.match(route))
  })
  return routes
}

/**
 * Get static routes from Nuxt router and ignore dynamic routes
 *
 * @param   {Object} router
 * @returns {string[]}
 */
function getStaticRoutes(router) {
  // Get all static routes and ignore dynamic routes
  return flattenRoutes(router).filter(route => !route.includes(':') && !route.includes('*'))
}

/**
 * Recursively flatten all routes and their child-routes
 *
 * @param   {Object}   router
 * @param   {string}   path
 * @param   {string[]} routes
 * @returns {string[]}
 */
function flattenRoutes(router, path = '', routes = []) {
  router.forEach(route => {
    if (route.children) {
      flattenRoutes(route.children, path + route.path + '/', routes)
    }
    if (route.path !== '') {
      routes.push(path + route.path)
    }
  })
  return routes
}

module.exports = { excludeRoutes, getStaticRoutes }
