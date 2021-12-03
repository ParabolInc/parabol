import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import RetrospectiveMeeting from './RetrospectiveMeeting'
import Team from './Team'
import TimelineEvent, {timelineEventInterfaceFields} from './TimelineEvent'
import {COMPLETED_RETRO_MEETING} from './TimelineEventTypeEnum'

const TimelineEventCompletedRetroMeeting = new GraphQLObjectType<any>({
  name: 'TimelineEventCompletedRetroMeeting',
  description: 'An event for a completed retro meeting',
  interfaces: () => [TimelineEvent],
  isTypeOf: ({type}) => type === COMPLETED_RETRO_MEETING,
  fields: () => ({
    ...timelineEventInterfaceFields(),
    meeting: {
      type: new GraphQLNonNull(RetrospectiveMeeting),
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

export default TimelineEventCompletedRetroMeeting
