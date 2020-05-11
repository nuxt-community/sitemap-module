const fs = require('fs')
const { Minimatch } = require('minimatch')

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
  const nuxtInstance = this

  // Get all static routes and ignore dynamic routes
  return flattenRoutes(router)
    .filter(({ url }) => !url.includes(':') && !url.includes('*'))
    .filter(nuxtInstance.options.sitemap_filter === true ? _filter(nuxtInstance.options.alias) : route => route)
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

function _filter(aliases) {
  const prop = 'sitemap'
  const value = true
  const aliasesKeys = Object.keys(aliases || {}).join('|')
  const reAliasReplacer = aliasesKeys && new RegExp(`^(${aliasesKeys})(.)`, 'g')
  const aliasReplacer = (_s, alias, char) => aliases[alias] + ((char !== '/' && char !== '\\' && '/') || '') + char
  const normalizeComponentPath = pathName =>
    (reAliasReplacer && pathName && pathName.replace(reAliasReplacer, aliasReplacer)) || pathName

  const extractComponentData = (text, ...exp) => {
    return exp
      .filter(re => re)
      .reduce((out, re) => {
        if (out) {
          out = out.match(re)
          return (out && out[1]) || void 0
        }
      }, text)
  }

  const re0 = /\.vue$/
  const re1 = /<script[^>]*>([\s\S]*?)<\/script>/
  const re2 = /export\s+default\s+({[\s\S]*?})[^}{]*$/
  const re3 = new RegExp(prop + '\\s*:\\s*([^,\\s}]+)')

  const filterByComponentConfig = component => {
    if (component) {
      if (typeof component === 'string') {
        const componentPath = normalizeComponentPath(component)

        if (componentPath) {
          try {
            return (
              extractComponentData(fs.readFileSync(componentPath, 'utf8'), re0.test(componentPath) && re1, re2, re3) ===
              value + ''
            )
          } catch (e) {}
        }
      } else if (typeof component === 'object') {
        return (component.default || component)[prop] === value
      }
    }
    return false
  }

  return ({ component }) => filterByComponentConfig(component)
}

module.exports = { excludeRoutes, getStaticRoutes }
