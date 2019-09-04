const path = require('path')

const consola = require('consola')
const fs = require('fs-extra')

const { createSitemap } = require('./builder.js')

/**
 * Generating sitemap
 *
 * @param {Object} options
 * @param {Object} cache
 * @param {Nuxt} nuxtInstance
 */
async function generateSitemap(options, cache, nuxtInstance) {
  consola.info('Generating sitemap')

  // Generate sitemap.xml
  const routes = await cache.sitemap.get('routes')
  const sitemap = await createSitemap(options, routes)
  const xml = await sitemap.toXML()
  const xmlGeneratePath = path.join(nuxtInstance.options.generate.dir, options.path)
  fs.outputFileSync(xmlGeneratePath, xml)
  consola.success('Generated', getPathname(nuxtInstance.options.generate.dir, xmlGeneratePath))

  // Generate sitemap.xml.gz
  if (options.gzip) {
    const gzip = await sitemap.toGzip()
    const gzipGeneratePath = path.join(nuxtInstance.options.generate.dir, options.pathGzip)
    fs.outputFileSync(gzipGeneratePath, gzip)
    consola.success('Generated', getPathname(nuxtInstance.options.generate.dir, gzipGeneratePath))
  }
}

/**
 * Convert a file path to a URL pathname
 *
 * @param {string} dirPath
 * @param {string} filePath
 * @returns {string} URL pathname
 */
function getPathname(dirPath, filePath) {
  return [, ...path.relative(dirPath, filePath).split(path.sep)].join('/')
}

module.exports = { generateSitemap }
