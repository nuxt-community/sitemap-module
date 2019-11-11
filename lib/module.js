const path = require('path')

const fs = require('fs-extra')

const { generateSitemaps } = require('./generator')
const logger = require('./logger')
const { registerSitemaps } = require('./middleware')
const { getStaticRoutes } = require('./routes')

module.exports = function module(moduleOptions) {
  const nuxtInstance = this

  // Init options
  let options = nuxtInstance.options.sitemap || moduleOptions
  options = Array.isArray(options) ? options : [options]

  // Init cache
  // a file "sitemap-routes.json" is written to "dist" dir on "build" mode
  const jsonStaticRoutesPath = !nuxtInstance.options.dev
    ? path.resolve(nuxtInstance.options.buildDir, path.join('dist', 'sitemap-routes.json'))
    : null
  const staticRoutes = fs.readJsonSync(jsonStaticRoutesPath, { throws: false })
  const globalCache = { staticRoutes }

  // Init static routes
  nuxtInstance.extendRoutes(routes => {
    // Create a cache for static routes
    globalCache.staticRoutes = getStaticRoutes(routes)

    // On run cmd "build"
    if (!nuxtInstance.options.dev) {
      // Save static routes
      fs.outputJsonSync(jsonStaticRoutesPath, globalCache.staticRoutes)
    }
  })

  // On "generate" mode, generate static files for each sitemap or sitemapindex
  nuxtInstance.nuxt.hook('generate:done', async () => {
    logger.info('Generating sitemaps')
    await Promise.all(options.map(options => generateSitemaps(options, globalCache, nuxtInstance)))
  })

  // On "universal" mode, register middlewares for each sitemap or sitemapindex
  options.forEach(options => {
    registerSitemaps(options, globalCache, nuxtInstance)
  })
}

module.exports.meta = require('../package.json')
