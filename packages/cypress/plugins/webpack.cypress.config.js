require('../../server/babelRegister')
const path = require('path')

const PACKAGES_ROOT = path.join(__dirname, '..', '..')
module.exports = {
  resolve: {
    extensions: ['.wasm', '.mjs', '.js', '.json', '.ts', '.tsx', '.graphql', '.d.ts'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        include: [PACKAGES_ROOT],
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
