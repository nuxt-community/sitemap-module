const unionBy = require('lodash/unionBy')

function promisifyRoute(fn, ...args) {
  // If routes is an array
  if (Array.isArray(fn)) {
    return Promise.resolve(fn)
  }
  // If routes is a function expecting a callback
  if (fn.length === arguments.length) {
    return new Promise((resolve, reject) => {
      fn((err, routeParams) => {
        if (err) {
          reject(err)
        }
        resolve(routeParams)
      }, ...args)
    })
  }
  let promise = fn(...args)
  if (
    !promise ||
    (!(promise instanceof Promise) && typeof promise.then !== 'function')
  ) {
    promise = Promise.resolve(promise)
  }
  return promise
}

// Join static and options-defined routes into single array
function routesUnion(staticRoutes, optionsRoutes) {
  // Make sure any routes passed as strings are converted to objects with url properties
  staticRoutes = staticRoutes.map(ensureRouteIsObject)
  optionsRoutes = optionsRoutes.map(ensureRouteIsObject)

  // add static routes to options routes, discarding any defined in options
  return unionBy(optionsRoutes, staticRoutes, 'url')
}

// Make sure a passed route is an object
function ensureRouteIsObject(route) {
  return typeof route === 'object' ? route : { url: route }
}

// Recursively flatten all routes and their child-routes
function flatRoutes(router, _path = '', routes = []) {
  router.forEach((r) => {
    if ([':', '*'].some(c => r.path.includes(c))) {
      return
    }
    if (r.children) {
      if (_path === '' && r.path === '/') {
        routes.push('/')
      }
      return flatRoutes(r.children, _path + r.path + '/', routes)
    }
    _path = _path.replace(/^\/+$/, '/')
    routes.push(
      (r.path === '' && _path[_path.length - 1] === '/'
        ? _path.slice(0, -1)
        : _path) + r.path
    )
  })
  return routes
}

module.exports = {
  promisifyRoute,
  routesUnion,
  flatRoutes
}
