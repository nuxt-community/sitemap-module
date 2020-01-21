module.exports = {
  srcDir: __dirname,
  render: {
    resourceHints: false
  },
  modules: [require('../..')],
  sitemap: [
    {
      path: '/sitemap.xml',
      exclude: ['/exclude'],
      gzip: true,
      hostname: 'http://localhost:3000/',
      routes: ['1/', 'child/1', { url: 'test' }],
      filter: ({ routes }) => routes.filter(route => route.url !== '/filtered/'),
      xmlNs: 'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
      trailingSlash: true,
      defaults: {
        changefreq: 'daily',
        priority: 1
      }
    },
    {
      hostname: 'https://example.com/',
      lastmod: new Date().toISOString(),
      sitemaps: [
        {
          path: '/sitemap-foo.xml',
          routes: ['foo/1', 'foo/2']
        },
        {
          hostname: 'https://yolo.com/',
          path: '/sitemap-bar.xml',
          routes: ['bar/1', 'bar/2']
        }
      ]
    }
  ]
}
