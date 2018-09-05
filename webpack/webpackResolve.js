const path = require('path')

module.exports = {
  alias: {
    'react-dnd': '@mattkrick/react-dnd',
    'react-dnd-html5-backend': '@mattkrick/react-dnd-html5-backend',
    'react-relay': '@mattkrick/react-relay',
    'relay-runtime': '@mattkrick/relay-runtime'
  },
  modules: [path.join(__dirname, '../src'), 'node_modules'],
  extensions: ['.wasm', '.mjs', '.js', '.json', '.ts', '.tsx']
}
