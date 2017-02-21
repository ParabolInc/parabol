import {
  GraphQLObjectType,
  GraphQLEnumType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLInt,
  GraphQLFloat,
  GraphQLList,
  GraphQLUnionType,
  GraphQLBoolean,
  GraphQLString
} from 'graphql';
import {GraphQLEmailType} from '../../types';
import GraphQLISO8601Type from 'graphql-custom-datetype';
import makeEnumValues from 'server/graphql/makeEnumValues';

export const NEXT_MONTH_CHARGES = 'NEXT_MONTH_CHARGES';
export const ADDED_USERS = 'ADDED_USERS';
export const REMOVED_USERS = 'REMOVED_USERS';
export const INACTIVITY_ADJUSTMENTS = 'INACTIVITY_ADJUSTMENTS';
export const OTHER_ADJUSTMENTS = 'OTHER_ADJUSTMENTS';
export const PREVIOUS_BALANCE = 'PREVIOUS_BALANCE';


/* Invoice status variables */
export const PENDING = 'PENDING';
export const PAID = 'PAID';
export const UNPAID = 'UNPAID';

/* Each invoice has 3 levels.
 * L1 is a the invoice itself: how much to pay.
 * L2 is line items (next month charges, added users, removed users, inactivity credits, previousBalance) with a quantity
 * L3 is a detailed line item & is a breakdown of the L2 quantity (eg a user with the pause/unpause dates)
 */

export const LineItemType = new GraphQLEnumType({
  name: 'LineItemType',
  description: 'A big picture line item',
  values: makeEnumValues([
    ADDED_USERS,
    INACTIVITY_ADJUSTMENTS,
    NEXT_MONTH_CHARGES,
    OTHER_ADJUSTMENTS,
    PREVIOUS_BALANCE,
    REMOVED_USERS
  ])
});

const DetailedLineItem = new GraphQLObjectType({
  name: 'DetailedLineItem',
  description: 'The per-user-action line item details,',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The unique detailed line item id'},
    amount: {
      type: new GraphQLNonNull(GraphQLFloat),
      description: 'The amount for the line item (in USD)'
    },
    email: {
      type: GraphQLEmailType,
      description: 'The email affected by this line item change'
    },
    endAt: {
      type: GraphQLISO8601Type,
      description: `End of the event. Only present if a pause action gets matched up with an unpause action`
    },
    parentId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The parent line item id'
    },
    startAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp for the beginning of the period of no charge'
    },
  })
});

const InvoiceLineItem = new GraphQLObjectType({
  name: 'InvoiceLineItem',
  description: 'A single line item charge on the invoice',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The unique line item id'},
    amount: {
      type: new GraphQLNonNull(GraphQLFloat),
      description: 'The amount for the line item (in USD)'
    },
    description: {
      type: GraphQLString,
      description: 'A description of the charge. Only present if we have no idea what the charge is'
    },
    details: {
      type: new GraphQLList(new GraphQLNonNull(DetailedLineItem)),
      description: 'Array of user inactivity line items that roll up to total inactivity'
    },
    quantity: {
      type: GraphQLInt,
      description: 'The total number of days that all org users have been inactive during the billing cycle'
    },
    type: {
      type: LineItemType,
      description: 'The line item type for a monthly billing invoice'
    }
  })
});

const InvoiceStatus = new GraphQLEnumType({
  name: 'InvoiceStatus',
  description: 'The payment status of the invoice',
  values: makeEnumValues([
    PENDING,
    PAID,
    UNPAID
  ])
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
    lines: {
      type: new GraphQLList(new GraphQLNonNull(InvoiceLineItem)),
      description: 'An invoice line item for either the next month or an adjustment from the previous month charge'
    },
    orgId: {
      type: new GraphQLNonNull(GraphQLID),
      description: '*The organization id to charge'
    },
    status: {
      type: InvoiceStatus,
      description: 'the status of the invoice. starts as pending, moves to paid or unpaid depending on if the payment succeeded'
    }
    // paid: {
    //   type: GraphQLBoolean,
    //   description: 'true if the invoice has been paid, else false'
    // }
  })
});
