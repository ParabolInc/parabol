require('sucrase/register')
require('../../../scripts/webpack/utils/dotenv')
const path = require('path')
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server/lib/Server')
const waitForFileExists = require('../../../scripts/waitForFileExists').default

const hmrServer = async () => {
  const mattermostPluginConfig = require('../webpack.config')
  const mattermostPluginCompiler = webpack(mattermostPluginConfig)
  const mattermostServer = new WebpackDevServer(
    {...mattermostPluginConfig.devServer},
    mattermostPluginCompiler
  )

  const queryMapExists = await waitForFileExists(
    path.join(__dirname, '../../../queryMap.json'),
    20000
  )
  if (!queryMapExists) throw Error('QueryMap Not Available. Run `pnpm relay:build`')

  await mattermostServer.start(3002, 'localhost')
}

hmrServer()
