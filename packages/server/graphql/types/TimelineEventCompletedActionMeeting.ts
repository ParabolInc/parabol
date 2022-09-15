import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import ActionMeeting from './ActionMeeting'
import Team from './Team'
import TimelineEvent, {timelineEventInterfaceFields} from './TimelineEvent'
import {COMPLETED_ACTION_MEETING} from './TimelineEventTypeEnum'

const TimelineEventCompletedActionMeeting = new GraphQLObjectType<any>({
  name: 'TimelineEventCompletedActionMeeting',
  description: 'An event for a completed action meeting',
  interfaces: () => [TimelineEvent],
  isTypeOf: ({type}) => type === COMPLETED_ACTION_MEETING,
  fields: () => ({
    ...timelineEventInterfaceFields(),
    meeting: {
      type: new GraphQLNonNull(ActionMeeting),
      description: 'The meeting that was completed',
      resolve: ({meetingId}, _args: unknown, {dataLoader}) => {
        return meetingId ? dataLoader.get('newMeetings').load(meetingId) : null
      }
    },
    meetingId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The meetingId that was completed, null if legacyMeetingId is present'
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

export default TimelineEventCompletedActionMeeting
