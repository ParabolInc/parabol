import {GraphQLEnumType} from 'graphql'

const SlackNotificationEventEnum = new GraphQLEnumType({
  name: 'SlackNotificationEventEnum',
  description: 'The event that triggers a slack notification',
  values: {
    meetingStart: {},
    meetingEnd: {},
    MEETING_STAGE_TIME_LIMIT_END: {}, // user event
    MEETING_STAGE_TIME_LIMIT_START: {}
  }
})

export default SlackNotificationEventEnum
