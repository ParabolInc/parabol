const path = require('path')

const transformRules = (projectRoot) => {
  const CLIENT_ROOT = path.join(projectRoot, 'packages', 'client')
  const SERVER_ROOT = path.join(projectRoot, 'packages', 'server')
  const GQL_ROOT = path.join(projectRoot, 'packages', 'gql-executor')
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
            transforms: ['jsx', 'typescript']
          }
        }
      ]
    },
    {
      test: /\.(tsx?|js)$/,
      // things that don't need babel
      include: [SERVER_ROOT, GQL_ROOT, TOOLBOX_SRC],
      // things that need babel
      exclude: path.join(SERVER_ROOT, 'email'),
      use: {
        loader: '@sucrase/webpack-loader',
        options: {
          // imports is needed for old JS RethinkDB migration files
          // otherwise exports.up is ignored when an import statement is there
          // can remove when they're gone
          transforms: ['jsx', 'typescript', 'imports']
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
            transforms: ['jsx', 'typescript']
          }
        }
      ]
    }
  ]
}

module.exports = transformRules
