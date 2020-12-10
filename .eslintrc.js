module.exports = {
  extends: ['@nuxtjs', 'plugin:prettier/recommended'],
  rules: {
    curly: 'error',
    // Allow sparse arrays
    'no-sparse-arrays': 'off',
  },
  overrides: [
    {
      files: ['test/fixture/pages/**/*.vue'],
      rules: {
        'vue/singleline-html-element-content-newline': 'off',
      },
    },
  ],
}
