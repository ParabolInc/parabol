import {GraphQLBoolean, GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {getUserId} from '../../utils/authorization'
import {GQLContext} from '../graphql'
import {resolveNewMeeting} from '../resolvers'
import RetrospectiveMeeting from './RetrospectiveMeeting'
import Team from './Team'
import TimelineEvent from './TimelineEvent'
import makeMutationPayload from './makeMutationPayload'

export const EndRetrospectiveSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'EndRetrospectiveSuccess',
  fields: () => ({
    isKill: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'true if the meeting was killed (ended before reaching last stage)'
    },
    team: {
      type: new GraphQLNonNull(Team),
      resolve: ({teamId}, _args: unknown, {dataLoader}) => {
        return teamId ? dataLoader.get('teams').load(teamId) : null
      }
    },
    meeting: {
      type: new GraphQLNonNull(RetrospectiveMeeting),
      resolve: resolveNewMeeting
    },
    removedSuggestedActionId: {
      type: GraphQLID,
      description: 'The ID of the suggestion to try a retro meeting, if tried'
    },
    removedTaskIds: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLID)))
    },
    timelineEvent: {
      type: new GraphQLNonNull(TimelineEvent),
      description: 'An event that is important to the viewer, e.g. an ended meeting',
      resolve: async ({meetingId}, _args: unknown, {dataLoader, authToken}) => {
        const viewerId = getUserId(authToken)
        const timelineEvents = await dataLoader.get('timelineEventsByMeetingId').load(meetingId)
        const timelineEvent = timelineEvents.find(
          (event) => event.type === 'retroComplete' && event.userId === viewerId
        )
        if (!timelineEvent) throw new Error('Timeline event not found')
        return timelineEvent
      }
    }
  })
})

const EndRetrospectivePayload = makeMutationPayload(
  'EndRetrospectivePayload',
  EndRetrospectiveSuccess
)

export default EndRetrospectivePayload
