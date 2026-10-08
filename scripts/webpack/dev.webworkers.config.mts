import type {Configuration} from '@rspack/core'
import path from 'path'
import getProjectRoot from './utils/getProjectRoot.js'
import WriteWorkerAssets from './utils/WriteWorkerAssets.js'

const PROJECT_ROOT = getProjectRoot()
const CLIENT_ROOT = path.join(PROJECT_ROOT, 'packages', 'client')

const devWebWorkersConfig: Configuration = {
  mode: 'development',
  devtool: false,
  stats: 'errors-warnings',
  // monaco falls back to an AMD require when it is not loaded as ESM, which never happens here
  ignoreWarnings: [{module: /monaco-editor.*editorSimpleWorker/}],
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
  plugins: [new WriteWorkerAssets()]
}

export default devWebWorkersConfig
