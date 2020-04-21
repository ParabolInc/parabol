const path = require('path')
const nodeExternals = require('webpack-node-externals')

const moduleRuleConditionalTSRelay = (use) => ({
  test: /\.tsx?$/,
  // things that need the relay pluginw
  include: [path.join(SERVER_ROOT, 'email'), path.join(CLIENT_ROOT)],
  // but don't need the inline-import plugin
  exclude: [path.join(CLIENT_ROOT, 'utils/GitHubManager.ts')],
  use
})

const moduleRuleBabelLoader = (plugins) => ({
  loader: 'babel-loader',
  options: {
    cacheDirectory: true,
    babelrc: false,
    plugins
  }
})

const moduleRuleBabelRelay = (clientRoot) => {
  return (
    [
      'macros',
      {
        relay: {
          artifactDirectory: path.join(clientRoot, '__generated__')
        }
      }
    ]
  )
})

const moduleRuleSucrase = () => ({
  loader: '@sucrase/webpack-loader',
  options: {
    transforms: ['jsx', 'typescript']
  }
})

const moduleRuleSucraseJS = () => ({
  loader: '@sucrase/webpack-loader',
  options: {
    transforms: ['jsx']
  }
})

const resolveAlias = (projectRoot) => ({
  '~': path.join(projectRoot, 'packages/client/src'),
  'parabol-server/lib': path.join(projectRoot, 'packages/server/src'),
  'parabol-client/lib': path.join(projectRoot, 'packages/client/src')
})

const resovleModulesServer = (projectRoot) =>
  [path.resolve(path.join(projectRoot, 'packages/server/src'), '../node_modules'), 'node_modules']

const externalsServer = () => {
  return nodeExternals({
    whitelist: [/parabol-client/, '/parabol-server/']
  })
}

module.exports = {
  moduleRuleConditionalTSRelay,
  moduleRuleBabelRelay,
  moduleRuleSucrase,
  moduleRuleSucraseJS,
  resolveAlias,
  resovleModulesServer,
  externalsServer,
  moduleRuleBabelLoader
}


// [
//   {
//     loader: 'babel-loader',
//     options: {
//       cacheDirectory: true,
//       babelrc: false,
//       plugins: [pluginsBabelRelay(CLIENT_ROOT)]
//     }
//   },
//   {
//     loader: '@sucrase/webpack-loader',
//     options: {
//       transforms: ['jsx', 'typescript']
//     }
//   }
// ]
