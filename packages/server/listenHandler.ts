import {us_listen_socket} from 'uWebSockets.js'
import {RECONNECT_WINDOW} from './server'
import {Logger} from './utils/Logger'
import sendToSentry from './utils/sendToSentry'
import serverHealthChecker from './utils/serverHealthChecker'

const listenHandler = (listenSocket: us_listen_socket) => {
  const PORT = Number(__PRODUCTION__ ? process.env.PORT : process.env.SOCKET_PORT)
  const SERVER_ID = process.env.SERVER_ID
  if (listenSocket) {
    Logger.log(`\n🔥🔥🔥 Server ID: ${SERVER_ID}. Ready for Sockets: Port ${PORT} 🔥🔥🔥`)
    // if shutdowns are clean, this isn't necessary
    // that's why we wait 3 minutes to let all the old servers shut down gracefully
    serverHealthChecker.cleanUserPresence(RECONNECT_WINDOW + 120_000).catch(sendToSentry)
  } else {
    Logger.log(`❌❌❌    Port ${PORT} is in use!    ❌❌❌`)
  }
}

export default listenHandler
