import {GraphQLEnumType} from 'graphql';
import {
  DENY_NEW_USER,
  PAYMENT_REJECTED,
  PROMOTE_TO_BILLING_LEADER,
  REQUEST_NEW_USER,
  TRIAL_EXPIRED,
  TRIAL_EXPIRES_SOON
} from 'universal/utils/constants';

const NotificationEnum = new GraphQLEnumType({
  name: 'NotificationEnum',
  description: 'The kind of notification',
  values: {
    [TRIAL_EXPIRES_SOON]: {},
    [TRIAL_EXPIRED]: {},
    [PAYMENT_REJECTED]: {},
    [PROMOTE_TO_BILLING_LEADER]: {},
    [REQUEST_NEW_USER]: {},
    [DENY_NEW_USER]: {}
  }
});

export default NotificationEnum;