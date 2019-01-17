const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ServiceWorkerWebpackPlugin = require('serviceworker-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.tsx',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {loader: 'ts-loader'},
          {
            loader: 'tslint-loader',
            options: {
              configuration: {
                defaultSeverity: 'warn',
                extends: ['tslint:recommended', 'tslint-react'],
                jsRules: {},
                rules: {
                  quotemark: [true, 'jsx-double', 'single', 'avoid-escape'],
                  'arrow-parens': false,
                  'object-literal-sort-keys': false,
                  'interface-name': false,
                  'trailing-comma': {
                    multiline: ['objects', 'arrays', 'typeLiterals'],
                  },
                },
                rulesDirectory: [],
              },
            },
          },
        ],
        exclude: /node_modules/,
      },
      {test: /manifest\.webmanifest$/, use: 'file-loader'},
      {
        test: /\.css$/,
        use: [{loader: 'file-loader'}, {loader: 'less-loader'}],
      },
    ],
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/index.html',
    }),
    new CopyWebpackPlugin([{from: 'src/images', to: 'images'}]),
    // running locally
    new ServiceWorkerWebpackPlugin({entry: path.join(__dirname, 'src/sw.js')}),
    // running on thecsillags.com
    // new ServiceWorkerWebpackPlugin({
    //   publicPath: '/ph21d/',
    //   entry: path.join(__dirname, 'src/sw.js'),
    // }),
  ],
};
