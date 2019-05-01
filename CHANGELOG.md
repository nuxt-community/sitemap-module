# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
