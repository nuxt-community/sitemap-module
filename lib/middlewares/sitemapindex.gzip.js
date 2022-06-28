import { gzipSync } from 'zlib'
import { createRequire } from 'module'
import { validHttpCache } from '~sitemap/middleware.js'
import { excludeRoutes } from '~sitemap/routes.js'
import { createRoutesCache } from '~sitemap/cache.js'
import { createSitemapIndex } from '~sitemap/builder.js'

export const globalCache = { routes: null, staticRoutes: null }

export default (event) => {
  const runtimeConfig = useRuntimeConfig()
  const res = event.res
  const req = event.req

  const require = createRequire(import.meta.url)
  if (!require) {
    console.log('cant use require in middleware')
  }
  // eslint-disable-next-line no-new-func,no-eval
  const options = eval(' (' + runtimeConfig.sitemap.options + ')')[event.url]
  const staticRoutes = runtimeConfig.sitemap.staticRoutes

  // Init cache
  if (!globalCache.staticRoutes) {
    globalCache.staticRoutes = () => excludeRoutes(options.exclude, staticRoutes)
    globalCache.routes = createRoutesCache(globalCache, options)
  }

  // Init sitemap index
  const sitemapIndex = createSitemapIndex(options, options.base, req)
  const gzip = gzipSync(sitemapIndex)
  // Check cache headers
  if (validHttpCache(gzip, options.etag, req, res)) {
    return
  }
  // Send http response
  res.setHeader('Content-Type', 'application/gzip')
  res.end(gzip)
}
