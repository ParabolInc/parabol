const config = require('./config')
const express = require('express')
const https = require('https')
const fs = require('fs')
const protoo = require('protoo-server')

const tls = {
  cert: fs.readFileSync(config.https.tls.cert),
  key: fs.readFileSync(config.https.tls.key)
}

async function main() {
  const expressApp = express()
  const httpsServer = https.createServer(tls, expressApp)

  await new Promise((resolve) => {
    httpsServer.listen(Number(config.https.listenPort), config.https.listenIp, resolve)
  })
  const wss = new protoo.WebSocketServer(httpsServer, {
    maxReceivedFrameSize: 960000, // 960 KBytes.
    maxReceivedMessageSize: 960000,
    fragmentOutgoingMessages: true,
    fragmentationThreshold: 960000
  })
  console.log('Listening on localhost port 4443...')
  wss.on('connectionrequest', (info, accept, reject) => {
    console.log('Received request:', info.request.url)
    const transport = accept()
  })
}

main()
