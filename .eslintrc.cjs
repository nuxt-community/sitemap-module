module.exports = {
  extends: [
    '@nuxtjs/eslint-config-typescript',
    'plugin:prettier/recommended',
    'prettier',
    'plugin:vue/vue3-recommended',
    'eslint:recommended',
    '@vue/prettier',
  ],
  rules: {
    curly: 'error',
    // Allow sparse arrays
    'no-sparse-arrays': 'off',
    '@typescript-eslint/no-unused-vars': [
      'off'
    ]
  },
  plugins: ['jest', 'prettier'],
  env: {
    'jest/globals': true,
  },
  globals: {
    import: 'readonly',
    useRuntimeConfig: 'readonly',
  },
  overrides: [
    {
      files: ['test/**/*.vue'],
      rules: {
        'vue/multi-word-component-names': 'off',
      },
    },
  ],
}
