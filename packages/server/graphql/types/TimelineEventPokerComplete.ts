import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import PokerMeeting from './PokerMeeting'
import Team from './Team'
import TimelineEvent, {timelineEventInterfaceFields} from './TimelineEvent'

const TimelineEventPokerComplete = new GraphQLObjectType<any>({
  name: 'TimelineEventPokerComplete',
  description: 'An event for a completed poker meeting',
  interfaces: () => [TimelineEvent],
  isTypeOf: ({type}) => type === 'POKER_COMPLETE',
  fields: () => ({
    ...timelineEventInterfaceFields(),
    meeting: {
      type: new GraphQLNonNull(PokerMeeting),
      description: 'The meeting that was completed',
      resolve: ({meetingId}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('newMeetings').load(meetingId)
      }
    },
    meetingId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The meetingId that was completed'
    },
    orgId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The orgId this event is associated with'
    },
    team: {
      type: new GraphQLNonNull(Team),
      description: 'The team that can see this event',
      resolve: ({teamId}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('teams').load(teamId)
      }
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The teamId this event is associated with'
    }
  })
})

export default TimelineEventPokerComplete
