require('../../src/server/babelRegister')
const resolve = require('../../webpack/webpackResolve')
const path = require('path')

module.exports = {
  resolve,
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        include: [
          path.join(__dirname, '..'),
          path.join(__dirname, '..', '..', 'src', 'server', 'utils'),
          // used for universal constants
          path.join(__dirname, '..', '..', 'src', 'universal', 'utils')
        ],
        use: {
          loader: '@sucrase/webpack-loader',
          options: {
            transforms: ['jsx', 'typescript']
          }
        }
      }
    ]
  }
}
