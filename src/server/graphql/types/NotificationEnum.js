import {GraphQLEnumType} from 'graphql'
import {
  FACILITATOR_DISCONNECTED,
  KICKED_OUT,
  PAYMENT_REJECTED,
  TASK_INVOLVES,
  PROMOTE_TO_BILLING_LEADER,
  TEAM_ARCHIVED,
  VERSION_INFO,
  TEAM_INVITATION
} from 'universal/utils/constants'

const NotificationEnum = new GraphQLEnumType({
  name: 'NotificationEnum',
  description: 'The kind of notification',
  values: {
    [FACILITATOR_DISCONNECTED]: {},
    [KICKED_OUT]: {},
    [PAYMENT_REJECTED]: {},
    [TASK_INVOLVES]: {},
    [TEAM_INVITATION]: {},
    [TEAM_ARCHIVED]: {},
    [VERSION_INFO]: {},
    [PROMOTE_TO_BILLING_LEADER]: {}
  }
})

export default NotificationEnum
