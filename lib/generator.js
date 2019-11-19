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
 */
async function generateSitemaps(options, globalCache, nuxtInstance) {
  const isSitemapIndex = options && options.sitemaps && Array.isArray(options.sitemaps) && options.sitemaps.length > 0

  if (isSitemapIndex) {
    await generateSitemapIndex(options, globalCache, nuxtInstance)
  } else {
    await generateSitemap(options, globalCache, nuxtInstance)
  }
}

/**
 * Generate a sitemap file
 *
 * @param {Object} options
 * @param {Object} globalCache
 * @param {Nuxt}   nuxtInstance
 */
async function generateSitemap(options, globalCache, nuxtInstance) {
  // Init options
  options = setDefaultSitemapOptions(options, nuxtInstance)

  // Init cache
  const cache = {}
  cache.staticRoutes = () => excludeRoutes(options.exclude, globalCache.staticRoutes)
  cache.routes = createRoutesCache(cache, options)

  // Generate sitemap.xml
  const routes = await cache.routes.get('routes')
  const base = nuxtInstance.options.router.base
  const sitemaps = await createSitemap(options, routes, base)
  const isAutoSplit = sitemaps.length > 1
  const splitSitemaps = []

  sitemaps.forEach((sitemap, index) => {
    let pathIndexed
    let pathGzipIndexed

    if (isAutoSplit) {
      // Configure a split sitemap with an incrementally indexed filename
      pathIndexed = options.path.replace('.xml', `-${index + 1}.xml`)
      pathGzipIndexed = options.pathGzip.replace('.xml.gz', `-${index + 1}.xml.gz`)
      splitSitemaps.push({
        path: pathIndexed,
        gzip: options.gzip
      })
    }

    // Generate sitemap.xml
    const xmlFilePath = path.join(nuxtInstance.options.generate.dir, pathIndexed || options.path)
    fs.outputFileSync(xmlFilePath, sitemap.toXML())
    logger.success('Generated', getPathname(nuxtInstance.options.generate.dir, xmlFilePath))

    // Generate sitemap.xml.gz
    if (options.gzip) {
      const gzipFilePath = path.join(nuxtInstance.options.generate.dir, pathGzipIndexed || options.pathGzip)
      fs.outputFileSync(gzipFilePath, sitemap.toGzip())
      logger.success('Generated', getPathname(nuxtInstance.options.generate.dir, gzipFilePath))
    }
  })

  if (isAutoSplit) {
    // Create sitemap index only if auto-split is detected
    generateSitemapIndex(
      {
        path: options.path,
        hostname: options.hostname,
        gzip: options.gzip,
        sitemaps: splitSitemaps
      },
      globalCache,
      nuxtInstance,
      false
    )
  }
}

/**
 * Generate a sitemapindex file
 *
 * @param {Object}  options
 * @param {Object}  globalCache
 * @param {Nuxt}    nuxtInstance
 * @param {boolean} cascading
 */
async function generateSitemapIndex(options, globalCache, nuxtInstance, cascading = true) {
  // Init options
  options = setDefaultSitemapIndexOptions(options)

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

  if (cascading) {
    // Generate linked sitemaps
    await Promise.all(
      options.sitemaps.map(sitemapOptions => generateSitemaps(sitemapOptions, globalCache, nuxtInstance))
    )
  }
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
