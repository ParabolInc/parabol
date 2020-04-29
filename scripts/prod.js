const webpack = require('webpack')
const toolboxConfig = require('./webpack/toolbox.config')
const makeServersConfig = require('./webpack/prod.servers.config')
const makeClientConfig = require('./webpack/prod.client.config')

const compile = (config) => {
  return new Promise((resolve) => {
    const compiler = webpack(config)
    compiler.run(resolve)
  })
}

const prod = async (isDeploy) => {
  console.log('🙏🙏🙏      Building Production Server      🙏🙏🙏')
  await compile(toolboxConfig)
  await require('./toolbox/updateSchema.js').default()
  await require('./compileRelay')()
  const serversConfig = makeServersConfig({isDeploy})
  const clientConfig = makeClientConfig({isDeploy})
  await Promise.all([
    compile(serversConfig),
    compile(clientConfig)
  ])
  if (!isDeploy) {
    require('./toolbox/postDeploy.js')
  }
}

if (require.main === module) {
  const isDeploy = process.argv[2] === '--deploy'
  prod(isDeploy)
}
