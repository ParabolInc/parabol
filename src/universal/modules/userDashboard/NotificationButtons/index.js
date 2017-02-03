// import React from 'react';
import {
  REQUEST_NEW_USER,
  ACCEPT_NEW_USER,
  DENY_NEW_USER,
  TRIAL_EXPIRES_SOON
} from 'universal/utils/constants';
import TrialExpiresSoon from './TrialExpiresSoon';
import RequestNewUser from './RequestNewUser';
export default {
  [TRIAL_EXPIRES_SOON]: TrialExpiresSoon,
  [REQUEST_NEW_USER]: RequestNewUser
};
