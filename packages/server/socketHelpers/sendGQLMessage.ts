import {WebSocket, HttpResponse} from 'uWebSockets.js'
import sendEncodedMessage from './sendEncodedMessage'
import {GraphQLMessageType} from '../graphql/handleGraphQLTrebuchetRequest'

interface Message {
  type: string
  payload?: object
  id?: string
}

const sendGQLMessage = (
  transport: WebSocket | HttpResponse,
  type: GraphQLMessageType,
  payload?: object,
  opId?: string
) => {
  const message = {type} as Message
  if (payload) message.payload = payload
  if (opId) message.id = opId
  sendEncodedMessage(transport, message)
}

export default sendGQLMessage
