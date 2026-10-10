import './utils/dotenv.js'
import {type Configuration, rspack} from '@rspack/core'
import {createRequire} from 'module'
import path from 'path'
import externalizeNodeModules from './utils/externalizeNodeModules.mts'
import getProjectRoot from './utils/getProjectRoot.js'
import transformRules from './utils/transformRules.js'

const require = createRequire(import.meta.url)
const PROJECT_ROOT = getProjectRoot()
const CLIENT_ROOT = path.join(PROJECT_ROOT, 'packages', 'client')
const SERVER_ROOT = path.join(PROJECT_ROOT, 'packages', 'server')
const EMBEDDER_ROOT = path.join(PROJECT_ROOT, 'packages', 'embedder')
const DOTENV = path.join(PROJECT_ROOT, 'scripts', 'webpack', 'utils', 'dotenv.js')
const INIT_PUBLIC_PATH = path.join(SERVER_ROOT, 'initPublicPath.ts')
const PRELOAD_TRACED_BUILTINS = path.join(SERVER_ROOT, 'preloadTracedBuiltins.ts')

const devServersConfig: Configuration = {
  stats: 'errors-warnings',
  devtool: 'source-map',
  mode: 'development',
  node: {
    __dirname: false
  },
  entry: {
    web: [
      // must stay first, see the file for why
      PRELOAD_TRACED_BUILTINS,
      DOTENV,
      INIT_PUBLIC_PATH,
      path.join(PROJECT_ROOT, 'scripts/toolboxSrc/primeIntegrations.ts'),
      path.join(SERVER_ROOT, 'server.ts')
    ],
    embedder: [
      PRELOAD_TRACED_BUILTINS,
      DOTENV,
      INIT_PUBLIC_PATH,
      // make sure all the extensions (pgvector) exist & are updated
      path.join(PROJECT_ROOT, 'scripts/toolboxSrc/pgEnsureExtensions.ts'),
      path.join(EMBEDDER_ROOT, 'embedder.ts')
    ]
  },
  output: {
    filename: '[name].js',
    path: path.join(PROJECT_ROOT, 'dev')
  },
  resolve: {
    alias: {
      '~': path.join(CLIENT_ROOT),
      'parabol-server': SERVER_ROOT,
      'parabol-client': CLIENT_ROOT,
      // this is for radix-ui, we import & transform ESM packages, but they can't find react/jsx-runtime
      'react/jsx-runtime': require.resolve('react/jsx-runtime')
    },
    extensions: ['.mjs', '.js', '.json', '.ts', '.tsx', '.graphql']
  },
  target: 'node',
  // Only our own code is bundled. That is what keeps a rebuild in the 100ms range
  externals: [externalizeNodeModules],
  plugins: [
    new rspack.DefinePlugin({
      __PRODUCTION__: false,
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
    })
  ],
  module: {
    rules: [
      ...transformRules(PROJECT_ROOT, {builtin: true}),
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: '[name][ext]'
        }
      }
    ]
  }
}

export default devServersConfig
