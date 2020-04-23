const logger = require('./logger')

const DEFAULT_NUXT_PUBLIC_PATH = '/_nuxt/'

/**
 * Set default options for a sitemap config
 *
 * @param   {Object}  options
 * @param   {Nuxt}    nuxtInstance
 * @param   {boolean} isLinkedToSitemapIndex
 * @returns {Object}
 */
function setDefaultSitemapOptions(options, nuxtInstance, isLinkedToSitemapIndex = false) {
  const defaults = {
    path: '/sitemap.xml',
    hostname:
      nuxtInstance.options.build.publicPath !== DEFAULT_NUXT_PUBLIC_PATH
        ? nuxtInstance.options.build.publicPath
        : undefined,
    exclude: [],
    routes: nuxtInstance.options.generate.routes || [],
    cacheTime: 1000 * 60 * 15,
    etag: nuxtInstance.options.render.etag,
    filter: undefined,
    gzip: false,
    xmlNs: undefined,
    xslUrl: undefined,
    trailingSlash: false,
    lastmod: undefined,
    defaults: {},
  }

  const sitemapOptions = {
    ...defaults,
    ...options,
  }

  /* istanbul ignore if */
  if (sitemapOptions.generate) {
    logger.warn("The `generate` option isn't needed anymore in your config. Please remove it!")
  }

  /* istanbul ignore if */
  if (!sitemapOptions.path) {
    logger.fatal('The `path` option is either empty or missing in your config for a sitemap', options)
  }

  /* istanbul ignore if */
  if (sitemapOptions.lastmod && !isLinkedToSitemapIndex) {
    logger.warn('The `lastmod` option is only available in the config of a sitemap linked to a sitemap index')
  }

  sitemapOptions.pathGzip = sitemapOptions.gzip ? `${sitemapOptions.path}.gz` : sitemapOptions.path

  return sitemapOptions
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
    lastmod: undefined,
    gzip: false,
    xmlNs: undefined,
    xslUrl: undefined,
  }

  const sitemapIndexOptions = {
    ...defaults,
    ...options,
  }

  /* istanbul ignore if */
  if (sitemapIndexOptions.generate) {
    logger.warn("The `generate` option isn't needed anymore in your config. Please remove it!")
  }

  /* istanbul ignore if */
  if (!sitemapIndexOptions.path) {
    logger.fatal('The `path` option is either empty or missing in your config for a sitemap index', options)
  }

  sitemapIndexOptions.sitemaps.forEach((sitemapOptions) => {
    /* istanbul ignore if */
    if (!sitemapOptions.path) {
      logger.fatal('The `path` option is either empty or missing in your config for a sitemap', sitemapOptions)
    }

    // set cascading hostname
    sitemapOptions.hostname = sitemapOptions.hostname || sitemapIndexOptions.hostname
  })

  sitemapIndexOptions.pathGzip = sitemapIndexOptions.gzip ? `${sitemapIndexOptions.path}.gz` : sitemapIndexOptions.path

  return sitemapIndexOptions
}

module.exports = { setDefaultSitemapOptions, setDefaultSitemapIndexOptions }
