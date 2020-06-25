# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [2.4.0](https://github.com/nuxt-community/sitemap-module/compare/v2.3.2...v2.4.0) (2020-06-25)


### Features

* add hooks on sitemap generation ([f0365d2](https://github.com/nuxt-community/sitemap-module/commit/f0365d233d9881b613d346dfed6aef951139385d))


### Bug Fixes

* generate an <url> for each i18n language available ([b6d79c8](https://github.com/nuxt-community/sitemap-module/commit/b6d79c890a1be0cf9919fe7b1042e8b90e19ac6f)), closes [#140](https://github.com/nuxt-community/sitemap-module/issues/140)

### [2.3.2](https://github.com/nuxt-community/sitemap-module/compare/v2.3.1...v2.3.2) (2020-06-15)


### Bug Fixes

* i18n rel-alternate-hreflang with router.base ([9a31b31](https://github.com/nuxt-community/sitemap-module/commit/9a31b31b37a281353497161f3edb55e4a6bbe588)), closes [#138](https://github.com/nuxt-community/sitemap-module/issues/138)

### [2.3.1](https://github.com/nuxt-community/sitemap-module/compare/v2.3.0...v2.3.1) (2020-06-04)


### Bug Fixes

* set hreflang with iso value like nuxt-i18n ([959fa82](https://github.com/nuxt-community/sitemap-module/commit/959fa82efe86cbba0bda737fe666592bf25f4533)), closes [#131](https://github.com/nuxt-community/sitemap-module/issues/131)

## [2.3.0](https://github.com/nuxt-community/sitemap-module/compare/v2.2.1...v2.3.0) (2020-05-11)


### Features

* add nuxt-i18n routes support with alternate links by hreflang ([cdbd689](https://github.com/nuxt-community/sitemap-module/commit/cdbd689fc2b5d74407119a99e7703f21baf03cc7)), closes [#91](https://github.com/nuxt-community/sitemap-module/issues/91)
* allow module configuration as function or boolean ([522288c](https://github.com/nuxt-community/sitemap-module/commit/522288c155b67edc9a46afb01823eed9f7fdabd8)), closes [#115](https://github.com/nuxt-community/sitemap-module/issues/115)
* enable ETag header for sitemapindex ([2098334](https://github.com/nuxt-community/sitemap-module/commit/2098334b69692eb7d3c01fd4f2533684603ce40d))

### [2.2.1](https://github.com/nuxt-community/sitemap-module/compare/v2.2.0...v2.2.1) (2020-04-23)


### Bug Fixes

* lastmod on sitemapindex ([56d586b](https://github.com/nuxt-community/sitemap-module/commit/56d586b2ecaac977aca44103377d5c73f2f2dbc0)), closes [#112](https://github.com/nuxt-community/sitemap-module/issues/112)
* logs without additional ([9b4773c](https://github.com/nuxt-community/sitemap-module/commit/9b4773c7766422029593905853f4ddbd7ef17220))
* missing warning on generate mode ([d82ee3e](https://github.com/nuxt-community/sitemap-module/commit/d82ee3ea7b2ebcb8203a964b67f57d41f3a2c797))

## [2.2.0](https://github.com/nuxt-community/sitemap-module/compare/v2.1.0...v2.2.0) (2020-04-05)


### Features

* enable ETag header ([ccf3e10](https://github.com/nuxt-community/sitemap-module/commit/ccf3e10a44073c720eb651181db573bc17664a1c)), closes [#80](https://github.com/nuxt-community/sitemap-module/issues/80)


### Bug Fixes

* force route.url as string ([dc521ab](https://github.com/nuxt-community/sitemap-module/commit/dc521ab32456c511fec8b312c03544312ff2804d))

## [2.1.0](https://github.com/nuxt-community/sitemap-module/compare/v2.0.1...v2.1.0) (2020-03-27)


### Features

* add router data to each route in the filter function ([3f58560](https://github.com/nuxt-community/sitemap-module/commit/3f58560eea2a8cf075d3265dabcf3621e02f76e6)), closes [#69](https://github.com/nuxt-community/sitemap-module/issues/69)


### Bug Fixes

* headers of gzipped sitemap ([938d7b6](https://github.com/nuxt-community/sitemap-module/commit/938d7b67cdacee8eb15af6b2d0adaafda08ddaa2))
* omit router data before sitemap creation ([755ec76](https://github.com/nuxt-community/sitemap-module/commit/755ec7647099c362fa18e82492cb9a790f83e46e))

### [2.0.1](https://github.com/nuxt-community/sitemap-module/compare/v2.0.0...v2.0.1) (2019-11-12)


### Bug Fixes

* add router base to each link ([f75ea8b](https://github.com/nuxt-community/sitemap-module/commit/f75ea8b30f1de98873ddecb3306f3044718f0baa)), closes [#88](https://github.com/nuxt-community/sitemap-module/issues/88)
* fail on invalid options ([92a4f2f](https://github.com/nuxt-community/sitemap-module/commit/92a4f2f2ac27cd81fb87ac8e2e7dcf8b30ac4c76))

## [2.0.0](https://github.com/nuxt-community/sitemap-module/compare/v1.3.1...v2.0.0) (2019-09-29)


### ⚠ BREAKING CHANGES

* lastmod option parses all ISO8601 date-only strings as being in UTC rather than local time (see [sitemap.js v4 CHANGELOG](https://github.com/ekalinin/sitemap.js/blob/master/CHANGELOG.md#400))
* Drop support for Nuxt.js 1.x

### Features

* add configuration for sitemap index and multiple sitemaps ([e78e4a2](https://github.com/nuxt-community/sitemap-module/commit/e78e4a2)), closes [#6](https://github.com/nuxt-community/sitemap-module/issues/6)


* update dependency sitemap.js to v4 ([795aa1a](https://github.com/nuxt-community/sitemap-module/commit/795aa1a))

### [1.3.1](https://github.com/nuxt-community/sitemap-module/compare/v1.3.0...v1.3.1) (2019-09-17)


### Bug Fixes

* support routes from generate.routes with payload ([44f13d5](https://github.com/nuxt-community/sitemap-module/commit/44f13d5)), closes [#68](https://github.com/nuxt-community/sitemap-module/issues/68)

## [1.3.0](https://github.com/nuxt-community/sitemap-module/compare/v1.2.0...v1.3.0) (2019-08-23)


### Features

* add "trailingSlash" option to add a trailing slash to each route ([b82bb66](https://github.com/nuxt-community/sitemap-module/commit/b82bb66)), closes [#34](https://github.com/nuxt-community/sitemap-module/issues/34) [#78](https://github.com/nuxt-community/sitemap-module/issues/78)

## [1.2.0](https://github.com/nuxt-community/sitemap-module/compare/v1.1.0...v1.2.0) (2019-05-10)


### Bug Fixes

* generate sitemap from an absolute path ([78f1f32](https://github.com/nuxt-community/sitemap-module/commit/78f1f32))
* harmonize logs for all OS ([276e8fa](https://github.com/nuxt-community/sitemap-module/commit/276e8fa))


### Features

* add "xmlNs" option to set custom XML namespaces ([751a779](https://github.com/nuxt-community/sitemap-module/commit/751a779))



# [1.1.0](https://github.com/nuxt-community/sitemap-module/compare/v1.0.0...v1.1.0) (2019-05-01)


### Bug Fixes

* hostname initialization ([56fdddd](https://github.com/nuxt-community/sitemap-module/commit/56fdddd)), closes [#60](https://github.com/nuxt-community/sitemap-module/issues/60)


### Features

* add "xslUrl" option to set a custom XSL file to style the sitemap ([de1b706](https://github.com/nuxt-community/sitemap-module/commit/de1b706)), closes [#58](https://github.com/nuxt-community/sitemap-module/issues/58)



# [1.0.0](https://github.com/nuxt-community/sitemap-module/compare/v0.2.2...v1.0.0) (2019-04-15)


### Bug Fixes

* automatically create sitemap in `dist` ([#42](https://github.com/nuxt-community/sitemap-module/issues/42)) ([2767ccb](https://github.com/nuxt-community/sitemap-module/commit/2767ccb))
* cache initialization ([a947b33](https://github.com/nuxt-community/sitemap-module/commit/a947b33)), closes [#27](https://github.com/nuxt-community/sitemap-module/issues/27) [#51](https://github.com/nuxt-community/sitemap-module/issues/51)
* create cache ([#47](https://github.com/nuxt-community/sitemap-module/issues/47)) ([cd1d90f](https://github.com/nuxt-community/sitemap-module/commit/cd1d90f))


### Features

* add "defaults" option to set default route options ([eebbb45](https://github.com/nuxt-community/sitemap-module/commit/eebbb45)), closes [#15](https://github.com/nuxt-community/sitemap-module/issues/15)


### Performance Improvements

* reduce the use of lodash ([c226f11](https://github.com/nuxt-community/sitemap-module/commit/c226f11))


### BREAKING CHANGES

* usage of hook that require Nuxt >= 1.0



<a name="0.2.2"></a>
## [0.2.2](https://github.com/nuxt-community/sitemap-module/compare/v0.2.1...v0.2.2) (2019-03-12)


### Bug Fixes

* avoid duplicate routes with "index.vue" child-routes ([2315574](https://github.com/nuxt-community/sitemap-module/commit/2315574))



<a name="0.2.1"></a>
## [0.2.1](https://github.com/nuxt-community/sitemap-module/compare/v0.2.0...v0.2.1) (2019-03-12)


### Bug Fixes

* add child-routes to sitemap.xml ([#49](https://github.com/nuxt-community/sitemap-module/issues/49)) ([1073cf7](https://github.com/nuxt-community/sitemap-module/commit/1073cf7))



<a name="0.2.0"></a>
# [0.2.0](https://github.com/nuxt-community/sitemap-module/compare/v0.1.2...v0.2.0) (2019-01-02)


### Features

* add custom `filter` option ([239a1ed](https://github.com/nuxt-community/sitemap-module/commit/239a1ed))



<a name="0.1.2"></a>
## [0.1.2](https://github.com/nuxt-community/sitemap-module/compare/v0.1.1...v0.1.2) (2018-12-11)


### Bug Fixes

* fix static folder path ([0e02ea6](https://github.com/nuxt-community/sitemap-module/commit/0e02ea6))


<a name="0.1.1"></a>
## [0.1.1](https://github.com/nuxt-community/sitemap-module/compare/v0.1.0...v0.1.1) (2018-04-16)


### Bug Fixes

* disable gzip option by default ([fba2943](https://github.com/nuxt-community/sitemap-module/commit/fba2943))
* header of gzipped sitemap ([30edf85](https://github.com/nuxt-community/sitemap-module/commit/30edf85))



<a name="0.1.0"></a>
## [0.1.0](https://github.com/nuxt-community/sitemap-module/compare/v0.0.5...v0.1.0) (2018-04-16)


### Features

* feat: add gzip compression to sitemap by default ([6cee9bd](https://github.com/nuxt-community/sitemap-module/commit/6cee9bd)), closes [#16](https://github.com/nuxt-community/sitemap-module/issues/16)


### Performance Improvements

* optimize lodash imports ([5e1e68f](https://github.com/nuxt-community/sitemap-module/commit/5e1e68f))



<a name="0.0.5"></a>
## [0.0.5](https://github.com/nuxt-community/sitemap-module/compare/v0.0.4...v0.0.5) (2018-04-14)


### Bug Fixes

* wrap async calls ([b1b785a](https://github.com/nuxt-community/sitemap-module/commit/b1b785a))



<a name="0.0.4"></a>
## 0.0.4 (2018-03-20)


### Bug Fixes

* add routesUnion() method to combine routes arrays ([5d4f5b7](https://github.com/nuxt-community/sitemap-module/commit/5d4f5b7))



<a name="0.0.3"></a>
## [0.0.3](https://github.com/nuxt/modules/compare/@nuxtjs/sitemap@0.0.2...@nuxtjs/sitemap@0.0.3) (2017-08-03)


### Bug Fixes

* **sitemap:** nuxt rc compability (#104) ([335ae7a](https://github.com/nuxt/modules/commit/335ae7a))




<a name="0.0.2"></a>
## [0.0.2](https://github.com/nuxt/modules/compare/@nuxtjs/sitemap@0.0.1...@nuxtjs/sitemap@0.0.2) (2017-07-25)


### Bug Fixes

* **sitemap:** refactor to fix production build ([27fdca8](https://github.com/nuxt/modules/commit/27fdca8))
