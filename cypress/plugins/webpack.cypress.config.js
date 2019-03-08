require('../../src/server/babelRegister')
const resolve = require('../../webpack/webpackResolve')
const pluginObjectRestSpread = require('@babel/plugin-proposal-object-rest-spread').default
const pluginClassProps = require('@babel/plugin-proposal-class-properties').default
const pluginDynamicImport = require('@babel/plugin-syntax-dynamic-import').default
const presetReact = require('@babel/preset-react').default
const presetTypescript = require('@babel/preset-typescript').default
const path = require('path')

const babelLoader = {
  loader: 'babel-loader',
  options: {
    cacheDirectory: true,
    babelrc: false,
    plugins: [pluginObjectRestSpread, pluginClassProps, pluginDynamicImport],
    presets: [presetReact, presetTypescript]
  }
}

module.exports = {
  resolve,
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        include: [path.join(__dirname, '..')],
        use: babelLoader
      }
    ]
  }
}
