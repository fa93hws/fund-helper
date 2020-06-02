const baseConfig = require('@fund-helper/eslint-config');

module.exports = {
  ...baseConfig,
  root: true,
  env: {
    node: true,
    browser: true,
  },
  parserOptions: {
    ...baseConfig.parserOptions,
    ecmaFeatures: {
      jsx: true,
    },
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
  plugins: [...baseConfig.plugins, 'react-hooks', 'jsx-a11y', 'jest'],
  extends: [
    ...baseConfig.extends,
    'plugin:jsx-a11y/recommended',
    'plugin:react/recommended',
  ],
  rules: {
    ...baseConfig.rules,
    'react/display-name': 'off',
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
