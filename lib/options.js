const consola = require('consola')

const DEFAULT_NUXT_PUBLIC_PATH = '/_nuxt/'

/**
 * Set default options for a sitemap config
 *
 * @param   {Object} options
 * @param   {Nuxt}   nuxtInstance
 * @returns {Object}
 */
function setDefaultSitemapOptions(options, nuxtInstance) {
  const defaults = {
    path: '/sitemap.xml',
    hostname:
      nuxtInstance.options.build.publicPath !== DEFAULT_NUXT_PUBLIC_PATH
        ? nuxtInstance.options.build.publicPath
        : undefined,
    exclude: [],
    routes: nuxtInstance.options.generate.routes || [],
    cacheTime: 1000 * 60 * 15,
    filter: undefined,
    gzip: false,
    xmlNs: undefined,
    xslUrl: undefined,
    trailingSlash: false,
    defaults: {}
  }

  options = {
    ...defaults,
    ...options
  }

  /* istanbul ignore if */
  if (options.generate) {
    consola.warn('The "generate" option isn\'t needed anymore')
  }

  /* istanbul ignore if */
  if (!options.path) {
    consola.warn('The "path" option is either empty or missing for a sitemap')
  }

  options.pathGzip = options.gzip ? `${options.path}.gz` : options.path

  return options
}

/**
 * Set default options for a sitemapindex config
 *
 * @param   {Object} options
 * @returns {Object}
 */
function setDefaultSitemapIndexOptions(options) {
  const defaults = {
    path: '/sitemapindex.xml',
    hostname: undefined,
    sitemaps: [],
    gzip: false,
    xmlNs: undefined,
    xslUrl: undefined
  }

  options = {
    ...defaults,
    ...options
  }

  /* istanbul ignore if */
  if (options.generate) {
    consola.warn("The option `generate` isn't needed anymore")
  }

  /* istanbul ignore if */
  if (!options.path) {
    consola.warn('The "path" option is either empty or missing for a sitemap index')
  }

  // set cascading hostname
  options.sitemaps.forEach(sitemapOptions => {
    sitemapOptions.hostname = sitemapOptions.hostname || options.hostname
  })

  options.pathGzip = options.gzip ? `${options.path}.gz` : options.path

  return options
}

module.exports = { setDefaultSitemapOptions, setDefaultSitemapIndexOptions }
