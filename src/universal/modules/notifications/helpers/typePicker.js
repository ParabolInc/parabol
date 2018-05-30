import {
  ADD_TO_TEAM,
  DENY_NEW_USER,
  INVITEE_APPROVED,
  KICKED_OUT,
  PAYMENT_REJECTED,
  TASK_INVOLVES,
  PROMOTE_TO_BILLING_LEADER,
  REQUEST_NEW_USER,
  TEAM_ARCHIVED,
  TEAM_INVITE
} from 'universal/utils/constants'

export default {
  [ADD_TO_TEAM]: () => import('universal/modules/notifications/components/AddedToTeam/AddedToTeam'),
  [DENY_NEW_USER]: () =>
    import('universal/modules/notifications/components/DenyNewUser/DenyNewUser'),
  [INVITEE_APPROVED]: () => import('universal/modules/notifications/components/InviteeApproved'),
  [KICKED_OUT]: () => import('universal/modules/notifications/components/KickedOut'),
  [PAYMENT_REJECTED]: () =>
    import('universal/modules/notifications/components/PaymentRejected/PaymentRejected'),
  [TASK_INVOLVES]: () => import('universal/modules/notifications/components/TaskInvolves'),
  // eslint-disable-next-line max-len
  [PROMOTE_TO_BILLING_LEADER]: () =>
    import('universal/modules/notifications/components/PromoteToBillingLeader/PromoteToBillingLeader'),
  [REQUEST_NEW_USER]: () =>
    import('universal/modules/notifications/components/RequestNewUser/RequestNewUser'),
  [TEAM_ARCHIVED]: () =>
    import('universal/modules/notifications/components/TeamArchived/TeamArchived'),
  [TEAM_INVITE]: () => import('universal/modules/notifications/components/TeamInvite/TeamInvite')
}
