const { resolve } = require('path')

module.exports = {
  rootDir: resolve(__dirname, '../..'),
  srcDir: __dirname,
  dev: false,
  render: {
    resourceHints: false
  },
  modules: ['@@'],
  sitemap: {
    exclude: [
      '/exclude'
    ],
    gzip: true,
    hostname: 'http://localhost:3000/',
    routes: [
      '1/',
      'child/1'
    ],
    filter: ({ routes }) =>
      routes.filter(route => route.url !== '/filtered'),
    xslUrl: 'sitemap.xsl',
    defaults: {
      changefreq: 'daily',
      priority: 1
    }
  }
}
