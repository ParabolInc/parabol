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
    process.exit(1)
  }

  console.log('starting webpack build')
  try {
    const webpacks = await Promise.all([
      runChild(
        `yarn webpack --config ./scripts/webpack/prod.servers.config.js --no-stats --env=noDeps=${noDeps}`
      ),
      runChild(
        `yarn webpack --config ./scripts/webpack/prod.client.config.js --no-stats --env=minimize=${isDeploy}`
      )
    ])
    webpacks.forEach(
      function (exitCode) {
        if (exitCode > 0)
          throw new Error(`Error during one of the webpack build processes. Webpacks error codes ${webpacks}`)
      }
    )
  } catch (e) {
    console.log('error webpackifying', e)
    process.exit(1)
  }
}

if (require.main === module) {
  const isDeploy = process.argv[2] === '--deploy'
  const noDeps = process.argv[2] === '--no-deps'
  prod(isDeploy, noDeps)
}
