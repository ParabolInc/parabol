import {GraphQLID, GraphQLObjectType} from 'graphql'
import {resolveAgendaItem} from 'server/graphql/resolvers'
import AgendaItem from 'server/graphql/types/AgendaItem'
import StandardMutationError from 'server/graphql/types/StandardMutationError'
import NewMeeting from 'server/graphql/types/NewMeeting'
import {IUpdateAgendaItemPayload} from 'universal/types/graphql'
import {GQLContext} from 'server/graphql/graphql'

const UpdateAgendaItemPayload = new GraphQLObjectType<IUpdateAgendaItemPayload, GQLContext>({
  name: 'UpdateAgendaItemPayload',
  fields: () => ({
    agendaItem: {
      type: AgendaItem,
      resolve: resolveAgendaItem
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
    },
    error: {
      type: StandardMutationError
    }
  })
})

export default UpdateAgendaItemPayload
