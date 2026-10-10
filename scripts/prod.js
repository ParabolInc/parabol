const generateGraphQLArtifacts = require('./generateGraphQLArtifacts')
const cp = require('child_process')
const fs = require('fs')
const path = require('path')
const {Logger} = require('../packages/server/utils/Logger')

const BUILD_PATH = path.join(__dirname, '../build')

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

// The client, web workers & mattermost-plugin all emit to /build at the same time, so none of them can be the one to clean it
// The web workers & schema are kept because the dev server reads them from /build, too
const cleanBuildDir = () => {
  const isKept = (name) => /worker\.js$|^workerManifest\.js$|^schema\.(graphql|json)$/.test(name)
  if (!fs.existsSync(BUILD_PATH)) return
  fs.readdirSync(BUILD_PATH)
    .filter((name) => !isKept(name))
    .forEach((name) => {
      fs.rmSync(path.join(BUILD_PATH, name), {recursive: true, force: true})
    })
}

const prod = async (isDeploy, noDeps) => {
  Logger.log('🙏🙏🙏      Building Production Server      🙏🙏🙏')
  cleanBuildDir()
  // only the builds that get shipped are minified & upload their source maps, so the rest skip the seconds that takes
  const isShipped = isDeploy || noDeps
  // a shipped build is bundled without being typechecked, so it never reads the codegen types
  const {relay, types} = generateGraphQLArtifacts({skipTypes: isShipped})
  // the client imports the manifest of web workers, but the web workers do not depend on any graphql artifacts
  const webworkers = runChild(`pnpm webpack --config ./scripts/webpack/prod.webworkers.config.js`)
  const bundles = relay.then(() => {
    Logger.log('starting webpack build')
    return Promise.all([
      webworkers.then(() =>
        runChild(
          `pnpm webpack --config ./scripts/webpack/prod.client.config.js --env=minimize=${isShipped} --env=sourceMaps=${isShipped}`
        )
      ),
      runChild(
        `pnpm webpack --config ./scripts/webpack/prod.servers.config.js --env=noDeps=${noDeps}`
      ),
      runChild(
        `pnpm webpack --config ./packages/mattermost-plugin/prod.webpack.config.js --env=minimize=${isDeploy}`
      )
    ])
  })
  try {
    await Promise.all([types, webworkers, bundles])
  } catch (e) {
    Logger.log('error building', e)
    process.exit(1)
  }
}

if (require.main === module) {
  const isDeploy = process.argv[2] === '--deploy'
  const noDeps = process.argv[2] === '--no-deps'
  prod(isDeploy, noDeps)
}
