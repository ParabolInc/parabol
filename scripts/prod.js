const webpack = require('webpack')
const toolbox = require('./webpack/toolbox.config')
const servers = require('./webpack/prod.servers.config')
const client = require('./webpack/prod.client.config')

const compile = (config) => {
  return new Promise((resolve) => {
    const compiler = webpack(config)
    compiler.run(resolve)
  })
}

const prod = async (isDeploy) => {
  if (isDeploy) {
    process.env.WEBPACK_DEPLOY = true
  }
  console.log('🙏🙏🙏      Building Production Server      🙏🙏🙏')
  await compile(toolbox)
  await require('./toolbox/updateSchema.js').default()
  await require('./compileRelay')()
  await Promise.all([
    compile(servers),
    compile(client)
  ])
}

if (require.main === module) {
  const isDeploy = process.argv[2] === '--deploy'
  prod(isDeploy)
}
