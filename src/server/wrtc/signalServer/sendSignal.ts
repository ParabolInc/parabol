const sendSignal = (socket: WebSocket, signal: object) => {
  socket.send(JSON.stringify({type: 'WRTC_SIGNAL', signal}))
}

export default sendSignal
