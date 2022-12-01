import {GraphQLID, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import AgendaItem from './AgendaItem'
import NewMeeting from './NewMeeting'
import StandardMutationError from './StandardMutationError'

const RemoveAgendaItemPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'RemoveAgendaItemPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    agendaItem: {
      type: AgendaItem
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

export default RemoveAgendaItemPayload
