const path = require('path');
const resolve = require('resolve');

module.exports.run = function() {
  require('babel-register')({
    only(filename) {
      return (filename.indexOf('build') === -1 && filename.indexOf('node_modules') === -1);
    },
    extensions: ['.js'],
    resolveModuleSource(source, filename) {
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
  require('babel-polyfill');
};
