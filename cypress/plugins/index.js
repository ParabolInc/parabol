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
  const path = process.env.CI ? '.env' : '.env.test'
  config.env = dotenv.config({silent: true, path})
  on('file:preprocessor', wp(options))
  const dbOptions = {source: 'cypress', target: 'test'}
  // Execute code in Node.js via the task plugin event.
  // https://docs.cypress.io/api/commands/task.html#Syntax
  on('task', {
    resetDb: resetDb.default(dbOptions)
  })

  return config
}
