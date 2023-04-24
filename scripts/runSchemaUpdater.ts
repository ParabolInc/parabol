/*
  Builds the toolbox, which includes a function that can
  print a GraphQL Schema from an executable schema.
  The toolbox also includes other helpful CLIs.
  They are included in the build to minimize the number of webpack builds we perform
*/
import webpack from 'webpack'

const compileToolbox = async (ignoreErrors: boolean) => {
  return new Promise<void>((resolve) => {
    const config = require('./webpack/toolbox.config')
    const compiler = webpack(config)
    compiler.run((err, stats) => {
      if (err) {
        console.log('Webpack error:', err)
      }
      const errors = stats?.compilation?.errors ?? []
      if (!ignoreErrors && errors.length > 0) {
        console.log('COMPILATION ERRORS:', errors)
      }
      resolve()
    })
  })
}

const updateGraphQLSchema = async () => {
  return require('./toolbox/updateSchema').default()
}

const runSchemaUpdater = async (ignoreErrors: boolean) => {
  await compileToolbox(ignoreErrors)
  return updateGraphQLSchema()
}

export default runSchemaUpdater
