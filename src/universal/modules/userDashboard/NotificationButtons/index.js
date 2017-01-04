import React from 'react';
import {
  REQUEST_NEW_USER,
  ACCEPT_NEW_USER,
  DENY_NEW_USER,
  TRIAL_EXPIRES_SOON
} from 'universal/utils/constants';
import TrialExpiresSoon from './TrialExpiresSoon';
import RequestNewUser from './RequestNewUser';
import fromNow from 'universal/utils/fromNow';
import FontAwesome from 'react-fontawesome';
import AvatarPlaceholder from 'universal/components/AvatarPlaceholder/AvatarPlaceholder';

export default {
  [TRIAL_EXPIRES_SOON]: {
    Buttons: TrialExpiresSoon,
    makeContent: (varList) => {
      const expiresAt =  varList[0];
      const daysLeft = fromNow(expiresAt);
      return `You're free trial will expire in ${daysLeft}. Want another free month? Just add your billing info`;
    },
    makeIcon: () => <AvatarPlaceholder/>
  },
  [REQUEST_NEW_USER]: {
    Buttons: RequestNewUser,
  }
};

