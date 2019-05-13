const { resolve } = require('path')

module.exports = {
  rootDir: resolve(__dirname, '../..'),
  buildDir: resolve(__dirname, '.nuxt'),
  srcDir: __dirname,
  render: {
    resourceHints: false
  },
  modules: [
    { handler: require('../../') }
  ],
  sitemap: {
    hostname: 'http://localhost:3000/',
    exclude: [
      '/exclude'
    ],
    routes: [
      'child/1',
      'child/2'
    ],
    filter: ({ routes }) => routes.filter(route => route.url !== '/filtered'),
    gzip: true,
    xmlNs: 'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    xslUrl: 'sitemap.xsl',
    defaults: {
      changefreq: 'daily',
      priority: 1
    }
  }
}
