import {GraphQLID, GraphQLObjectType} from 'graphql'
import AgendaItem from './AgendaItem'
import StandardMutationError from './StandardMutationError'
import NewMeeting from './NewMeeting'
import {GQLContext} from '../graphql'

const UpdateAgendaItemPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'UpdateAgendaItemPayload',
  fields: () => ({
    agendaItem: {
      type: AgendaItem,
      resolve: ({agendaItemId}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('agendaItems').load(agendaItemId)
      }
    },
    meetingId: {
      type: GraphQLID
    },
    meeting: {
      type: NewMeeting,
      description: 'The meeting with the updated agenda item, if any',
      resolve: ({meetingId}, _args: unknown, {dataLoader}) => {
        return meetingId ? dataLoader.get('newMeetings').load(meetingId) : null
      }
    },
    error: {
      type: StandardMutationError
    }
  })
})

export default UpdateAgendaItemPayload
