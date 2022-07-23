//@ts-check
'use strict'

const CopyPlugin = require('copy-webpack-plugin')
const EventHooksPlugin = require('event-hooks-webpack-plugin')
const { CallbackTask } = require('event-hooks-webpack-plugin/lib/tasks')
const fs = require('fs-extra')

//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/

const path = require('path')
const webpack = require('webpack')

/** @type WebpackConfig */
const webExtensionConfig = {
  mode: 'none', // this leaves the source code as close as possible to the original (when packaging we set this to 'production')
  target: 'webworker', // extensions run in a webworker context
  entry: {
    extension: './src/web/extension.ts',
  },
  output: {
    filename: '[name].js',
    path: path.join(__dirname, './dist/web'),
    libraryTarget: 'commonjs',
    devtoolModuleFilenameTemplate: '../../[resource-path]',
  },
  resolve: {
    mainFields: ['browser', 'module', 'main'], // look for `browser` entry point in imported node modules
    extensions: ['.ts', '.js'], // support ts-files and js-files
    alias: {
      // provides alternate implementation for node module and source files
    },
    fallback: {
      // Webpack 5 no longer polyfills Node.js core modules automatically.
      // see https://webpack.js.org/configuration/resolve/#resolvefallback
      // for the list of Node.js core module polyfills.
      assert: require.resolve('assert'),
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
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser', // provide a shim for the global `process` variable
    }),
    // @ts-ignore
    new EventHooksPlugin({
      done: () => {
        fs.copy('./dist/web/extension.js', '../sender/dist/receiver/dist/web/extension.js')
        fs.copy('./package.json', '../sender/dist/receiver/package.json')
        fs.copy('./package.nls.json', '../sender/dist/receiver/package.nls.json')
      },
    }),
  ],
  externals: {
    vscode: 'commonjs vscode', // ignored because it doesn't exist
  },
  performance: {
    hints: false,
  },
  devtool: 'nosources-source-map', // create a source map that points to the original source file
  infrastructureLogging: {
    level: 'log', // enables logging required for problem matchers
  },
}

module.exports = [webExtensionConfig]
