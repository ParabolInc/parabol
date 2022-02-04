require('./webpack/utils/dotenv')
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server/lib/Server')

const hmrServer = () => {
  const config = require('./webpack/dev.client.config')
  const compiler = webpack(config)
  const server = new WebpackDevServer({...config.devServer}, compiler)
  server.start(process.env.PORT, 'localhost')
}

hmrServer()
