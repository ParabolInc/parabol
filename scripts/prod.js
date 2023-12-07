const webpack = require('webpack')
const generateGraphQLArtifacts = require('./generateGraphQLArtifacts')
const cp = require('child_process')

const prod = async (isDeploy, noDeps) => {
  console.log('🙏🙏🙏      Building Production Server      🙏🙏🙏')
  await generateGraphQLArtifacts()
  const buildServers = new Promise((resolve) => {
    const serverBuild = cp
      .exec(
        `yarn webpack --config ./scripts/webpack/prod.servers.config.js --no-stats --env=noDeps=${noDeps}`
      )
      .on('exit', () => {
        resolve()
      })
    serverBuild.stderr.pipe(process.stderr)
  })
  const buildClient = new Promise((resolve) => {
    const clientBuild = cp
      .exec(
        `yarn webpack --config ./scripts/webpack/prod.client.config.js --no-stats --env=isDeploy=${
          isDeploy || noDeps
        }`
      )
      .on('exit', () => {
        resolve()
      })
    clientBuild.stderr.pipe(process.stderr)
  })
  await Promise.all([buildServers, buildClient])
}

if (require.main === module) {
  const isDeploy = process.argv[2] === '--deploy'
  const noDeps = process.argv[2] === '--no-deps'
  prod(isDeploy, noDeps)
}
