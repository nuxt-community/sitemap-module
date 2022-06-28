import { createRequire } from 'module'
import { validHttpCache } from '~sitemap/middleware.js'
import { createSitemap } from '~sitemap/builder.js'
import { excludeRoutes } from '~sitemap/routes.js'
import { createRoutesCache } from '~sitemap/cache.js'

export const globalCache = { routes: null, staticRoutes: null }

export default async (event) => {
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

  try {
    // Init sitemap
    const routes = await globalCache.routes.get('routes')
    const xml = createSitemap(options, routes, options.base, req).toXML()
    // Check cache headers
    if (validHttpCache(xml, options.etag, req, res)) {
      return
    }
    // Send http response
    res.setHeader('Content-Type', 'application/xml')
    res.end(xml)
  } catch (err) {
    /* istanbul ignore next */
    return err
  }
}
