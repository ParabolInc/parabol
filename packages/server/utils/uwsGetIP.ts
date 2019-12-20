import {HttpResponse, WebSocket} from 'uWebSockets.js'

const uwsGetIP = (res: HttpResponse | WebSocket) => {
  const ipBuffer = Buffer.from(res.getRemoteAddress())
  return ipBuffer.byteLength === 16 ? ipBuffer.toString('hex') : ipBuffer.join('.')
}

export default uwsGetIP
