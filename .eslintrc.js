module.exports = {
  extends: [
    '@nuxtjs'
  ],
  rules: {
    // Allow sparse arrays
    'no-sparse-arrays': 'off',
    // Allow space after function name (standard rule)
    'space-before-function-paren': ['error', 'always'],
    // Remove parents on arrow function
    'arrow-parens': ['error', 'as-needed']
  }
}
