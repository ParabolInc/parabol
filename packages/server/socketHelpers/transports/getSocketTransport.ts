import {Socket} from './Socket'
import {WebSocket, TransportType as WebSocketTransportType } from './WebSocket'
import { SSESocket, TransportType as SSESocketTranpsortType } from './SSESocket'
import {HttpResponse} from 'uWebSockets.js'

const isHttpResponse = (transport: unknown): transport is HttpResponse => {
  return !!(transport as HttpResponse).tryEnd
}

export type SocketTransportType = WebSocketTransportType | SSESocketTranpsortType
export const getSocketTransport = (transport: WebSocketTransportType | SSESocketTranpsortType): Socket => {
  if (isHttpResponse(transport)) {
    return new SSESocket(transport)
  }
  return new WebSocket(transport)
}
