/* istanbul ignore file */

import consola from 'consola'

export function warn(message, options = null) {
  consola.warn({
    message: `[sitemap-module] ${message}`,
    additional: options ? JSON.stringify(options, null, 2) : null,
  })
}

export function fatal(message, options = null) {
  consola.fatal({
    message: `[sitemap-module] ${message}`,
    additional: options ? JSON.stringify(options, null, 2) : null,
  })
}

export default { ...consola, fatal, warn }
