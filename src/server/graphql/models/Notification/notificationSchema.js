import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLString,
  GraphQLList,
  GraphQLEnumType
} from 'graphql';
import GraphQLISO8601Type from 'graphql-custom-datetype';
import {
  TRIAL_EXPIRES_SOON,
  TRIAL_EXPIRED,
  PAYMENT_REJECTED,
  PROMOTE_TO_BILLING_LEADER,
  REQUEST_NEW_USER,
  DENY_NEW_USER,
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

export const Notification = new GraphQLObjectType({
  name: 'Notification',
  description: 'A user notification',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The unique notification id (shortid)'},
    // endAt: {
    //   type: GraphQLISO8601Type,
    //   description: 'The datetime to deactivate the notification & stop sending it to the client'
    // },
    orgId: {
      type: GraphQLID,
      description: '*The unique organization ID for this notification. Can be blank for targeted notifications'
    },
    // parentId: {
    //   type: GraphQLID,
    //   description: '*Unique for the notification content. Not unique if the notification applies to multiple users'
    // },
    startAt: {
      type: GraphQLISO8601Type,
      description: 'The datetime to activate the notification & send it to the client'
    },
    type: {
      type: new GraphQLNonNull(NotificationType),
      description: 'The type of notification this is. Text will be determined by the client'
    },
    userIds: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLID))),
      description: '*The userId that should see this notification'
    },
    varList: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLString)),
      description: 'a list of variables to feed the notification and create a message client-side'
    }
  })
});

