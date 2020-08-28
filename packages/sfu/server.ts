import config from './config'
import express from 'express'
import https from 'https'
import fs from 'fs'
import url from 'url'
import protoo from 'protoo-server'
import {types as mediasoupTypes, createWorker} from 'mediasoup'
import Room from './lib/Room'

const tls = {
  cert: fs.readFileSync(config.https.tls.cert),
  key: fs.readFileSync(config.https.tls.key)
}
const mediasoupWorkers = []

export function getMediaSoupWorker() {
  return mediasoupWorkers[0] // hard coded for now
}

async function runMediasoupWorkers() {
  const {numWorkers} = config.mediasoup
  const {logLevel, logTags, rtcMinPort, rtcMaxPort} = config.mediasoup.workerSettings
  for (let i = 0; i < 1; i++) {
    // hard code to 1 for now
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
    // setInterval(async () => {
    //   const usage = await worker.getResourceUsage()
    //   console.log('mediasoup Worker resource usage [pid:%d]: %o', worker.pid, usage)
    // }, 120000)
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

  wss.on('connectionrequest', async (info, accept, reject) => {
    const requestUrl = url.parse(info.request.url, true)
    const {roomId, peerId} = requestUrl.query
    if (!roomId || !peerId) {
      reject(400, 'Connection request without roomId or peerId')
      return
    }
    /* Should put in queue or otherwise avoid race conditions */
    const room = await Room.getCreate(roomId as string)
    console.log('Got room with room id:', room.roomId)
    const transport = accept()
    room.createPeer(peerId as string, transport)
  })
}

async function main() {
  await runMediasoupWorkers()
  await runWebSocketServer()
}

main()
