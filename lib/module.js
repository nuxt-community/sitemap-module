const path = require('path')

const fs = require('fs-extra')

const { generateSitemaps } = require('./generator')
const logger = require('./logger')
const { registerSitemaps } = require('./middleware')
const { getStaticRoutes } = require('./routes')

module.exports = async function module(moduleOptions) {
  const nuxtInstance = this

  // Init options
  const options = await initOptions(nuxtInstance, moduleOptions)
  if (options === false) {
    logger.info('Sitemap disabled')
    return
  }

  // Init cache
  // a file "sitemap-routes.json" is written to "dist" dir on "build" mode
  const jsonStaticRoutesPath = !nuxtInstance.options.dev
    ? path.resolve(nuxtInstance.options.buildDir, path.join('dist', 'sitemap-routes.json'))
    : null
  const staticRoutes = fs.readJsonSync(jsonStaticRoutesPath, { throws: false })
  const globalCache = { staticRoutes }

  // Init static routes
  nuxtInstance.extendRoutes((routes) => {
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
    await nuxtInstance.nuxt.callHook('sitemap:generate:before', nuxtInstance, options)
    logger.info('Generating sitemaps')
    await Promise.all(options.map((options) => generateSitemaps(options, globalCache, nuxtInstance)))
    await nuxtInstance.nuxt.callHook('sitemap:generate:done', nuxtInstance)
  })

  // On "ssr" mode, register middlewares for each sitemap or sitemapindex
  options.forEach((options) => {
    registerSitemaps(options, globalCache, nuxtInstance)
  })
}

async function initOptions(nuxtInstance, moduleOptions) {
  if (nuxtInstance.options.sitemap === false || moduleOptions === false) {
    return false
  }

  let options = nuxtInstance.options.sitemap || moduleOptions

  if (typeof options === 'function') {
    options = await options.call(nuxtInstance)
  }

  if (options === false) {
    return false
  }

  return Array.isArray(options) ? options : [options]
}

module.exports.meta = require('../package.json')
