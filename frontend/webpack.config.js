const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { resolve } = require('path');

module.exports = {
  mode: 'development',
  entry: './src/index.tsx',
  output: {
    path: resolve('target'),
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
                context: resolve(__dirname, 'src'),
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
  },
  plugins: [
    new HtmlWebpackPlugin({ template: 'index.html' }),
    new MiniCssExtractPlugin({
      filename: `static/css/[name].[chunkhash:8].css`,
      chunkFilename: `static/css/[name].[chunkhash:8].css`,
    }),
  ],
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendors: {
          test: /node_modules/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: 4,
        sourceMap: true,
      }),
    ],
  },
};
