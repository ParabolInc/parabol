import {HttpResponse, WebSocket, HttpRequest} from 'uWebSockets.js'

const uwsGetIP = (res: HttpResponse | WebSocket, req: HttpRequest) => {
  const clientIp = req.getHeader('x-forwarded-for')
  if (clientIp) return clientIp
  const ipBuffer = Buffer.from(res.getRemoteAddress())
  return ipBuffer.byteLength === 16 ? ipBuffer.toString('hex') : ipBuffer.join('.')
}

export default uwsGetIP
