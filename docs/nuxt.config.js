import theme from '@nuxt/content-theme-docs'

export default theme({
  i18n: {
    locales: () => [
      { code: 'fr', iso: 'fr-FR', file: 'fr-FR.js', name: 'Français' },
      { code: 'en', iso: 'en-US', file: 'en-US.js', name: 'English' },
      { code: 'cn', iso: 'zh-CN', file: 'zh-CN.js', name: '简体中文' },
    ],
    defaultLocale: 'en',
  },
})
