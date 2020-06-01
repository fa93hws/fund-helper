import { join, resolve } from 'path';
import { Configuration } from 'webpack';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import { webpackConfig } from '../webpack/webpack-config';

async function webpackFinal(config: Configuration) {
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
      ...webpackConfig.plugins.filter((p) => !(p instanceof HtmlWebpackPlugin)),
    ],
  };
}

const frontendDir = resolve(__dirname, '..', '..');

export const storyBookConfig = {
  webpackFinal,
  stories: [join(frontendDir, 'src', '**', 'stories', '*.stories.tsx')],
  addons: [
    '@storybook/addon-knobs/register',
    '@storybook/addon-actions/register',
  ],
};
