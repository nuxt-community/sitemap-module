const path = require('path')

const consola = require('consola')
const fs = require('fs-extra')
const { Minimatch } = require('minimatch')

const { createCache } = require('./cache.js')
const { generateSitemap } = require('./generator.js')
const { registerSitemap } = require('./middleware.js')
const { getStaticRoutes } = require('./routes.js')

const defaultPublicPath = '/_nuxt/'

module.exports = function module(moduleOptions) {
  const defaults = {
    path: '/sitemap.xml',
    hostname: this.options.build.publicPath !== defaultPublicPath ? this.options.build.publicPath : undefined,
    exclude: [],
    routes: this.options.generate.routes || [],
    cacheTime: 1000 * 60 * 15,
    filter: undefined,
    gzip: false,
    xmlNs: undefined,
    xslUrl: undefined,
    trailingSlash: false,
    defaults: {}
  }

  const options = {
    ...defaults,
    ...this.options.sitemap,
    ...moduleOptions
  }

  options.pathGzip = options.gzip ? `${options.path}.gz` : options.path

  // sitemap-routes.json is written to dist dir on "build" mode
  const jsonStaticRoutesPath = !this.options.dev
    ? path.resolve(this.options.buildDir, path.join('dist', 'sitemap-routes.json'))
    : null

  const staticRoutes = fs.readJsonSync(jsonStaticRoutesPath, { throws: false })
  const cache = {}

  // On run cmd "start" or "generate [--no-build]"
  if (staticRoutes) {
    // Create a cache for routes
    cache.sitemap = createCache(staticRoutes, options)

    // On server ready, hydrate cache
    this.nuxt.hook('listen', () => {
      cache.sitemap.get('routes')
    })
  }

  // On extend routes
  this.extendRoutes(routes => {
    let staticRoutes = getStaticRoutes(routes)

    // Exclude routes
    options.exclude.forEach(pattern => {
      const minimatch = new Minimatch(pattern)
      minimatch.negate = true
      staticRoutes = staticRoutes.filter(route => minimatch.match(route))
    })

    // Create a cache for routes
    cache.sitemap = createCache(staticRoutes, options)

    if (!this.options.dev) {
      // Save static routes
      fs.outputJsonSync(jsonStaticRoutesPath, staticRoutes)
    }
  })

  /* istanbul ignore if */
  if (options.generate) {
    consola.warn("The option `sitemap.generate` isn't needed anymore")
  }

  // On "generate" mode, generate a sitemap file in dist dir
  this.nuxt.hook('generate:done', async () => {
    await generateSitemap(options, cache, this)
  })

  // On "universal" mode, register a middleware for each sitemap path
  registerSitemap(options, cache, this)
}

module.exports.meta = require('../package.json')
