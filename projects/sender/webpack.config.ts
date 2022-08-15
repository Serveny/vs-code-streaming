import { Configuration } from 'webpack'
import path from 'path'
import EventHooksPlugin from 'event-hooks-webpack-plugin'
import { exec } from 'child_process'
import fs from 'fs-extra'

const extensionConfig: Configuration = {
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
    // eslint-disable-next-line @typescript-eslint/naming-convention
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
    new EventHooksPlugin({
      beforeCompile: (): void => {
        exec('cd ../../node_modules/vscode-web/dist/ && npm i', () => {
          fs.copy('../../node_modules/vscode-web', './dist/web/vscode-web')
          fs.copy('./public/product.json', './dist/web/product.json')
          fs.copy('./public/img/favicon.ico', './dist/web/favicon.ico')
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
