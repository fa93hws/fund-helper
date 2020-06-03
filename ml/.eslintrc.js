const baseConfig = require('@fund-helper/eslint-config');

module.exports = {
  ...baseConfig,
  root: true,
  env: {
    node: true,
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.ts'],
      },
    },
  },
};
