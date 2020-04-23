/* istanbul ignore file */

const consola = require('consola')

function warn(message, options = null) {
  consola.warn({
    message: `[sitemap-module] ${message}`,
    additional: options ? JSON.stringify(options, null, 2) : null,
  })
}

function fatal(message, options = null) {
  consola.fatal({
    message: `[sitemap-module] ${message}`,
    additional: options ? JSON.stringify(options, null, 2) : null,
  })
}

module.exports = { ...consola, warn, fatal }
