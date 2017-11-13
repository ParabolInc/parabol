import {
  ADD_TO_TEAM,
  DENY_NEW_USER,
  INVITEE_APPROVED,
  KICKED_OUT,
  PAYMENT_REJECTED,
  PROMOTE_TO_BILLING_LEADER,
  REQUEST_NEW_USER,
  TEAM_ARCHIVED, TEAM_INVITE
} from 'universal/utils/constants';

export default {
  [ADD_TO_TEAM]: () => System.import('universal/modules/notifications/components/AddedToTeam/AddedToTeam'),
  [DENY_NEW_USER]: () => System.import('universal/modules/notifications/components/DenyNewUser/DenyNewUser'),
  [INVITEE_APPROVED]: () => System.import('universal/modules/notifications/components/InviteeApproved'),
  [KICKED_OUT]: () => System.import('universal/modules/notifications/components/KickedOut'),
  [PAYMENT_REJECTED]: () => System.import('universal/modules/notifications/components/PaymentRejected/PaymentRejected'),
  // eslint-disable-next-line max-len
  [PROMOTE_TO_BILLING_LEADER]: () => System.import('universal/modules/notifications/components/PromoteToBillingLeader/PromoteToBillingLeader'),
  [REQUEST_NEW_USER]: () => System.import('universal/modules/notifications/components/RequestNewUser/RequestNewUser'),
  [TEAM_ARCHIVED]: () => System.import('universal/modules/notifications/components/TeamArchived/TeamArchived'),
  [TEAM_INVITE]: () => System.import('universal/modules/notifications/components/TeamInvite/TeamInvite')
};
