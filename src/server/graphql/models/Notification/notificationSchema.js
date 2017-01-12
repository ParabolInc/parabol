import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLString,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLList,
  GraphQLUnionType
} from 'graphql';
import GraphQLISO8601Type from 'graphql-custom-datetype';
import {makeEnumValues, nonnullifyInputThunk} from '../utils';
import {
  CC_EXPIRING_SOON,
  DENY_NEW_USER,
  PAYMENT_REJECTED,
  REQUEST_NEW_USER,
  TRIAL_EXPIRES_SOON,
  TRIAL_EXPIRED,
  notificationTypes
} from 'universal/utils/constants';
import {creditCardFields} from 'server/graphql/models/Organization/organizationSchema';

export const NotificationType = new GraphQLEnumType({
  name: 'NotificationType',
  description: 'The kind of notification',
  values: makeEnumValues(notificationTypes)
});

const baseFields = {
  id: {type: new GraphQLNonNull(GraphQLID), description: 'The unique notification id (shortid)'},
  endAt: {
    type: GraphQLISO8601Type,
    description: 'The datetime to deactivate the notification & stop sending it to the client'
  },
  orgId: {
    type: GraphQLID,
    description: '*The unique organization ID for this notification. Can be blank for targeted notifications'
  },
  parentId: {
    type: GraphQLID,
    description: '*Unique for the notification content. Not unique if the notification applies to multiple users'
  },
  startAt: {
    type: GraphQLISO8601Type,
    description: 'The datetime to activate the notification & send it to the client'
  },
  type: {
    type: new GraphQLNonNull(NotificationType),
    description: 'The type of notification this is. Text will be determined by the client'
  },
  userId: {
    type: GraphQLID,
    description: '*The userId that should see this notification'
  },
};

const CCWillExpireType = new GraphQLObjectType({
  name: 'CCWillExpireType',
  fields: () => ({
    ...baseFields,
    ...creditCardFields
  })
});

const DenyUserToOrgType = new GraphQLObjectType({
  name: 'DenyUserToOrgType',
  fields: () => ({
    ...baseFields,
    reason: {
      type: GraphQLString,
      description: 'The user-defined reason to not accept the addition to the org'
    },
    leaderName: {
      type: GraphQLString,
      description: 'The name of the billing leader that denied the addition'
    }
  })
});

const PaymentRejectedType = new GraphQLObjectType({
  name: 'PaymentRejectedType',
  fields: () => ({
    ...baseFields,
    brand: {
      type: GraphQLString,
      description: 'The brand of the credit card that failed'
    },
    errorMessage: {
      type: GraphQLString,
      description: 'The reason the card payment failed, sent from stripe'
    },
    last4: {
      type: GraphQLString,
      description: 'The last 4 digits of the rejected credit card'
    },

  })
});

const TrialExpirationType = new GraphQLObjectType({
  name: 'TrialExpirationType',
  fields: () => ({
    ...baseFields,
    trialExpiresAt: {
      type: GraphQLISO8601Type,
      description: 'The datetime the trial is set to expire'
    }
  })
});

const RequestNewUserType = new GraphQLObjectType({
  name: 'RequestNewUserType',
  fields: () => ({
    ...baseFields,
    inviterName: {
      type: GraphQLISO8601Type,
      description: 'The name of the team member that invited the user. This will not update if they change their name'
    },
    inviterId: {
      type: GraphQLID,
      description: 'The teamMemberId of the inviter.'
    },
    inviteeEmail: {
      type: GraphQLString,
      description: 'The email address of the person to invite to the team'
    },
    teamName: {
      type: GraphQLString,
      description: 'The team name of the invitee. This will not update if they change their team name'
    }
  })
});

const typeLookup = {
  [CC_EXPIRING_SOON]: CCWillExpireType,
  [DENY_NEW_USER]: DenyUserToOrgType,
  [REQUEST_NEW_USER]: RequestNewUserType,
  [TRIAL_EXPIRES_SOON]: TrialExpirationType,
  [TRIAL_EXPIRED]: TrialExpirationType,
  [PAYMENT_REJECTED]: PaymentRejectedType
};

export const Notification = new GraphQLUnionType({
  name: 'Notification',
  description: 'A short-term project for a team member',
  resolveType({type}) {
    return typeLookup[type];
  },
  types: Object.values(typeLookup)
});
