import {GraphQLMessageType} from '../graphql/handleGraphQLTrebuchetRequest'
import ConnectionContext from './ConnectionContext'
import {sendEncodedMessage} from './sendEncodedMessage'

const sendGQLMessage = (
  context: ConnectionContext,
  opId: string,
  type: GraphQLMessageType,
  syn: boolean,
  payload?: Record<string, any>
) => {
  const message = {id: opId, type, ...(payload && {payload})}
  sendEncodedMessage(context, message, syn)
}

export default sendGQLMessage
