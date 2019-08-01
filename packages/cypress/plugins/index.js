require('../../server/babelRegister')
const wp = require('@cypress/webpack-preprocessor')
const webpackOptions = require('./webpack.cypress.config')
const dotenv = require('dotenv')
const resetDb = require('./resetDb')
const path = require('path')

module.exports = (on, config) => {
  const options = {
    webpackOptions,
    watchOptions: {}
  }
  const envFile = path.join(__dirname, '..', process.env.CI ? '.env' : '.env.test')
  config.env = dotenv.config({path: envFile}).parsed
  on('file:preprocessor', wp(options))
  const dbOptions = {source: 'cypress', target: 'test'}
  // Execute code in Node.js via the task plugin event.
  // https://docs.cypress.io/api/commands/task.html#Syntax
  on('task', {
    resetDb: resetDb.default(dbOptions)
  })

  return config
}
