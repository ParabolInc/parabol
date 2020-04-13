const path = require('path')

const PROJECT_ROOT = path.join(__dirname, '..', '..')
const CLIENT_ROOT = path.join(PROJECT_ROOT, 'packages', 'client', 'src')

module.exports = {
  alias: {
    // example of how to alias
    // 'relay-runtime': '@mattkrick/relay-runtime'
    '~': CLIENT_ROOT
  },
  modules: [CLIENT_ROOT, 'node_modules'],
  extensions: ['.wasm', '.mjs', '.js', '.json', '.ts', '.tsx', '.graphql', '.d.ts']
}
