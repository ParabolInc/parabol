import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import NotificationMeetingStageTimeLimit from 'server/graphql/types/NotificationMeetingStageTimeLimit'

const MeetingStageTimeLimitPayload = new GraphQLObjectType({
  name: 'MeetingStageTimeLimitPayload',
  fields: () => ({
    notification: {
      type: new GraphQLNonNull(NotificationMeetingStageTimeLimit),
      description: 'The new notification that was just created'
    }
  })
})

export default MeetingStageTimeLimitPayload
