require('../../src/server/babelRegister')
const resolve = require('../../webpack/webpackResolve')

module.exports = {
  resolve,
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: [/node_modules/],
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      }
    ]
  }
}
