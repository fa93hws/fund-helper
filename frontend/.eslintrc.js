module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  env: {
    node: true,
    browser: true,
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    sourceType: 'module',
  },
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  plugins: [
    '@typescript-eslint',
    'babel',
    'eslint-plugin-react',
    'react-hooks',
    'jsx-a11y',
  ],
  extends: [
    'airbnb-base',
    'eslint-config-prettier',
    'plugin:@typescript-eslint/recommended',
    'plugin:jest/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:react/recommended',
  ],
  rules: {
    // import
    'import/prefer-default-export': 'off',
    'import/no-default-export': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off',
    'import/extensions': 'off',
    'no-useless-constructor': 'off',
    'import/no-unresolved': 'off',
    'no-unused-expressions': 'off',
    '@typescript-eslint/no-namespace': 'off',

    'import/no-extraneous-dependencies': 'off',
    'react/display-name': 'off',
    'no-console': 'error',
    'class-methods-use-this': 'off',
  },
  overrides: [
    {
      files: ['*.d.ts'],
      rules: {
        'import/no-default-export': 'off',
      },
    },
  ],
};
