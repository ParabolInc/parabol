const path = require('path')
const TerserPlugin = require('terser-webpack-plugin')
const getProjectRoot = require('./utils/getProjectRoot')
const WriteWorkerAssets = require('./utils/WriteWorkerAssets')

const PROJECT_ROOT = getProjectRoot()
const CLIENT_ROOT = path.join(PROJECT_ROOT, 'packages', 'client')

module.exports = {
  mode: 'production',
  target: 'webworker',
  entry: {
    monacoJSONWorker: path.join(
      CLIENT_ROOT,
      'node_modules',
      'monaco-editor/esm/vs/language/json/json.worker.js'
    ),
    monacoGraphQLWorker: path.join(
      CLIENT_ROOT,
      'node_modules',
      'monaco-graphql/esm/graphql.worker.js'
    ),
    monacoWorker: path.join(
      CLIENT_ROOT,
      'node_modules',
      'monaco-editor/esm/vs/editor/editor.worker.js'
    )
  },
  output: {
    path: path.join(PROJECT_ROOT, 'build'),
    publicPath: 'auto',
    filename: '[name]_[contenthash].worker.js'
  },
  optimization: {
    runtimeChunk: false,
    splitChunks: false,
    minimize: true,
    minimizer: [
      new TerserPlugin({
        minify: TerserPlugin.swcMinify,
        parallel: true,
        terserOptions: {
          mangle: true,
          compress: true
        }
      })
    ]
  },
  module: {
    parser: {
      javascript: {
        dynamicImportMode: 'eager'
      }
    }
  },
  plugins: [new WriteWorkerAssets()]
}
