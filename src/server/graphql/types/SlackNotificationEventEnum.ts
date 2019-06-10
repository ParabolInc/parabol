import {GraphQLEnumType} from 'graphql'

const SlackNotificationEventEnum = new GraphQLEnumType({
  name: 'SlackNotificationEventEnum',
  description: 'The event that triggers a slack notification',
  values: {
    meetingStart: {},
    meetingEnd: {}
  }
})

export default SlackNotificationEventEnum
