import {
  DENY_NEW_USER,
  PAYMENT_REJECTED,
  PROMOTE_TO_BILLING_LEADER,
  REQUEST_NEW_USER,
  TRIAL_EXPIRES_SOON,
  TRIAL_EXPIRED
} from 'universal/utils/constants';
import DenyNewUser from 'universal/modules/notifications/components/DenyNewUser/DenyNewUser';
import TrialExpiresSoon from 'universal/modules/notifications/components/TrialExpiresSoon/TrialExpiresSoon';
import TrialExpired from 'universal/modules/notifications/components/TrialExpired/TrialExpired';
import PaymentRejected from 'universal/modules/notifications/components/PaymentRejected/PaymentRejected';
import PromoteToBillingLeader from 'universal/modules/notifications/components/PromoteToBillingLeader/PromoteToBillingLeader';
import RequestNewUser from 'universal/modules/notifications/components/RequestNewUser/RequestNewUser';

export default {
  [DENY_NEW_USER]: DenyNewUser,
  [PAYMENT_REJECTED]: PaymentRejected,
  [PROMOTE_TO_BILLING_LEADER]: PromoteToBillingLeader,
  [REQUEST_NEW_USER]: RequestNewUser,
  [TRIAL_EXPIRED]: TrialExpired,
  [TRIAL_EXPIRES_SOON]: TrialExpiresSoon,
};
