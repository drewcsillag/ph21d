const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.tsx',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {test: /\.css$/, use: 'file-loader'},
      {test: /manifest\.webmanifest$/, use: 'file-loader'},
      {
        test: /\.less$/,
        use: [{
          loader: 'file-loader'},
          {loader: 'less-loader'}] // compiles Less to CSS
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
      // template: 'src/index.html',
    }),
    new CopyWebpackPlugin([
      {from:'src/images',to:'images'}
    ]),
  ],
};
