import {us_listen_socket} from 'uWebSockets.js'
import getGraphQLExecutor from './utils/getGraphQLExecutor'

const listenHandler = (listenSocket: us_listen_socket) => {
  if (listenSocket) {
    console.log(`\n🔥🔥🔥 Ready for Action: Port ${process.env.PORT} 🔥🔥🔥`)
    getGraphQLExecutor().subscribe()
  }
}

export default listenHandler
