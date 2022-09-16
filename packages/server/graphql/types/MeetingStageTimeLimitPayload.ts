import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import NotificationMeetingStageTimeLimitEnd from './NotificationMeetingStageTimeLimitEnd'

const MeetingStageTimeLimitPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'MeetingStageTimeLimitPayload',
  fields: () => ({
    notification: {
      type: new GraphQLNonNull(NotificationMeetingStageTimeLimitEnd),
      description: 'The new notification that was just created'
    }
  })
})

export default MeetingStageTimeLimitPayload
