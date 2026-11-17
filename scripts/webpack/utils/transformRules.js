const path = require('path')
const swcLoader = require('./swcLoader')

const relayTagLoader = path.join(__dirname, 'relayTagLoader.js')

const transformRules = (projectRoot, {isProd = false, builtin = false} = {}) => {
  const CLIENT_ROOT = path.join(projectRoot, 'packages', 'client')
  const SERVER_ROOT = path.join(projectRoot, 'packages', 'server')
  const EMBEDDER_ROOT = path.join(projectRoot, 'packages', 'embedder')
  const TOOLBOX_SRC = path.join(projectRoot, 'scripts', 'toolboxSrc')
  const TRACING_ROOT = path.join(SERVER_ROOT, 'tracing')
  const development = !isProd
  const relayRule = (extension) => ({
    test: new RegExp(`\\.${extension}$`),
    // things that use relay artifacts
    include: [path.join(SERVER_ROOT, 'email'), CLIENT_ROOT],
    use: [swcLoader({extension, development, builtin}), relayTagLoader]
  })
  const serverRule = (extension) => ({
    test: new RegExp(`\\.${extension}$`),
    include: [SERVER_ROOT, EMBEDDER_ROOT, TOOLBOX_SRC],
    exclude: [path.join(SERVER_ROOT, 'email'), TRACING_ROOT],
    // commonjs is needed because the toolbox entries run themselves when require.main === module
    // without it, webpack treats that as an unused export & drops it
    use: [swcLoader({extension, development, builtin, commonjs: true})]
  })
  // OpenTelemetry's ESM builds are tree-shakeable, but a require() resolves its CJS builds, which bundle all of it
  const tracingRule = {
    test: /\.ts$/,
    include: TRACING_ROOT,
    use: [swcLoader({extension: 'ts', development, builtin})]
  }
  return [
    {
      test: /\.graphql$/,
      include: SERVER_ROOT,
      type: 'asset/source'
    },
    relayRule('ts'),
    relayRule('tsx'),
    serverRule('ts'),
    serverRule('tsx'),
    serverRule('js'),
    tracingRule
  ]
}

module.exports = transformRules
