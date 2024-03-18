const generateGraphQLArtifacts = require('./generateGraphQLArtifacts')
const cp = require('child_process')

const runChild = (cmd) => {
  return new Promise((resolve) => {
    const build = cp.exec(cmd).on('exit', resolve)
    build.stderr.pipe(process.stderr)
  })
}

const prod = async (isDeploy, noDeps) => {
  console.log('🙏🙏🙏      Building Production Server      🙏🙏🙏')
  try {
    await generateGraphQLArtifacts()
  } catch (e) {
    console.log('ERR generating artifacts', e)
  }

  console.log('starting webpack build')
  try {
    await Promise.all([
      runChild(
        `yarn webpack --config ./scripts/webpack/prod.servers.config.js --no-stats --env=noDeps=${noDeps}`
      ),
      runChild(
        `yarn webpack --config ./scripts/webpack/prod.client.config.js --no-stats --env=minimize=${isDeploy}`
      )
    ])
  } catch (e) {
    console.log('error webpackifying', e)
  }
}

if (require.main === module) {
  const isDeploy = process.argv[2] === '--deploy'
  const noDeps = process.argv[2] === '--no-deps'
  prod(isDeploy, noDeps)
}
