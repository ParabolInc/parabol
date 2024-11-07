import {GraphQLBoolean, GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {getUserId} from '../../utils/authorization'
import {GQLContext} from '../graphql'
import makeMutationPayload from './makeMutationPayload'
import PokerMeeting from './PokerMeeting'
import Team from './Team'
import TimelineEvent from './TimelineEvent'

export const EndSprintPokerSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'EndSprintPokerSuccess',
  fields: () => ({
    isKill: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'true if the meeting was killed (ended before reaching last stage)'
    },
    meetingId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    meeting: {
      type: new GraphQLNonNull(PokerMeeting),
      resolve: ({meetingId}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('newMeetings').load(meetingId)
      }
    },
    removedTaskIds: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLID)))
    },
    team: {
      type: new GraphQLNonNull(Team),
      resolve: ({teamId}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('teams').load(teamId)
      }
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    timelineEvent: {
      type: new GraphQLNonNull(TimelineEvent),
      resolve: async ({meetingId}, _args: unknown, {dataLoader, authToken}) => {
        const viewerId = getUserId(authToken)
        const timelineEvents = await dataLoader.get('timelineEventsByMeetingId').load(meetingId)
        const timelineEvent = timelineEvents.find(
          (event) => event.type === 'POKER_COMPLETE' && event.userId === viewerId
        )
        if (!timelineEvent) throw new Error('Timeline event not found')
        return timelineEvent
      }
    }
  })
})

const EndSprintPokerPayload = makeMutationPayload('EndSprintPokerPayload', EndSprintPokerSuccess)

export default EndSprintPokerPayload
