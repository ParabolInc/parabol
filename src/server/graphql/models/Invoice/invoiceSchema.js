import {
  GraphQLObjectType,
  GraphQLEnumType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLInt,
  GraphQLFloat,
  GraphQLList,
  GraphQLUnionType
} from 'graphql';
import {GraphQLEmailType} from '../types';
import GraphQLISO8601Type from 'graphql-custom-datetype';
import {makeEnumValues} from '../utils';

const SUBSCRIPTION_LINE_ITEM = 'SUBSCRIPTION_LINE_ITEM';
const TOTAL_INACTIVITY_CREDIT = 'TOTAL_INACTIVITY_CREDIT';
const USER_INACTIVITY_CREDIT = 'USER_INACTIVITY_CREDIT';

export const LineItemType = new GraphQLEnumType({
  name: 'LineItemType',
  description: 'The kind of notification',
  values: makeEnumValues([
    SUBSCRIPTION_LINE_ITEM,
    TOTAL_INACTIVITY_CREDIT,
    USER_INACTIVITY_CREDIT
  ])
});

const baseFields = {
  id: {type: new GraphQLNonNull(GraphQLID), description: 'The unique line item id'},
  amount: {
    type: new GraphQLNonNull(GraphQLFloat),
    description: 'The amount for the line item (in USD)'
  },
  type: {
    type: LineItemType,
    description: 'The line item type for a monthly billing invoice'
  }
};

const SubscriptionLineItemType = new GraphQLObjectType({
  type: 'SubscriptionLineItemType',
  description: 'Billing for all users on the org',
  fields: () => ({
    ...baseFields,
    quantity: {
      type: GraphQLInt,
      description: 'The number of users in the org, regardless of active status'
    },

  })
});

const UserInactivityCreditType = new GraphQLObjectType({
  type: 'UserInactivityCreditType',
  description: 'User-specific refunds for a particular date range (many could exist in the same billing cycle)',
  fields: () => ({
    ...baseFields,
    email: {
      type: GraphQLEmailType,
      description: 'The email linked to the org member that is receiving the credit'
    },
    quantity: {
      type: GraphQLInt,
      description: 'The number of days that are not being charged'
    },
    startAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp for the beginning of the period of no charge'
    },
    endAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp for the end of the period of no charge'
    },
  })
});

const TotalInactivityCreditType = new GraphQLObjectType({
  type: 'TotalInactivityCreditType',
  description: 'Refunds for new, removed, and inactive users',
  fields: () => ({
    ...baseFields,
    quantity: {
      type: GraphQLInt,
      description: 'The total number of days that all org users have been inactive during the billing cycle'
    },
    details: {
      type: new GraphQLList(new GraphQLNonNull(UserInactivityCreditType)),
      description: 'Array of user inactivity line items that roll up to total inactivity'
    }
  })
});

const typeLookup = {
  [SUBSCRIPTION_LINE_ITEM]: SubscriptionLineItemType,
  [TOTAL_INACTIVITY_CREDIT]: TotalInactivityCreditType,
  [USER_INACTIVITY_CREDIT]: UserInactivityCreditType
};

const InvoiceLineItem = new GraphQLUnionType({
  name: 'InvoiceLineItem',
  description: 'A single line item charge on the invoice',
  resolveType: ({type}) => {
    return typeLookup[type];
  },
  types: Object.values(typeLookup)
});

export const Invoice = new GraphQLObjectType({
  name: 'Invoice',
  description: 'A monthly billing invoice for an organization',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The unique invoice Id'},
    amount: {
      type: GraphQLFloat,
      description: 'The total amount for the invoice (in USD)'
    },
    startAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp for the beginning of the billing cycle'
    },
    endAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp for the end of the billing cycle'
    },
    lineItem: {
      type: new GraphQLList(new GraphQLNonNull(InvoiceLineItem)),
      description: 'An invoice line item for a charge'
    },
    paidAt: {
      type: GraphQLISO8601Type,
      description: 'The datetime the invoice received an approved payment'
    }
  })
});
