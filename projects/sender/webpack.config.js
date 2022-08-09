/* eslint-disable @typescript-eslint/naming-convention */
//@ts-check

'use strict'

const path = require('path')
const EventHooksPlugin = require('event-hooks-webpack-plugin')
const { exec } = require('child_process')
const fs = require('fs-extra')

//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/

/** @type WebpackConfig */
const extensionConfig = {
  target: 'node',
  mode: 'none',

  entry: './src/extension.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2',
  },
  externals: {
    vscode: 'commonjs vscode',
    express: 'express',
    bufferutil: 'bufferutil',
    'utf-8-validate': 'utf-8-validate',
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      handlebars: 'handlebars/dist/handlebars.js',
    },
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
          fs.copy('./src/views', './dist/views')
          // fs.copy('./src/custom.css', './dist/web/custom.css')
          fs.copy('./src/product.json', './dist/product.json')
          fs.copy('../../node_modules/vscode-web', './dist/web/vscode-web')
        })
      },
    }),
  ],
}

const webCustomizerConfig = {
  target: 'web',
  entry: './src/web-customizer.ts',
  mode: 'none',
  output: {
    path: path.resolve(__dirname, 'dist/web'),
    filename: 'web-customizer.js',
    libraryTarget: 'var',
    // `library` determines the name of the global variable
    library: 'webCustomizer',
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
  resolve: {
    extensions: ['.ts', '.js'],
  },
}

module.exports = [extensionConfig, webCustomizerConfig]
