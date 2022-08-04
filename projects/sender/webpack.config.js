/* eslint-disable @typescript-eslint/naming-convention */
//@ts-check

'use strict'

const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')
const EventHooksPlugin = require('event-hooks-webpack-plugin')
const { exec } = require('child_process')
const fs = require('fs-extra')

//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/

/** @type WebpackConfig */
const extensionConfig = {
  target: 'node', // vscode extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/
  mode: 'none', // this leaves the source code as close as possible to the original (when packaging we set this to 'production')

  entry: './src/extension.ts', // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2',
  },
  externals: {
    vscode: 'commonjs vscode', // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
          },
        ],
      },
    ],
  },
  devtool: 'nosources-source-map',
  infrastructureLogging: {
    level: 'log', // enables logging required for problem matchers
  },
  plugins: [
    // @ts-ignore
    new EventHooksPlugin({
      beforeCompile: () => {
        exec('cd ../../node_modules/vscode-web/dist/ && npm i', () => {
          fs.copy('./src/index.html', './dist/index.html')
          fs.copy('./src/custom.css', './dist/custom.css')
          fs.copy('./src/product.json', './dist/product.json')
          fs.copy('../../node_modules/vscode-web', './dist/vscode-web')
        })
      },
    }),
  ],
}
module.exports = [extensionConfig]
