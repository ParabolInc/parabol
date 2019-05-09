import {GraphQLID, GraphQLObjectType} from 'graphql'
import {resolveAgendaItem} from 'server/graphql/resolvers'
import AgendaItem from 'server/graphql/types/AgendaItem'
import StandardMutationError from 'server/graphql/types/StandardMutationError'
import {IAddAgendaItemPayload} from 'universal/types/graphql'
import {GQLContext} from 'server/graphql/graphql'
import NewMeeting from 'server/graphql/types/NewMeeting'

const AddAgendaItemPayload = new GraphQLObjectType<IAddAgendaItemPayload, GQLContext>({
  name: 'AddAgendaItemPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
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
    }
  })
})

export default AddAgendaItemPayload
