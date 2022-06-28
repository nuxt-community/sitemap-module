import path from 'path'
import * as fs from 'fs-extra'
import { defineNuxtModule } from '@nuxt/kit'
import { transformSync } from '@babel/core'
import { generateSitemaps } from './generator.js'
import logger from './logger.js'
import { registerSitemaps } from './middleware.js'
import { getStaticRoutes } from './routes.js'

export default defineNuxtModule({
  async setup(moduleOptions, nuxtInstance) {
    // Init options
    const options = await initOptions(nuxtInstance, moduleOptions)
    if (options === false) {
      logger.info('Sitemap disabled')
      return
    }

    // Init cache
    // a file "sitemap-routes.json" is written to "dist" dir on "build" mode
    const jsonStaticRoutesPath = !nuxtInstance.options.dev
      ? path.resolve(nuxtInstance.options.buildDir, path.join('dist', 'sitemap-routes.json'))
      : null
    const staticRoutes = fs.readJsonSync(jsonStaticRoutesPath, { throws: false })
    const globalCache = { staticRoutes, options: {} }

    // Init static routes
    nuxtInstance.hook('pages:extend', (routes) => {
      // Create a cache for static routes
      globalCache.staticRoutes = getStaticRoutes(routes)
      // On run cmd "build"
      if (!nuxtInstance.options.dev) {
        // Save static routes
        fs.outputJsonSync(jsonStaticRoutesPath, globalCache.staticRoutes)
      }
    })

    nuxtInstance.hook('nitro:build:before', async (nitro) => {
      nitro.options.runtimeConfig.sitemap = {
        options: await optionsToString(globalCache.options),
        staticRoutes: globalCache.staticRoutes,
      }

      // On "generate" mode, generate static files for each sitemap or sitemapindex
      // ToDo: move to generate:done hook when available
      nitro.hooks.hook('prerender:route', async () => {
        if (nuxtInstance.options._generate) {
          await nuxtInstance.callHook('sitemap:generate:before', nuxtInstance, options)
          logger.info('Generating sitemaps')
          await Promise.all(options.map((options) => generateSitemaps(options, globalCache, nuxtInstance)))
          await nuxtInstance.callHook('sitemap:generate:done', nuxtInstance)
        }
      })
    })

    // On "ssr" mode, register middlewares for each sitemap or sitemapindex
    options.forEach((options) => {
      registerSitemaps(options, globalCache, nuxtInstance)
    })
  },
})

async function optionsToString(options) {
  let string = ''

  if (Array.isArray(options)) {
    string += `[${await Promise.all(options.map((o) => optionsToString(o)))}]`
    return string
  }

  if (typeof options === 'object') {
    string += '{'

    for (const [key, value] of Object.entries(options)) {
      if (string.length > 1) {
        string += ', '
      }

      if (Array.isArray(value)) {
        string += `"${key}": [${await Promise.all(value.map((o) => optionsToString(o)))}]`
        continue
      }

      string += `"${key}": ${await optionsToString(value)}`
    }

    string += '}'
    return string
  }

  if (typeof options === 'function') {
    const code = transformSync(options, {
      minified: true,
    })
    return code.code.slice(0, -1)
  }

  if (['function', 'boolean', 'number'].includes(typeof options)) {
    return options.toString()
  }

  if (options === undefined) {
    return 'null'
  }

  return `'${options.toString()}'`
}

async function initOptions(nuxtInstance, moduleOptions) {
  if (nuxtInstance.options.sitemap === false || moduleOptions === false) {
    return false
  }

  let options = nuxtInstance.options.sitemap || moduleOptions

  if (typeof options === 'function') {
    options = await options.call(nuxtInstance)
  }

  if (options === false) {
    return false
  }

  return Array.isArray(options) ? options : [options]
}
