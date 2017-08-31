import {GraphQLEnumType, GraphQLID, GraphQLInterfaceType, GraphQLList, GraphQLNonNull} from 'graphql';
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type';
import {
  DENY_NEW_USER,
  PAYMENT_REJECTED,
  PROMOTE_TO_BILLING_LEADER,
  REQUEST_NEW_USER,
  TRIAL_EXPIRED,
  TRIAL_EXPIRES_SOON
} from 'universal/utils/constants';


export const NotificationType = new GraphQLEnumType({
  name: 'NotificationType',
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

const resolveTypeLookup = {
  [FACILITATOR_REQUEST]: FacilitatorRequestMemo,
  [ADD_TO_TEAM]: AddToTeamMemo
};

const Notification = new GraphQLInterfaceType({
  name: 'Notification',
  fields: {
    type: {
      id: {type: new GraphQLNonNull(GraphQLID), description: 'The unique notification id (shortid)'},
      type: NotificationType
    },
    orgId: {
      type: GraphQLID,
      description: '*The unique organization ID for this notification. Can be blank for targeted notifications'
    },
    startAt: {
      type: GraphQLISO8601Type,
      description: 'The datetime to activate the notification & send it to the client'
    },
    userIds: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLID))),
      description: '*The userId that should see this notification'
    },
    varList: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLString)),
      description: 'a list of variables to feed the notification and create a message client-side'
    }
  },
  resolveType(value) {
    return resolveTypeLookup[value.type];
  }
});