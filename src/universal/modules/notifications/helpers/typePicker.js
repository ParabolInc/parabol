import {
  ADD_TO_TEAM,
  DENY_NEW_USER,
  INVITEE_APPROVED,
  KICKED_OUT,
  PAYMENT_REJECTED,
  PROMOTE_TO_BILLING_LEADER,
  REQUEST_NEW_USER,
  TASK_INVOLVES,
  TEAM_ARCHIVED,
  TEAM_INVITATION,
  TEAM_INVITE
} from 'universal/utils/constants'

export default {
  [ADD_TO_TEAM]: () =>
    import(/* webpackChunkName: 'AddedToTeam' */ 'universal/modules/notifications/components/AddedToTeam/AddedToTeam'),
  [DENY_NEW_USER]: () =>
    import(/* webpackChunkName: 'DenyNewUser' */ 'universal/modules/notifications/components/DenyNewUser/DenyNewUser'),
  [INVITEE_APPROVED]: () =>
    import(/* webpackChunkName: 'InviteeApproved' */ 'universal/modules/notifications/components/InviteeApproved'),
  [KICKED_OUT]: () =>
    import(/* webpackChunkName: 'KickedOut' */ 'universal/modules/notifications/components/KickedOut'),
  [PAYMENT_REJECTED]: () =>
    import(/* webpackChunkName: 'PaymentRejected' */ 'universal/modules/notifications/components/PaymentRejected/PaymentRejected'),
  [TASK_INVOLVES]: () =>
    import(/* webpackChunkName: 'TaskInvolves' */ 'universal/modules/notifications/components/TaskInvolves'),
  // eslint-disable-next-line max-len
  [PROMOTE_TO_BILLING_LEADER]: () =>
    import(/* webpackChunkName: 'PromoteToBillingLeader' */ 'universal/modules/notifications/components/PromoteToBillingLeader/PromoteToBillingLeader'),
  [REQUEST_NEW_USER]: () =>
    import(/* webpackChunkName: 'RequestNewUser' */ 'universal/modules/notifications/components/RequestNewUser/RequestNewUser'),
  [TEAM_ARCHIVED]: () =>
    import(/* webpackChunkName: 'TeamArchived' */ 'universal/modules/notifications/components/TeamArchived/TeamArchived'),
  [TEAM_INVITE]: () =>
    import(/* webpackChunkName: 'TeamInvite' */ 'universal/modules/notifications/components/TeamInvite/TeamInvite'),
  [TEAM_INVITATION]: () =>
    import(/* webpackChunkName: 'TeamInvite' */ 'universal/modules/notifications/components/TeamInvitation')
}
