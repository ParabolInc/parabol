import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import Notification, {notificationInterfaceFields} from 'server/graphql/types/Notification'
import TeamNotification from 'server/graphql/types/TeamNotification'
import NewMeeting from './NewMeeting'
import {GQLContext} from 'server/graphql/graphql'

const NotificationMeetingStageTimeLimitEnd = new GraphQLObjectType<any, GQLContext, any>({
  name: 'NotificationMeetingStageTimeLimitEnd',
  description: 'A notification sent to a facilitator that the stage time limit has ended',
  interfaces: () => [Notification, TeamNotification],
  fields: () => ({
    ...notificationInterfaceFields,
    meetingId: {
      description: 'FK',
      type: new GraphQLNonNull(GraphQLID)
    },
    meeting: {
      description: 'The meeting that had the time limit expire',
      type: new GraphQLNonNull(NewMeeting),
      resolve: async ({meetingId}, _args, {dataLoader}) => {
        return dataLoader.get('newMeetings').load(meetingId)
      }
    }
  })
})

export default NotificationMeetingStageTimeLimitEnd
