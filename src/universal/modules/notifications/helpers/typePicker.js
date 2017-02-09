import {
  REQUEST_NEW_USER,
  DENY_NEW_USER,
  TRIAL_EXPIRES_SOON,
  TRIAL_EXPIRED
} from 'universal/utils/constants';
import DenyNewUser from 'universal/modules/notifications/components/DenyNewUser/DenyNewUser';
import TrialExpiresSoon from 'universal/modules/notifications/components/TrialExpiresSoon/TrialExpiresSoon';
import RequestNewUser from 'universal/modules/notifications/components/RequestNewUser/RequestNewUser';

export default {
  [DENY_NEW_USER]: DenyNewUser,
  [TRIAL_EXPIRES_SOON]: TrialExpiresSoon,
  [REQUEST_NEW_USER]: RequestNewUser
};
