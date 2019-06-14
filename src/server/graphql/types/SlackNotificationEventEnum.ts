import {GraphQLEnumType} from 'graphql'

const SlackNotificationEventEnum = new GraphQLEnumType({
  name: 'SlackNotificationEventEnum',
  description: 'The event that triggers a slack notification',
  values: {
    meetingStart: {},
    meetingEnd: {},
    MEETING_STAGE_TIME_LIMIT: {}, // user event
    meetingNextStageReady: {}
  }
})

export default SlackNotificationEventEnum
