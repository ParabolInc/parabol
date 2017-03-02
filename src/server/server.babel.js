const ignorePatterns = [
  '\\/\\.',
  '~$',
  '\\.json$',
  'src/server/database/migrations/.*$',
  'src/server/billing/.*$',
  '__tests__*$'
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
require('./server');
