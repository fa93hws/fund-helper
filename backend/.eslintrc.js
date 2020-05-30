module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  env: {
    node: true,
  },
  parserOptions: {
    sourceType: 'module',
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts'],
      },
    },
  },
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-namespace': 'off',
    'no-useless-constructor': 'off',
    'no-unused-expressions': 'off',
    'no-console': 'error',
    'class-methods-use-this': 'off',
    'no-continue': 'off',
  },
};
