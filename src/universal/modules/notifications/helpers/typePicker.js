import {
  DENY_NEW_USER,
  PROMOTE_TO_BILLING_LEADER,
  REQUEST_NEW_USER,
  TRIAL_EXPIRES_SOON,
  TRIAL_EXPIRED
} from 'universal/utils/constants';
import DenyNewUser from 'universal/modules/notifications/components/DenyNewUser/DenyNewUser';
import TrialExpiresSoon from 'universal/modules/notifications/components/TrialExpiresSoon/TrialExpiresSoon';
import PromoteToBillingLeader from 'universal/modules/notifications/components/PromoteToBillingLeader/PromoteToBillingLeader';
import RequestNewUser from 'universal/modules/notifications/components/RequestNewUser/RequestNewUser';

export default {
  [DENY_NEW_USER]: DenyNewUser,
  [PROMOTE_TO_BILLING_LEADER]: PromoteToBillingLeader,
  [REQUEST_NEW_USER]: RequestNewUser,
  [TRIAL_EXPIRES_SOON]: TrialExpiresSoon
};
