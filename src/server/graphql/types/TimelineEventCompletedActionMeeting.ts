import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import Meeting from 'server/graphql/types/Meeting'
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
      type: new GraphQLNonNull(Meeting),
      description: 'The meeting that was completed',
      resolve: ({meetingId, legacyMeetingId}, _args, {dataLoader}) => {
        if (meetingId) {
          return dataLoader.get('newMeetings').load(meetingId)
        }
        return dataLoader.get('meetings').load(legacyMeetingId)
      }
    },
    meetingId: {
      type: GraphQLID,
      description: 'The meetingId that was completed, null if legacyMeetingId is present'
    },
    legacyMeetingId: {
      type: GraphQLID,
      description: 'a meetingId to be used with legacy action meetings'
    },
    orgId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The orgId this event is associated with'
    },
    team: {
      type: new GraphQLNonNull(Team),
      description: 'The team that can see this event',
      resolve: ({teamId}, _args, {dataLoader}) => {
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
