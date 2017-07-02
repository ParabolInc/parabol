const path = require('path');
const resolve = require('resolve'); // eslint-disable-line import/no-extraneous-dependencies
require('babel-polyfill');

const root = process.cwd();
require('babel-register')({ // eslint-disable-line import/no-extraneous-dependencies
  resolveModuleSource(source, filename) {
    console.log('s', source, filename, __dirname, root)
    return resolve.sync(source, {
      basedir: path.resolve(filename, '..'),
      extensions: ['.js'],
      moduleDirectory: [
        'src',
        'node_modules'
      ]
    });
  }
});
require('./updateSchema');
