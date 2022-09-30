import {GraphQLID, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import AgendaItem from './AgendaItem'
import NewMeeting from './NewMeeting'
import StandardMutationError from './StandardMutationError'

const AddAgendaItemPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'AddAgendaItemPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
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
    }
  })
})

export default AddAgendaItemPayload
