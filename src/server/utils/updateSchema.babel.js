const path = require('path')
const resolve = require('resolve') // eslint-disable-line import/no-extraneous-dependencies

require('babel-register')({
  plugins: ['transform-object-rest-spread', 'syntax-dynamic-import', 'transform-class-properties'],
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
  extensions: ['.js', '.ts'],
  // eslint-disable-line import/no-extraneous-dependencies
  resolveModuleSource (source, filename) {
    return resolve.sync(source, {
      basedir: path.resolve(filename, '..'),
      extensions: ['.js', 'ts.'],
      moduleDirectory: ['src', 'node_modules']
    })
  }
})
require('./updateSchema')
