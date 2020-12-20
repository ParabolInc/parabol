import {us_listen_socket} from 'uWebSockets.js'
import getGraphQLExecutor from './utils/getGraphQLExecutor'

const listenHandler = (listenSocket: us_listen_socket) => {
  if (listenSocket) {
    console.log(`\n🔥🔥🔥 Ready for Sockets: Port ${process.env.SOCKET_PORT} 🔥🔥🔥`)
    getGraphQLExecutor().subscribe()
  } else {
    console.log(`❌❌❌    Port ${process.env.SOCKET_PORT} is in use!    ❌❌❌`)
  }
}

export default listenHandler
