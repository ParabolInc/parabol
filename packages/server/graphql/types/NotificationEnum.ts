import {GraphQLEnumType} from 'graphql'

export type NotificationEnumType =
  | 'KICKED_OUT'
  | 'PAYMENT_REJECTED'
  | 'TASK_INVOLVES'
  | 'PROMOTE_TO_BILLING_LEADER'
  | 'TEAM_ARCHIVED'
  | 'TEAM_INVITATION'
  | 'MEETING_STAGE_TIME_LIMIT_END'
  | 'TEAMS_LIMIT_EXCEEDED'
  | 'TEAMS_LIMIT_REMINDER'

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
    MEETING_STAGE_TIME_LIMIT_END: {},
    TEAMS_LIMIT_EXCEEDED: {},
    TEAMS_LIMIT_REMINDER: {}
  }
})

export default NotificationEnum
