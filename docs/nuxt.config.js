import theme from '@nuxt/content-theme-docs'

export default theme({
  i18n: {
    locales: () => [
      { code: 'fr', iso: 'fr-FR', file: 'fr-FR.js', name: 'Français' },
      { code: 'en', iso: 'en-US', file: 'en-US.js', name: 'English' },
    ],
    defaultLocale: 'en',
  },
})
