import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import NewMeeting from './NewMeeting'
import Notification, {notificationInterfaceFields} from './Notification'
import {NotificationEnumType} from './NotificationEnum'
import TeamNotification from './TeamNotification'

const NotificationMeetingStageTimeLimitEnd = new GraphQLObjectType<any, GQLContext>({
  name: 'NotificationMeetingStageTimeLimitEnd',
  description: 'A notification sent to a facilitator that the stage time limit has ended',
  interfaces: () => [Notification, TeamNotification],
  isTypeOf: ({type}: {type: NotificationEnumType}) => type === 'MEETING_STAGE_TIME_LIMIT_END',
  fields: () => ({
    ...notificationInterfaceFields,
    meetingId: {
      description: 'FK',
      type: new GraphQLNonNull(GraphQLID)
    },
    meeting: {
      description: 'The meeting that had the time limit expire',
      type: new GraphQLNonNull(NewMeeting),
      resolve: async ({meetingId}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('newMeetings').load(meetingId)
      }
    }
  })
})

export default NotificationMeetingStageTimeLimitEnd
