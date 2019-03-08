import {
  KICKED_OUT,
  PAYMENT_REJECTED,
  PROMOTE_TO_BILLING_LEADER,
  TASK_INVOLVES,
  TEAM_ARCHIVED,
  TEAM_INVITATION
} from 'universal/utils/constants'

export default {
  [KICKED_OUT]: () =>
    import(/* webpackChunkName: 'KickedOut' */ 'universal/modules/notifications/components/KickedOut'),
  [PAYMENT_REJECTED]: () =>
    import(/* webpackChunkName: 'PaymentRejected' */ 'universal/modules/notifications/components/PaymentRejected/PaymentRejected'),
  [TASK_INVOLVES]: () =>
    import(/* webpackChunkName: 'TaskInvolves' */ 'universal/modules/notifications/components/TaskInvolves'),
  [PROMOTE_TO_BILLING_LEADER]: () =>
    import(/* webpackChunkName: 'PromoteToBillingLeader' */ 'universal/modules/notifications/components/PromoteToBillingLeader/PromoteToBillingLeader'),
  [TEAM_ARCHIVED]: () =>
    import(/* webpackChunkName: 'TeamArchived' */ 'universal/modules/notifications/components/TeamArchived/TeamArchived'),
  [TEAM_INVITATION]: () =>
    import(/* webpackChunkName: 'TeamInvitation' */ 'universal/modules/notifications/components/TeamInvitation')
}
