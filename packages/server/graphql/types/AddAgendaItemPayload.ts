import {GraphQLID, GraphQLObjectType} from 'graphql'
import AgendaItem from 'server/graphql/types/AgendaItem'
import StandardMutationError from 'server/graphql/types/StandardMutationError'
import {GQLContext} from 'server/graphql/graphql'
import NewMeeting from 'server/graphql/types/NewMeeting'

const AddAgendaItemPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'AddAgendaItemPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    agendaItem: {
      type: AgendaItem,
      resolve: ({agendaItemId}, _args, {dataLoader}) => {
        return dataLoader.get('agendaItems').load(agendaItemId)
      }
    },
    meetingId: {
      type: GraphQLID
    },
    meeting: {
      type: NewMeeting,
      description: 'The meeting with the updated agenda item, if any',
      resolve: ({meetingId}, _args, {dataLoader}) => {
        return meetingId ? dataLoader.get('newMeetings').load(meetingId) : null
      }
    }
  })
})

export default AddAgendaItemPayload
