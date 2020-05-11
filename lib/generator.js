const path = require('path')
const { gzipSync } = require('zlib')

const fs = require('fs-extra')

const { createSitemap, createSitemapIndex } = require('./builder')
const { createRoutesCache } = require('./cache')
const logger = require('./logger')
const { setDefaultSitemapOptions, setDefaultSitemapIndexOptions } = require('./options')
const { excludeRoutes } = require('./routes')

/**
 * Generate a static file for each sitemap or sitemapindex
 *
 * @param {Object} options
 * @param {Object} globalCache
 * @param {Nuxt}   nuxtInstance
 * @param {number} depth
 */
async function generateSitemaps(options, globalCache, nuxtInstance, depth = 0) {
  /* istanbul ignore if */
  if (depth > 1) {
    // see https://webmasters.stackexchange.com/questions/18243/can-a-sitemap-index-contain-other-sitemap-indexes
    logger.warn("A sitemap index file can't list other sitemap index files, but only sitemap files")
  }

  const isSitemapIndex = options && options.sitemaps && Array.isArray(options.sitemaps) && options.sitemaps.length > 0

  if (isSitemapIndex) {
    await generateSitemapIndex(options, globalCache, nuxtInstance, depth)
  } else {
    await generateSitemap(options, globalCache, nuxtInstance, depth)
  }
}

/**
 * Generate a sitemap file
 *
 * @param {Object} options
 * @param {Object} globalCache
 * @param {Nuxt}   nuxtInstance
 * @param {number} depth
 */
async function generateSitemap(options, globalCache, nuxtInstance, depth = 0) {
  // Init options
  options = setDefaultSitemapOptions(options, nuxtInstance, depth > 0)

  // Init cache
  const cache = {}
  cache.staticRoutes = () => excludeRoutes(options.exclude, globalCache.staticRoutes)
  cache.routes = createRoutesCache(cache, options)

  // Generate sitemap.xml
  const routes = await cache.routes.get('routes')
  const base = nuxtInstance.options.router.base
  const sitemap = await createSitemap(options, routes, base)
  const xmlFilePath = path.join(nuxtInstance.options.generate.dir, options.path)
  fs.outputFileSync(xmlFilePath, sitemap.toXML())
  logger.success('Generated', getPathname(nuxtInstance.options.generate.dir, xmlFilePath))

  // Generate sitemap.xml.gz
  if (options.gzip) {
    const gzipFilePath = path.join(nuxtInstance.options.generate.dir, options.pathGzip)
    fs.outputFileSync(gzipFilePath, sitemap.toGzip())
    logger.success('Generated', getPathname(nuxtInstance.options.generate.dir, gzipFilePath))
  }
}

/**
 * Generate a sitemapindex file
 *
 * @param {Object} options
 * @param {Object} globalCache
 * @param {Nuxt}   nuxtInstance
 * @param {number} depth
 */
async function generateSitemapIndex(options, globalCache, nuxtInstance, depth = 0) {
  // Init options
  options = setDefaultSitemapIndexOptions(options, nuxtInstance)

  // Generate sitemapindex.xml
  const base = nuxtInstance.options.router.base
  const xml = createSitemapIndex(options, base)
  const xmlFilePath = path.join(nuxtInstance.options.generate.dir, options.path)
  fs.outputFileSync(xmlFilePath, xml)
  logger.success('Generated', getPathname(nuxtInstance.options.generate.dir, xmlFilePath))

  // Generate sitemapindex.xml.gz
  if (options.gzip) {
    const gzip = gzipSync(xml)
    const gzipFilePath = path.join(nuxtInstance.options.generate.dir, options.pathGzip)
    fs.outputFileSync(gzipFilePath, gzip)
    logger.success('Generated', getPathname(nuxtInstance.options.generate.dir, gzipFilePath))
  }

  // Generate linked sitemaps
  await Promise.all(
    options.sitemaps.map((sitemapOptions) => generateSitemaps(sitemapOptions, globalCache, nuxtInstance, depth + 1))
  )
}

/**
 * Convert a file path to a URL pathname
 *
 * @param   {string} dirPath
 * @param   {string} filePath
 * @returns {string}
 */
function getPathname(dirPath, filePath) {
  return [, ...path.relative(dirPath, filePath).split(path.sep)].join('/')
}

module.exports = { generateSitemaps, generateSitemap, generateSitemapIndex }
