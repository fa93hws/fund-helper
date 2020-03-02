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
  plugins: ['@typescript-eslint', 'babel', 'import', 'jest'],
  extends: [
    'airbnb-base',
    'eslint-config-prettier',
    'plugin:@typescript-eslint/recommended',
    'plugin:jest/recommended',
  ],
  rules: {
    // import
    'import/prefer-default-export': 'off',
    'import/no-default-export': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off',
    'import/extensions': 'off',

    'no-useless-constructor': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'class-methods-use-this': 'off',
    'no-underscore-dangle': 'off',
    'no-restricted-globals': 'off',
  },
};
