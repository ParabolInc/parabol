require('babel-register');
require('babel-polyfill');

try {
  var dotenv = require('dotenv');              // eslint-disable-line
  var dotenvExpand = require('dotenv-expand'); // eslint-disable-line
  var myEnv = dotenv.config({silent: true});   // eslint-disable-line
  dotenvExpand(myEnv);
} catch (e) {
  console.warn('Unable to load .env: ', e);
}

require('./setupDB')(process.argv[2]);
