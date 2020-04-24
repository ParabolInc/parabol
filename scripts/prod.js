const webpack = require('webpack')
// const { fork } = require('child_process')
// const getProjectRoot = require('./webpack/utils/getProjectRoot')
// const path = require('path')

// const PROJECT_ROOT = getProjectRoot()
// const TOOLBOX_ROOT = path.join(PROJECT_ROOT, 'scripts', 'toolbox')

const compileToolbox = () => {
  return new Promise((resolve) => {
    const config = require('./webpack/toolbox.config')
    const compiler = webpack(config)
    compiler.run(resolve)
  })
}

const compileServers = () => {
  return new Promise((resolve) => {
    const config = require('./webpack/prod.servers.config')
    const compiler = webpack(config)
    compiler.run(resolve)
  })
}

const compileClient = () => {
  return new Promise((resolve) => {
    const config = require('./webpack/prod.client.config')
    const compiler = webpack(config)
    compiler.run(resolve)
  })
}

const prod = async (isDeploy) => {
  if (isDeploy) {
    process.env.WEBPACK_DEPLOY = true
  }
  console.log('👋👋👋      Building Production Server      👋👋👋')
  await compileToolbox()
  await require('./toolbox/updateSchema.js').default()
  await require('./compileRelay')()
  // fork(path.join(TOOLBOX_ROOT, 'migrateDB.js'))
  await Promise.all([
    compileServers(),
    compileClient()
  ])
}

if (require.main === module) {
  const isDeploy = process.argv[2] === '--deploy'
  prod(isDeploy)
}
