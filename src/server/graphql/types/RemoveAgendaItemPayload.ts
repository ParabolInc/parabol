import {GraphQLObjectType} from 'graphql'
import AgendaItem from 'server/graphql/types/AgendaItem'
import StandardMutationError from 'server/graphql/types/StandardMutationError'

const RemoveAgendaItemPayload = new GraphQLObjectType({
  name: 'RemoveAgendaItemPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    agendaItem: {
      type: AgendaItem
    }
  })
})

export default RemoveAgendaItemPayload
