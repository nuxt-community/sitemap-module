const path = require('path')
const { gzipSync } = require('zlib')

const consola = require('consola')
const fs = require('fs-extra')

const { createSitemap, createSitemapIndex } = require('./builder.js')
const { createRoutesCache } = require('./cache.js')
const { setDefaultSitemapOptions, setDefaultSitemapIndexOptions } = require('./options.js')
const { excludeRoutes } = require('./routes.js')

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
  consola.info('Generating sitemap')

  // Init options
  options = setDefaultSitemapOptions(options, nuxtInstance)

  // Init cache
  const cache = {}
  cache.staticRoutes = () => excludeRoutes(options.exclude, globalCache.staticRoutes)
  cache.routes = createRoutesCache(cache, options)

  // Generate sitemap.xml
  const routes = await cache.routes.get('routes')
  const sitemap = await createSitemap(options, routes)
  const xml = await sitemap.toXML()
  const xmlFilePath = path.join(nuxtInstance.options.generate.dir, options.path)
  fs.outputFileSync(xmlFilePath, xml)
  consola.success('Generated', getPathname(nuxtInstance.options.generate.dir, xmlFilePath))

  // Generate sitemap.xml.gz
  if (options.gzip) {
    const gzip = await sitemap.toGzip()
    const gzipFilePath = path.join(nuxtInstance.options.generate.dir, options.pathGzip)
    fs.outputFileSync(gzipFilePath, gzip)
    consola.success('Generated', getPathname(nuxtInstance.options.generate.dir, gzipFilePath))
  }
}

/**
 * Generate a sitemapindex file
 *
 * @param {Object} options
 * @param {Object} globalCache
 * @param {Nuxt}   nuxtInstance
 */
async function generateSitemapIndex(options, globalCache, nuxtInstance) {
  consola.info('Generating sitemapindex')

  // Init options
  options = setDefaultSitemapIndexOptions(options)

  // Generate sitemapindex.xml
  const xml = createSitemapIndex(options)
  const xmlFilePath = path.join(nuxtInstance.options.generate.dir, options.path)
  fs.outputFileSync(xmlFilePath, xml)
  consola.success('Generated', getPathname(nuxtInstance.options.generate.dir, xmlFilePath))

  // Generate sitemapindex.xml.gz
  if (options.gzip) {
    const gzip = gzipSync(xml)
    const gzipFilePath = path.join(nuxtInstance.options.generate.dir, options.pathGzip)
    fs.outputFileSync(gzipFilePath, gzip)
    consola.success('Generated', getPathname(nuxtInstance.options.generate.dir, gzipFilePath))
  }

  // Generate linked sitemaps
  await Promise.all(options.sitemaps.map(sitemapOptions => generateSitemaps(sitemapOptions, globalCache, nuxtInstance)))
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
