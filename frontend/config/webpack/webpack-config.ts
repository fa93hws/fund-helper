import { resolve, join } from 'path';
import { Configuration } from 'webpack';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import * as MiniCssExtractPlugin from 'mini-css-extract-plugin';

const frontendDir = resolve(__dirname, '..', '..');

export const webpackConfig: Configuration = {
  mode: 'development',
  entry: join(frontendDir, 'src', 'index.tsx'),
  output: {
    path: join(frontendDir, 'target'),
    filename: `static/js/[name].[hash:8].js`,
    chunkFilename: `static/js/[name].[hash:8].js`,
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx'],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        loader: 'ts-loader',
        options: { transpileOnly: true },
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: { hmr: true },
          },
          'css-modules-typescript-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                mode: 'local',
                context: resolve(frontendDir, 'src'),
                localIdentName: '[path][name]__[local]',
              },
              localsConvention: 'camelCaseOnly',
              importLoaders: 0,
              sourceMap: true,
            },
          },
        ],
      },
    ],
  },
  devtool: 'source-map',
  devServer: {
    historyApiFallback: true,
    inline: true,
    hot: true,
    port: 8081,
    proxy: {
      '/api/v1': 'http://localhost:3000',
    },
  },
  plugins: [
    new HtmlWebpackPlugin({ template: 'index.html' }),
    new MiniCssExtractPlugin({
      filename: `static/css/[name].[chunkhash:8].css`,
      chunkFilename: `static/css/[name].[chunkhash:8].css`,
    }),
  ],
};
