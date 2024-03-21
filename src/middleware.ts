import { addServerHandler, createResolver } from '@nuxt/kit'
import logger from './runtime/logger'
import { setDefaultSitemapIndexOptions, setDefaultSitemapOptions } from './options'

/**
 * Register a middleware for each sitemap or sitemapindex
 *
 * @param {Object} options
 * @param {Object} globalCache
 * @param {Nuxt}   nuxtInstance
 * @param {number} depth
 */
export function registerSitemaps(options, globalCache, nuxtInstance, depth = 0) {
  /* istanbul ignore if */
  if (depth > 1) {
    // see https://webmasters.stackexchange.com/questions/18243/can-a-sitemap-index-contain-other-sitemap-indexes
    logger.warn("A sitemap index file can't list other sitemap index files, but only sitemap files")
  }

  const isSitemapIndex = options && options.sitemaps && Array.isArray(options.sitemaps) && options.sitemaps.length > 0

  if (isSitemapIndex) {
    registerSitemapIndex(options, globalCache, nuxtInstance, depth)
  } else {
    registerSitemap(options, globalCache, nuxtInstance, depth)
  }
}

/**
 * Register a middleware to serve a sitemap
 *
 * @param {Object} options
 * @param {Object} globalCache
 * @param {Nuxt}   nuxtInstance
 * @param {number} depth
 */
export function registerSitemap(options, globalCache, nuxtInstance, depth = 0) {
  // Init options
  options = setDefaultSitemapOptions(options, nuxtInstance, depth > 0)
  options = prepareOptionPaths(options, nuxtInstance)
  globalCache.options[options.path] = options

  // Allow Nitro to find our files by an alias
  const { resolve } = createResolver(import.meta.url)
  nuxtInstance.options.alias['~sitemap'] = resolve('./')

  if (options.gzip) {
    const _path = options.pathGzip || options.path + '.gz'
    globalCache.options[_path] = options

    // Add server middleware for sitemap.xml.gz
    addServerHandler({
      route: _path,
      handler: resolve('./runtime/sitemap.gzip.mjs'),
    })
  }

  // Add server middleware for sitemap.xml
  addServerHandler({
    route: options.path,
    handler: resolve('./runtime/sitemap.mjs'),
  })
}

/**
 * Register a middleware to serve a sitemapindex
 *
 * @param {Object} options
 * @param {Object} globalCache
 * @param {Nuxt}   nuxtInstance
 * @param {number} depth
 */
export function registerSitemapIndex(options, globalCache, nuxtInstance, depth = 0) {
  // Init options
  options = setDefaultSitemapIndexOptions(options, nuxtInstance)
  options = prepareOptionPaths(options, nuxtInstance)
  globalCache.options[options.path] = options

  // Allow Nitro to find our files by an alias
  const { resolve } = createResolver(import.meta.url)
  nuxtInstance.options.alias['~sitemap'] = resolve('./')

  if (options.gzip) {
    const _path = options.pathGzip || options.path + '.gz'
    // Add server middleware for sitemapindex.xml.gz
    globalCache.options[_path] = options
    addServerHandler({
      route: _path,
      handler: resolve('./runtime/sitemapindex.gzip.mjs'),
    })
  }

  // Add server middleware for sitemapindex.xml
  addServerHandler({
    route: options.path,
    handler: resolve('./runtime/sitemapindex.mjs'),
  })

  // Register linked sitemaps
  options.sitemaps.forEach((sitemapOptions) => registerSitemaps(sitemapOptions, globalCache, nuxtInstance, depth + 1))
}

function prepareOptionPaths(options, nuxtInstance) {
  options.base = nuxtInstance.options.app.baseURL || '/'
  options.path = options.base !== '/' || options.path.startsWith('/') ? options.path : '/' + options.path
  options.pathGzip =
    options.base !== '/' || options.pathGzip.startsWith('/') ? options.pathGzip : '/' + options.pathGzip
  return options
}
