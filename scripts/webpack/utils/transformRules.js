const path = require('path')
const swcLoader = require('./swcLoader')

const relayTagLoader = path.join(__dirname, 'relayTagLoader.js')

const transformRules = (projectRoot, isProd) => {
  const CLIENT_ROOT = path.join(projectRoot, 'packages', 'client')
  const SERVER_ROOT = path.join(projectRoot, 'packages', 'server')
  const EMBEDDER_ROOT = path.join(projectRoot, 'packages', 'embedder')
  const TOOLBOX_SRC = path.join(projectRoot, 'scripts', 'toolboxSrc')
  const development = !isProd
  const relayRule = (extension) => ({
    test: new RegExp(`\\.${extension}$`),
    // things that use relay artifacts
    include: [path.join(SERVER_ROOT, 'email'), CLIENT_ROOT],
    use: [swcLoader({extension, development}), relayTagLoader]
  })
  const serverRule = (extension) => ({
    test: new RegExp(`\\.${extension}$`),
    include: [SERVER_ROOT, EMBEDDER_ROOT, TOOLBOX_SRC],
    exclude: path.join(SERVER_ROOT, 'email'),
    // commonjs is needed because the toolbox entries run themselves when require.main === module
    // without it, webpack treats that as an unused export & drops it
    use: [swcLoader({extension, development, commonjs: true})]
  })
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
    serverRule('js')
  ]
}

module.exports = transformRules
