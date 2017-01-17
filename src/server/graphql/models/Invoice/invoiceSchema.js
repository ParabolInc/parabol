import {
  GraphQLObjectType,
  GraphQLEnumType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLInt,
  GraphQLFloat,
  GraphQLList,
  GraphQLUnionType,
  GraphQLBoolean
} from 'graphql';
import {GraphQLEmailType} from '../types';
import GraphQLISO8601Type from 'graphql-custom-datetype';
import {makeEnumValues} from 'server/graphql/models/utils';

const NEXT_MONTH_CHARGES = 'NEXT_MONTH_CHARGES';
const ADDED_USERS = 'ADDED_USERS';
const REMOVED_USERS = 'REMOVED_USERS';
const INACTIVITY_CREDITS = 'INACTIVITY_CREDITS';

/* Each invoice has 3 levels.
 * L1 is a the invoice itself: how much to pay.
 * L2 is 1 - 4 line items (next month charges, added users, removed users, inactivity credits) with a quantity
 * L3 is a detailed line item & is a breakdown of the L2 quantity (eg a user with the pause/unpause dates)
 */

export const LineItemType = new GraphQLEnumType({
  name: 'LineItemType',
  description: 'A big picture line item',
  values: makeEnumValues([
    NEXT_MONTH_CHARGES,
    ADDED_USERS,
    REMOVED_USERS,
    INACTIVITY_CREDITS
  ])
});

const DetailedLineItem = new GraphQLObjectType({
  name: 'DetailedLineItem',
  description: 'The per-user-action line item details,',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The unique detailed line item id'},
    email: {
      type: GraphQLEmailType,
      description: 'The email affected by this line item change'
    },
    parentId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The parent line item id'
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

const InvoiceLineItem = new GraphQLObjectType({
  name: 'InvoiceLineItem',
  description: 'A single line item charge on the invoice',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The unique line item id'},
    details: {
      type: new GraphQLList(new GraphQLNonNull(UserInactivityCreditType)),
      description: 'Array of user inactivity line items that roll up to total inactivity'
    },
    amount: {
      type: new GraphQLNonNull(GraphQLFloat),
      description: 'The amount for the line item (in USD)'
    },
    type: {
      type: LineItemType,
      description: 'The line item type for a monthly billing invoice'
    },
    quantity: {
      type: GraphQLInt,
      description: 'The total number of days that all org users have been inactive during the billing cycle'
    }
  })
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
    invoiceDate: {
      type: GraphQLISO8601Type,
      description: 'The date the invoice was created'
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
      description: 'An invoice line item for either the next month or an adjustment from the previous month charge'
    },
    orgId: {
      type: new GraphQLNonNull(GraphQLID),
      description: '*The organization id to charge'
    },
    // paid: {
    //   type: GraphQLBoolean,
    //   description: 'true if the invoice has been paid, else false'
    // }
  })
});
