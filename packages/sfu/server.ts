import config from './config'
import express from 'express'
import https from 'https'
import fs from 'fs'
import protoo from 'protoo-server'
import {types as mediasoupTypes, createWorker} from 'mediasoup'

const tls = {
  cert: fs.readFileSync(config.https.tls.cert),
  key: fs.readFileSync(config.https.tls.key)
}
const mediasoupWorkers = []

async function runMediasoupWorkers() {
  const {numWorkers} = config.mediasoup
  const {logLevel, logTags, rtcMinPort, rtcMaxPort} = config.mediasoup.workerSettings
  for (let i = 0; i < numWorkers; i++) {
    const worker = await createWorker({
      logLevel: logLevel as mediasoupTypes.WorkerLogLevel,
      logTags,
      rtcMinPort: Number(rtcMinPort),
      rtcMaxPort: Number(rtcMaxPort)
    })
    worker.on('died', () => {
      console.log('mediasoup Worker died, exiting  in 2 seconds... [pid:%d]', worker.pid)
      setTimeout(() => process.exit(1), 2000)
    })
    mediasoupWorkers.push(worker)
    setInterval(async () => {
      const usage = await worker.getResourceUsage()
      console.log('mediasoup Worker resource usage [pid:%d]: %o', worker.pid, usage)
    }, 120000)
  }
}

async function runWebSocketServer() {
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

async function main() {
  await runMediasoupWorkers()
  await runWebSocketServer()
}

main()
