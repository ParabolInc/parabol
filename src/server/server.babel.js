const ignorePatterns = [
  '\\/\\.',
  '~$',
  '\\.json$',
  'src/server/database/migrations/.*$',
  'debug'
];

const ignoreRegexp = new RegExp(ignorePatterns.join('|'), 'i');

if (process.env.NODE_ENV !== 'production') {
  if (!require('piping')({ // eslint-disable-line global-require
    hook: false,
    ignore: ignoreRegexp
  })) {
    return;
  }
}

require('babel-register');
require('babel-polyfill');
require('./server');
