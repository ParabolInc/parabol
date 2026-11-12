import type {HttpRequest, HttpResponse} from 'uWebSockets.js'

// uWS upgrades any GET that carries a Sec-WebSocket-Key. A proxy that drops the hop-by-hop Upgrade header still
// forwards the key, and Google's load balancer, which never saw an upgrade, turns the 101 into a 502
const rejectNonWebSocketUpgrade = (res: HttpResponse, req: HttpRequest) => {
  if (req.getHeader('upgrade').toLowerCase() === 'websocket') return false
  res.writeStatus('400 Bad Request').end()
  return true
}

export default rejectNonWebSocketUpgrade
