require('./webpack/utils/dotenv')
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server/lib/Server')
const waitForRelayCompiler = require('./waitForRelayCompiler')

const hmrServer = async () => {
  await require('./buildDll')()
  const config = require('./webpack/dev.client.config')
  const compiler = webpack(config)
  const server = new WebpackDevServer({...config.devServer}, compiler)
  await waitForRelayCompiler()
  await server.start(process.env.PORT, 'localhost')
}

hmrServer()
