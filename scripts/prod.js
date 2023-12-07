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
  await generateGraphQLArtifacts()
  await Promise.all([
    runChild(
      `yarn webpack --config ./scripts/webpack/prod.servers.config.js --no-stats --env=noDeps=${noDeps}`
    ),
    runChild(
      `yarn webpack --config ./scripts/webpack/prod.client.config.js --no-stats --env=isDeploy=${
        isDeploy || noDeps
      }`
    )
  ])
}

if (require.main === module) {
  const isDeploy = process.argv[2] === '--deploy'
  const noDeps = process.argv[2] === '--no-deps'
  prod(isDeploy, noDeps)
}
