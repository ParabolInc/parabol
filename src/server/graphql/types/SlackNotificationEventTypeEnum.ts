import {GraphQLEnumType} from 'graphql'

const SlackNotificationEventTypeEnum = new GraphQLEnumType({
  name: 'SlackNotificationEventTypeEnum',
  description: 'The type of event for a slack notification',
  values: {
    team: {
      value: 'team',
      description: 'notification that concerns the whole team'
    },
    member: {
      value: 'member',
      description: 'notification that concerns a single member on the team'
    }
  }
})

export default SlackNotificationEventTypeEnum
