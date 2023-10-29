const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
var webpack = require('webpack');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
require('dotenv').config({ path: './.env' }); 

module.exports = {
  entry: './index.tsx',
  mode: 'development',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'index_bundle.js',
  },
  target: 'web',
  devServer: {
    port: '5000',
    static: {
      directory: path.join(__dirname, 'public')
},
    open: true,
    hot: true,
    liveReload: true,
    historyApiFallback: true, // Add this line
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    alias: {
      'react-native$': 'react-native-web',
    },
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/, 
        exclude: /node_modules/, 
        use: 'ts-loader', 
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'public', 'index.html')
    }),
    // The following two are required for dotenv
    new NodePolyfillPlugin(),
    new webpack.DefinePlugin({
      "process.env": JSON.stringify(process.env),
    }),
  ]
};