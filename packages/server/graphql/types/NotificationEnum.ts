import {GraphQLEnumType} from 'graphql'

const NotificationEnum = new GraphQLEnumType({
  name: 'NotificationEnum',
  description: 'The kind of notification',
  values: {
    KICKED_OUT: {},
    PAYMENT_REJECTED: {},
    PROMOTE_TO_BILLING_LEADER: {},
    TEAM_INVITATION: {},
    TEAM_ARCHIVED: {},
    TASK_INVOLVES: {},
    MEETING_STAGE_TIME_LIMIT_END: {}
  }
})

export default NotificationEnum
