const path = require('path')
const swcLoader = require('./swcLoader')

const relayTagLoader = path.join(__dirname, 'relayTagLoader.js')

const clientTransformRules = (projectRoot) => {
  const CLIENT_ROOT = path.join(projectRoot, 'packages', 'client')
  return ['ts', 'tsx', 'js'].map((extension) => ({
    test: new RegExp(`\\.${extension}$`),
    include: [CLIENT_ROOT],
    use: [swcLoader({extension, development: true, refresh: true}), relayTagLoader]
  }))
}

module.exports = clientTransformRules
