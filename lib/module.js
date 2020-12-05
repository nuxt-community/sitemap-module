const path = require('path')

const fs = require('fs-extra')

const { generateSitemaps } = require('./generator')
const logger = require('./logger')
const { registerSitemaps } = require('./middleware')
const { getRoutes } = require('./routes')

module.exports = async function module(moduleOptions) {
  const nuxtInstance = this

  // Init options
  const options = await initOptions(nuxtInstance, moduleOptions)
  if (options === false) {
    logger.info('Sitemap disabled')
    return
  }

  // Init cache
  // On "build" mode, a "sitemap-routes.json" file is written to "dist" dir in order to init cache on "start" mode
  const jsonStaticRoutesPath = !nuxtInstance.options.dev
    ? path.resolve(nuxtInstance.options.buildDir, path.join('dist', 'sitemap-routes.json'))
    : null
  const globalCache = {
    staticRoutes: fs.readJsonSync(jsonStaticRoutesPath, { throws: false }),
    crawledRoutes: null,
  }

  // Init static routes
  nuxtInstance.extendRoutes((routes) => {
    // Set cache for static routes
    const { staticRoutes } = getRoutes(routes)
    globalCache.staticRoutes = staticRoutes

    // On run cmd "build"
    if (!nuxtInstance.options.dev) {
      // Save static routes
      fs.outputJsonSync(jsonStaticRoutesPath, globalCache.staticRoutes)
    }
  })

  // On "generate" mode, generate static files for each sitemap or sitemapindex
  nuxtInstance.nuxt.hook('generate:done', async ({ generatedRoutes }) => {
    await nuxtInstance.nuxt.callHook('sitemap:generate:before', nuxtInstance, options)
    logger.info('Generating sitemaps')
    // On "generate.crawler" option enabled
    if (nuxtInstance.options.generate.crawler) {
      // Extract crawled routes from generated routes
      const staticURLs = globalCache.staticRoutes.map(({ url }) => url)
      const crawledURLs = Array.from(generatedRoutes).filter((route) => !staticURLs.includes(route))
      // Set cache for crawled routes
      globalCache.crawledRoutes = crawledURLs.map((url) => ({ url }))
    }
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
