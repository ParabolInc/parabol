import {GraphQLID, GraphQLNonNull} from 'graphql'
import RemoveAgendaItemPayload from '../types/RemoveAgendaItemPayload'
import removeAgendaItemResolver from './helpers/removeAgendaItem'

export default {
  type: RemoveAgendaItemPayload,
  description: 'Remove an agenda item',
  args: {
    agendaItemId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The agenda item unique id'
    }
  },
  resolve: removeAgendaItemResolver
}
