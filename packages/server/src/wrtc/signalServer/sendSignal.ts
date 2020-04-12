import {WebSocket} from 'uWebSockets.js'

const sendSignal = (socket: WebSocket, signal: object) => {
  if (socket.done) return
  socket.send(JSON.stringify({type: 'WRTC_SIGNAL', signal}))
}

export default sendSignal
