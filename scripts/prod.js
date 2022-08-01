const webpack = require('webpack')
const makeServersConfig = require('./webpack/prod.servers.config')
const makeClientConfig = require('./webpack/prod.client.config')
const generateGraphQLArtifacts = require('./generateGraphQLArtifacts')

const compile = (config, isSilent) => {
  return new Promise((resolve) => {
    const cb = (err, stats) => {
      if (err && !isSilent) {
        console.log('Webpack error:', err)
      }
      const {errors} = stats.compilation
      if (errors.length > 0 && !isSilent) {
        console.log('COMPILATION ERRORS:', errors)
      }
      resolve()
    }
    const compiler = webpack(config)
    compiler.run(cb)
  })
}

const prod = async (isDeploy) => {
  console.log('🙏🙏🙏      Building Production Server      🙏🙏🙏')
  // await generateGraphQLArtifacts()
  const serversConfig = makeServersConfig({isDeploy})
  const clientConfig = makeClientConfig({isDeploy})
  if (isDeploy) {
    await compile(serversConfig)
    await compile(clientConfig)
  } else {
    await Promise.all([compile(serversConfig), compile(clientConfig)])
    require('./toolbox/postDeploy.js')
  }
}

if (require.main === module) {
  const isDeploy = process.argv[2] === '--deploy'
  prod(isDeploy)
}
