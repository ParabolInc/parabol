import sendRaw from './sendRaw'
import http from 'http'
import {WebSocket} from '@clusterws/cws'

interface Message {
  type: string
  payload?: object
  id?: string
}

const sendMessage = (transport: WebSocket | http.ServerResponse, type: string, payload?: object, opId?: string) => {
  const message = {type} as Message
  if (payload) message.payload = payload
  if (opId) message.id = opId
  sendRaw(transport, JSON.stringify(message))
}

export default sendMessage
