import {us_listen_socket} from 'uWebSockets.js'
import getGraphQLExecutor from './utils/getGraphQLExecutor'
import {Logger} from './utils/Logger'
import serverHealthChecker from './utils/serverHealthChecker'
import sendToSentry from './utils/sendToSentry'

const listenHandler = (listenSocket: us_listen_socket) => {
  const PORT = Number(__PRODUCTION__ ? process.env.PORT : process.env.SOCKET_PORT)
  const SERVER_ID = process.env.SERVER_ID
  if (listenSocket) {
    Logger.log(`\n🔥🔥🔥 Server ID: ${SERVER_ID}. Ready for Sockets: Port ${PORT} 🔥🔥🔥`)
    getGraphQLExecutor().subscribe()
    // Cleaning on startup because shutdowns may be abrupt
    serverHealthChecker.cleanUserPresence().catch(sendToSentry)
  } else {
    Logger.log(`❌❌❌    Port ${PORT} is in use!    ❌❌❌`)
  }
}

export default listenHandler
