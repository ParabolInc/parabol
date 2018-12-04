import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import RetrospectiveMeeting from 'server/graphql/types/RetrospectiveMeeting'
import TimelineEvent, {timelineEventInterfaceFields} from './TimelineEvent'

const TimelineEventCompletedRetroMeeting = new GraphQLObjectType({
  name: 'TimelineEventCompletedRetroMeeting',
  description: 'An event for a completed retro meeting',
  interfaces: () => [TimelineEvent],
  fields: () => ({
    ...timelineEventInterfaceFields(),
    meeting: {
      type: new GraphQLNonNull(RetrospectiveMeeting),
      description: 'The meeting that was completed',
      resolve: ({meetingId}, _args, {dataLoader}) => {
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
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The teamId this event is associated with'
    }
  })
})

export default TimelineEventCompletedRetroMeeting
