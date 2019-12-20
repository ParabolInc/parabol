import {WebSocket} from '@clusterws/cws'
import {encode} from '@msgpack/msgpack'
import {ServerResponse} from 'http'
import PROD from '../PROD'
import sendSSEMessage from '../sse/sendSSEMessage'

const encoder = PROD ? encode : JSON.stringify
const sendEncodedMessage = (transport: WebSocket | ServerResponse, message: object | string) => {
  if ('readyState' in transport) {
    transport.send(encoder(message) as string | Buffer)
  } else {
    sendSSEMessage(transport as ServerResponse, JSON.stringify(message))
  }
}

export default sendEncodedMessage
