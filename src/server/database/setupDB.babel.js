require('babel-register');
require('babel-polyfill');

try {
  var fs = require('fs');                        // eslint-disable-line
  if (fs.existsSync('../.env')) {
    var dotenv = require('dotenv');              // eslint-disable-line
    var dotenvExpand = require('dotenv-expand'); // eslint-disable-line
    var myEnv = dotenv.config();                 // eslint-disable-line
    dotenvExpand(myEnv);
  }
} catch (e) {
  console.warn('Unable to load .env: ', e);
}

require('./setupDB')(process.argv[2]);
