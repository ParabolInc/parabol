import {GraphQLEnumType} from 'graphql';
import {
  ADD_TO_TEAM,
  DENY_NEW_USER,
  FACILITATOR_DISCONNECTED,
  FACILITATOR_REQUEST,
  INVITEE_APPROVED,
  JOIN_TEAM,
  KICKED_OUT,
  PAYMENT_REJECTED,
  PROJECT_INVOLVES,
  PROMOTE_TO_BILLING_LEADER,
  REJOIN_TEAM,
  REQUEST_NEW_USER,
  TEAM_ARCHIVED,
  TEAM_INVITE,
  VERSION_INFO
} from 'universal/utils/constants';

const NotificationEnum = new GraphQLEnumType({
  name: 'NotificationEnum',
  description: 'The kind of notification',
  values: {
    [ADD_TO_TEAM]: {},
    [DENY_NEW_USER]: {},
    [FACILITATOR_DISCONNECTED]: {},
    [FACILITATOR_REQUEST]: {},
    [INVITEE_APPROVED]: {},
    [JOIN_TEAM]: {},
    [KICKED_OUT]: {},
    [PAYMENT_REJECTED]: {},
    [PROJECT_INVOLVES]: {},
    [REJOIN_TEAM]: {},
    [REQUEST_NEW_USER]: {},
    [TEAM_INVITE]: {},
    [TEAM_ARCHIVED]: {},
    [VERSION_INFO]: {},
    [PROMOTE_TO_BILLING_LEADER]: {}
  }
});

export default NotificationEnum;
