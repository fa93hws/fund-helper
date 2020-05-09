/* eslint-disable */
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpackConfig = require('../webpack.config');
const { join } = require('path');

module.exports = {
  webpackFinal: async (config) => {
    config.module = config.module || { rules: [] };
    config.plugins = config.plugins || [];

    if (webpackConfig.module == null) {
      throw new Error('our webpack config should have module rules');
    }
    if (webpackConfig.plugins == null) {
      throw new Error('our webpack config should have plugins');
    }

    return {
      ...config,
      resolve: {
        ...config.resolve,
        ...webpackConfig.resolve,
      },
      module: {
        ...config.module,
        ...webpackConfig.module,
      },
      plugins: [
        ...config.plugins,
        ...webpackConfig.plugins.filter(
          (p) => !(p instanceof HtmlWebpackPlugin),
        ),
      ],
    };
  },

  stories: [join(__dirname, '..', 'src', '**', 'stories', '*.stories.tsx')],
  addons: [
    '@storybook/addon-knobs/register',
    '@storybook/addon-actions/register',
  ],
};
