import {us_listen_socket} from 'uWebSockets.js'

const listenHandler = (listenSocket: us_listen_socket) => {
  if (listenSocket) {
    console.log('\n🔥🔥🔥 Ready for Action 🔥🔥🔥')
  }
}

export default listenHandler
