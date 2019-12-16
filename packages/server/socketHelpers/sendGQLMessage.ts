import {WebSocket} from '@clusterws/cws'
import {ServerResponse} from 'http'
import sendEncodedMessage from './sendEncodedMessage'

interface Message {
  type: string
  payload?: object
  id?: string
}

const sendGQLMessage = (
  transport: WebSocket | ServerResponse,
  type: string,
  payload?: object,
  opId?: string
) => {
  const message = {type} as Message
  if (payload) message.payload = payload
  if (opId) message.id = opId
  sendEncodedMessage(transport, message)
}

export default sendGQLMessage
