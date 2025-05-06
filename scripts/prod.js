const generateGraphQLArtifacts = require('./generateGraphQLArtifacts')
const cp = require('child_process')
const {Logger} = require('../packages/server/utils/Logger')

const runChild = (cmd) => {
  return new Promise((resolve, reject) => {
    const build = cp.exec(cmd).on('exit', (code, signal) => {
      if (signal) {
        reject(new Error(`Received signal ${signal}`))
      } else if (code !== 0) {
        reject(new Error(`Received non-zero exit code ${code}`))
      } else {
        resolve()
      }
    })
    build.stderr.pipe(process.stderr)
    // enable this for debugging webpack scripts
    build.stdout.pipe(process.stdout)
  })
}

const prod = async (isDeploy, noDeps) => {
  Logger.log('🙏🙏🙏      Building Production Server      🙏🙏🙏')
  try {
    await generateGraphQLArtifacts()
  } catch (e) {
    Logger.log('ERR generating artifacts', e)
    process.exit(1)
  }

  Logger.log('starting webpack build')
  try {
    await Promise.all([
      runChild(
        `pnpm webpack --config ./scripts/webpack/prod.servers.config.js --env=noDeps=${noDeps}`
      ),
      runChild(
        `pnpm webpack --config ./scripts/webpack/prod.client.config.js --env=minimize=${isDeploy}`
      )
    ])
    Logger.log('building mattermost-plugin')
    await runChild(
      `pnpm webpack --config ./packages/mattermost-plugin/prod.webpack.config.js --env=minimize=${isDeploy}`
    )
  } catch (e) {
    Logger.log('error webpackifying', e)
    process.exit(1)
  }
}

if (require.main === module) {
  const isDeploy = process.argv[2] === '--deploy'
  const noDeps = process.argv[2] === '--no-deps'
  prod(isDeploy, noDeps)
}
