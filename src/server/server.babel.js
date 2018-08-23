const path = require('path')
const resolve = require('resolve') // eslint-disable-line import/no-extraneous-dependencies

const ignorePatterns = [
  '\\/\\.',
  '~$',
  '\\.json$',
  'src/server/database/migrations/.*$',
  'src/server/billing/.*$',
  '__tests__*$'
]

const ignoreRegexp = new RegExp(ignorePatterns.join('|'), 'i')
if (process.env.NODE_ENV !== 'production') {
  const hasChanged = require('piping')({
    // eslint-disable-line
    hook: false,
    ignore: ignoreRegexp
  })
  if (!hasChanged) {
    return
  }
}

require('babel-register')({
  only (filename) {
    return filename.indexOf('build') === -1 && filename.indexOf('node_modules') === -1
  },
  plugins: ['transform-object-rest-spread', ['transform-class-properties', {spec: true}]],
  presets: [
    [
      'env',
      {
        targets: {
          node: 'current'
        }
      }
    ],
    'flow',
    'react'
  ],
  extensions: ['.js'],
  resolveModuleSource (source, filename) {
    return resolve.sync(source, {
      basedir: path.resolve(filename, '..'),
      extensions: ['.js'],
      moduleDirectory: ['src', 'node_modules']
    })
  }
})
require('./server')
