require('../../src/server/babelRegister')
const wp = require('@cypress/webpack-preprocessor')
const webpackOptions = require('./webpack.cypress.config')
const dotenv = require('dotenv')
const resetDb = require('./resetDb')

module.exports = (on, config) => {
  const options = {
    webpackOptions,
    watchOptions: {}
  }
  config.env = dotenv.config({silent: true, path: '.env.test'})

  // const restore =
  //   'docker run --rm --link action-rethink -v $(pwd):/backup petecoop/rethinkdb-driver rethinkdb-restore -c 172.17.0.2:28015 --force /backup/cypress/fixtures/rdb_test.tar.gz'
  on('file:preprocessor', wp(options))

  const dbOptions = {source: 'cypress', target: 'test'}
  on('task', {
    resetDb: resetDb.default(dbOptions)
  })

  return config
}
