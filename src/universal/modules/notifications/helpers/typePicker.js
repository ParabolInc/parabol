import {
  DENY_NEW_USER,
  PAYMENT_REJECTED,
  PROMOTE_TO_BILLING_LEADER,
  REQUEST_NEW_USER,
  TEAM_ARCHIVED,
  TRIAL_EXPIRED,
  TRIAL_EXPIRES_SOON
} from 'universal/utils/constants';

export default {
  [DENY_NEW_USER]: () => System.import('universal/modules/notifications/components/DenyNewUser/DenyNewUser'),
  [PAYMENT_REJECTED]: () => System.import('universal/modules/notifications/components/PaymentRejected/PaymentRejected'),
  [PROMOTE_TO_BILLING_LEADER]: () => System.import('universal/modules/notifications/components/PromoteToBillingLeader/PromoteToBillingLeader'),
  [REQUEST_NEW_USER]: () => System.import('universal/modules/notifications/components/RequestNewUser/RequestNewUser'),
  [TRIAL_EXPIRED]: () => System.import('universal/modules/notifications/components/TrialExpired/TrialExpired'),
  [TRIAL_EXPIRES_SOON]: () => System.import('universal/modules/notifications/components/TrialExpiresSoon/TrialExpiresSoon'),
  [TEAM_ARCHIVED]: () => System.import('universal/modules/notifications/components/TeamArchived/TeamArchived')
};
