const path = require('path')

const transformRules = (projectRoot, isProd) => {
  const CLIENT_ROOT = path.join(projectRoot, 'packages', 'client')
  const SERVER_ROOT = path.join(projectRoot, 'packages', 'server')
  const EMBEDDER_ROOT = path.join(projectRoot, 'packages', 'embedder')
  const TOOLBOX_SRC = path.join(projectRoot, 'scripts', 'toolboxSrc')
  return [
    {
      test: /\.graphql$/,
      include: SERVER_ROOT,
      use: {
        loader: 'raw-loader'
      }
    },
    {
      test: /\.tsx?$/,
      // things that need the relay plugin
      include: [path.join(SERVER_ROOT, 'email'), path.join(CLIENT_ROOT)],
      use: [
        {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            babelrc: false,
            plugins: [
              [
                'macros',
                {
                  relay: {
                    artifactDirectory: path.join(CLIENT_ROOT, '__generated__')
                  }
                }
              ]
            ]
          }
        },
        {
          loader: '@sucrase/webpack-loader',
          options: {
            production: isProd,
            transforms: ['jsx', 'typescript'],
            jsxRuntime: 'automatic'
          }
        }
      ]
    },
    {
      test: /\.(tsx?|js)$/,
      // things that don't need babel
      include: [SERVER_ROOT, EMBEDDER_ROOT, TOOLBOX_SRC],
      // things that need babel
      exclude: path.join(SERVER_ROOT, 'email'),
      use: {
        loader: '@sucrase/webpack-loader',
        options: {
          production: isProd,
          // imports is needed for applyEnvVarsToClientAssets since it uses CJS
          // otherwise it gets ignored and treated as an unused export in the build
          transforms: ['jsx', 'typescript', 'imports'],
          jsxRuntime: 'automatic'
        }
      }
    },
    {
      // things that need inline-import
      include: [path.join(SERVER_ROOT, 'graphql'), path.join(SERVER_ROOT, 'integrations')],
      test: /\.tsx?/,
      use: [
        {
          loader: 'babel-loader',
          options: {
            // for whatever reason, .graphql files are not invalidated
            // cacheDirectory: true,
            babelrc: false,
            plugins: [
              [
                'inline-import',
                {
                  extensions: ['.graphql']
                }
              ]
            ]
          }
        },
        {
          loader: '@sucrase/webpack-loader',
          options: {
            production: isProd,
            transforms: ['jsx', 'typescript'],
            jsxRuntime: 'automatic'
          }
        }
      ]
    }
  ]
}

module.exports = transformRules
