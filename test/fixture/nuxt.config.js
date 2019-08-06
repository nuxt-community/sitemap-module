module.exports = {
  srcDir: __dirname,
  dev: false,
  render: {
    resourceHints: false
  },
  modules: [
    require('../..')
  ],
  sitemap: {
    path: '/sitemap.xml',
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
    xmlNs: 'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    xslUrl: 'sitemap.xsl',
    defaults: {
      changefreq: 'daily',
      priority: 1
    }
  }
}
