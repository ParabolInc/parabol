import {HttpResponse, WebSocket} from 'uWebSockets.js'
import sendSSEMessage from '../sse/sendSSEMessage'
import isHttpResponse from './isHttpResponse'

const ESTIMATED_MTU = 1400
const sendEncodedMessage = (transport: WebSocket | HttpResponse, message: object | string) => {
  if (transport.done) return
  const str = JSON.stringify(message)
  if (isHttpResponse(transport)) {
    sendSSEMessage(transport as HttpResponse, str)
    return
  }
  transport.send(str, false, str.length > ESTIMATED_MTU)
}

export default sendEncodedMessage
