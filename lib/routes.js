const { Minimatch } = require('minimatch')
const extractComponentOptions = require('./extractComponentOptions')
const { COMPONENT_OPTIONS_BLOCK, COMPONENT_OPTIONS_KEY } = require('./constants')
/**
 * Exclude routes by glob patterns
 *
 * @param   {string[]} patterns
 * @param   {string[]} routes
 * @returns {string[]}
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
 * @returns {string[]}
 */
function getStaticRoutes(router) {
  // Get all static routes and ignore dynamic routes
  return flattenRoutes(router).filter(({ url }) => !url.includes(':') && !url.includes('*')).filter(route => extractComponentOptions(route.component, COMPONENT_OPTIONS_BLOCK, COMPONENT_OPTIONS_KEY) !== false)
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
  router.forEach((route) => {
    if (route.children) {
      flattenRoutes(route.children, path + route.path + '/', routes)
    }
    if (route.path !== '') {
      routes.push({
        ...route,
        url: path + route.path,
      })
    }
  })
  return routes
}

module.exports = { excludeRoutes, getStaticRoutes }
