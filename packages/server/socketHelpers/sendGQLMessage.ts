import {GraphQLMessageType} from '../graphql/handleGraphQLTrebuchetRequest'
import ConnectionContext from './ConnectionContext'
import {sendEncodedMessage} from './sendEncodedMessage'

interface Message {
  type: string
  syn: boolean
  payload?: Record<string, any>
  id: string
}

const sendGQLMessage = (
  context: ConnectionContext,
  opId: string,
  type: GraphQLMessageType,
  syn: boolean,
  payload?: Record<string, any>
) => {
  const message = {id: opId, type} as Message
  if (payload) message.payload = payload

  sendEncodedMessage(context, message, syn)
}

export default sendGQLMessage
