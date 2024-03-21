import logger from './runtime/logger'

const MODULE_NAME = 'Nuxt 3 Sitemap Module'
const DEFAULT_NUXT_PUBLIC_PATH = '/_nuxt/'

/**
 * Set default options for a sitemap config
 *
 * @param   {Object}  options
 * @param   {Nuxt}    nuxtInstance
 * @param   {boolean} isLinkedToSitemapIndex
 * @returns {Object}
 */
export function setDefaultSitemapOptions(options, nuxtInstance, isLinkedToSitemapIndex = false) {
  const defaults = {
    path: '/sitemap.xml',
    hostname:
      // TODO: remove support of "build.publicPath" on release 3.0
      // nuxt@3.0.0-rc.12 nuxtInstance.options.build.publicPath eq to `{}`
      nuxtInstance.options.app.buildAssetsDir !== DEFAULT_NUXT_PUBLIC_PATH
        ? nuxtInstance.options.app.buildAssetsDir
        : undefined,
    exclude: [],
    routes: nuxtInstance.options.generate.routes || [],
    cacheTime: 1000 * 60 * 15,
    etag: nuxtInstance.options.render?.etag || { weak: true },
    filter: undefined,
    gzip: false,
    xmlNs: undefined,
    xslUrl: undefined,
    trailingSlash: false,
    lastmod: undefined,
    i18n: undefined,
    defaults: {},
    base: '/',
  }

  const sitemapOptions = {
    ...defaults,
    ...options,
  }

  if (sitemapOptions.i18n) {
    // Check modules config
    const modules = nuxtInstance.options._installedModules.map((m) => m.meta?.name)
    /* istanbul ignore if */
    if (!modules.includes('@nuxtjs/i18n')) {
      logger.warn(
        `To enable the "i18n" option, the "${MODULE_NAME}" must be declared after the "nuxt-i18n" module in your config`
      )
    }

    /* istanbul ignore if */
    if (typeof sitemapOptions.i18n === 'string') {
      // TODO: remove support of "string" as shortcut notation on release 3.0
      sitemapOptions.i18n = true
    }

    // Set default i18n options
    sitemapOptions.i18n = {
      locales: [],
      routesNameSeparator: '___',
      ...sitemapOptions.i18n,
    }
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
 * @param   {Nuxt}   nuxtInstance
 * @returns {Object}
 */
export function setDefaultSitemapIndexOptions(options, nuxtInstance) {
  const defaults = {
    path: '/sitemapindex.xml',
    hostname: undefined,
    sitemaps: [],
    lastmod: undefined,
    etag: nuxtInstance.options.render?.etag || { weak: true },
    gzip: false,
    xmlNs: undefined,
    xslUrl: undefined,
    base: '/',
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
