const { resolve } = require('path')

module.exports = {
  rootDir: resolve(__dirname, '../..'),
  srcDir: __dirname,
  dev: false,
  render: {
    resourceHints: false
  },
  modules: ['@@'],
  sitemap: [
    {
      path: '/sitemap.xml',
      hostname: 'http://localhost:3000/',
      generate: true,
      gzip: true,
      routes: [
        '/page/1',
        '/page/2'
      ]
    },
    {
      path: '/second-sitemap.xml',
      hostname: 'http://localhost:3000/',
      generate: true,
      gzip: true,
      routes: [
        '/page/3',
        '/page/4'
      ]
    }
  ]
}
