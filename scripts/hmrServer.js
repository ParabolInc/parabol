require('sucrase/register')
require('./webpack/utils/dotenv')
const path = require('path')
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server/lib/Server')
const waitForFileExists = require('./waitForFileExists').default

const hmrServer = async () => {
  await require('./buildDll')()
  const config = require('./webpack/dev.client.config')
  const compiler = webpack(config)
  const server = new WebpackDevServer({...config.devServer}, compiler)
  const queryMapExists = await waitForFileExists(path.join(__dirname, '../queryMap.json'), 20000)
  if (!queryMapExists) throw Error('QueryMap Not Available. Run `yarn relay:build`')

  await server.start(process.env.PORT, 'localhost')
}

hmrServer()
