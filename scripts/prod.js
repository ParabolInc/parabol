const webpack = require('webpack')
const makeServersConfig = require('./webpack/prod.servers.config')
const makeClientConfig = require('./webpack/prod.client.config')
const generateGraphQLArtifacts = require('./generateGraphQLArtifacts')
const cp = require('child_process')
const {promisify} = require('util')

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
  await exec('yarn pg:build')
  await generateGraphQLArtifacts()
  const serversConfig = makeServersConfig({isDeploy})
  const clientConfig = makeClientConfig({isDeploy})
  const exec = promisify(cp.exec)
  await Promise.all([compile(serversConfig), compile(clientConfig)])
  if (!isDeploy) {
    require('./toolbox/postDeploy.js')
  }
}

if (require.main === module) {
  const isDeploy = process.argv[2] === '--deploy'
  prod(isDeploy)
}
