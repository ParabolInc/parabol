import config from './config'
import express from 'express'
import https from 'https'
import fs from 'fs'
import protoo from 'protoo-server'
import mediasoup from 'mediasoup'

const tls = {
  cert: fs.readFileSync(config.https.tls.cert),
  key: fs.readFileSync(config.https.tls.key)
}
const mediasoupWorkers = []

async function runMediasoupWorkers() {
  const {numWorkers} = config.mediasoup
  for (let i = 0; i < numWorkers; i++) {
    const worker = await mediasoup.createWorker({
      logLevel: config.mediasoup.workerSettings.logLevel as mediasoup.types.WorkerLogLevel,
      logTags: config.mediasoup.workerSettings.logTags as mediasoup.types.WorkerLogTag[],
      rtcMinPort: Number(config.mediasoup.workerSettings.rtcMinPort),
      rtcMaxPort: Number(config.mediasoup.workerSettings.rtcMaxPort)
    })
    mediasoupWorkers.push(worker)
  }
}

async function main() {
  const expressApp = express()
  const httpsServer = https.createServer(tls, expressApp as any)

  await new Promise((resolve) => {
    httpsServer.listen(Number(config.https.listenPort), config.https.listenIp, resolve)
  })
  const wss = new protoo.WebSocketServer(httpsServer, {
    maxReceivedFrameSize: 960000, // 960 KBytes.
    maxReceivedMessageSize: 960000,
    fragmentOutgoingMessages: true,
    fragmentationThreshold: 960000
  })
  console.log(`\n🎥🎥🎥 Ready to Serve Media  🎥🎥🎥`)
  wss.on('connectionrequest', (info, accept, reject) => {
    console.log('Received request:', info.request.url)
    const transport = accept()
  })
}

main()
