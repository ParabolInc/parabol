import {GraphQLID, GraphQLObjectType} from 'graphql'
import AgendaItem from './AgendaItem'
import StandardMutationError from './StandardMutationError'
import NewMeeting from './NewMeeting'

const RemoveAgendaItemPayload = new GraphQLObjectType({
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
      resolve: ({meetingId}, _args, {dataLoader}) => {
        return meetingId ? dataLoader.get('newMeetings').load(meetingId) : null
      }
    }
  })
})

export default RemoveAgendaItemPayload
