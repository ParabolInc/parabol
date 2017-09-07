import {GraphQLEnumType} from 'graphql';
import {
  ADD_TO_TEAM,
  DENY_NEW_USER,
  FACILITATOR_REQUEST,
  PAYMENT_REJECTED,
  PROMOTE_TO_BILLING_LEADER,
  REQUEST_NEW_USER,
  TEAM_ARCHIVED,
  TEAM_INVITE,
  TRIAL_EXPIRED,
  TRIAL_EXPIRES_SOON
} from 'universal/utils/constants';

const NotificationEnum = new GraphQLEnumType({
  name: 'NotificationEnum',
  description: 'The kind of notification',
  values: {
    [ADD_TO_TEAM]: {},
    [DENY_NEW_USER]: {},
    [FACILITATOR_REQUEST]: {},
    [TRIAL_EXPIRES_SOON]: {},
    [TRIAL_EXPIRED]: {},
    [PAYMENT_REJECTED]: {},
    [REQUEST_NEW_USER]: {},
    [TEAM_INVITE]: {},
    [TEAM_ARCHIVED]: {},
    [PROMOTE_TO_BILLING_LEADER]: {}
  }
});

export default NotificationEnum;