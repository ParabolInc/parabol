import {
  GraphQLObjectType,
  GraphQLEnumType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLInt,
  GraphQLFloat,
  GraphQLList,
  GraphQLString
} from 'graphql';
import GraphQLISO8601Type from 'graphql-custom-datetype';
import {
  ADDED_USERS,
  REMOVED_USERS,
  INACTIVITY_ADJUSTMENTS,
  OTHER_ADJUSTMENTS,
  PENDING,
  PAID,
  FAILED,
  UPCOMING
} from 'universal/utils/constants';
import {CreditCard} from 'server/graphql/models/Organization/organizationSchema';
import {GraphQLEmailType, GraphQLURLType} from 'server/graphql/types';


/* Each invoice has 3 levels.
 * L1 is a the invoice itself: how much to pay.
 * L2 is line items (next month charges, added users, removed users, inactivity credits, previousBalance) with a quantity
 * L3 is a detailed line item & is a breakdown of the L2 quantity (eg a user with the pause/unpause dates)
 */

export const LineItemType = new GraphQLEnumType({
  name: 'LineItemType',
  description: 'A big picture line item',
  values: {
    [ADDED_USERS]: {},
    [INACTIVITY_ADJUSTMENTS]: {},
    [OTHER_ADJUSTMENTS]: {},
    [REMOVED_USERS]: {}
  }
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
      description: 'End of the event. Only present if a pause action gets matched up with an unpause action'
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

const NextMonthCharge = new GraphQLObjectType({
  name: 'NextMonthCharge',
  description: 'A single line item for the charges for next month',
  fields: () => ({
    amount: {
      type: new GraphQLNonNull(GraphQLFloat),
      description: 'The amount for the line item (in USD)'
    },
    nextPeriodEnd: {
      type: GraphQLISO8601Type,
      description: 'The datetime the next period will end'
    },
    quantity: {
      type: GraphQLInt,
      description: 'The total number of days that all org users have been inactive during the billing cycle'
    },
    unitPrice: {
      type: GraphQLFloat,
      description: 'The per-seat monthly price of the subscription (in dollars)'
    }
  })
});

const InvoiceStatus = new GraphQLEnumType({
  name: 'InvoiceStatus',
  description: 'The payment status of the invoice',
  values: {
    [PENDING]: {},
    [PAID]: {},
    [FAILED]: {},
    [UPCOMING]: {}
  }
});

export const Invoice = new GraphQLObjectType({
  name: 'Invoice',
  description: 'A monthly billing invoice for an organization',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The unique invoice Id'},
    amountDue: {
      type: GraphQLFloat,
      description: 'The amount the card will be charged (total + startingBalance with a min value of 0)'
    },
    createdAt: {
      type: GraphQLISO8601Type,
      description: 'The datetime the invoice was first generated'
    },
    total: {
      type: GraphQLFloat,
      description: 'The total amount for the invoice (in USD)'
    },
    billingLeaderEmails: {
      type: new GraphQLList(GraphQLEmailType),
      description: 'The emails the invoice was sent to'
    },
    creditCard: {
      type: CreditCard,
      description: 'the card used to pay the invoice'
    },
    cursor: {
      type: GraphQLFloat,
      description: 'the string interpretation of startAt'
    },
    endAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp for the end of the billing cycle'
    },
    invoiceDate: {
      type: GraphQLISO8601Type,
      description: 'The date the invoice was created'
    },
    lines: {
      type: new GraphQLList(new GraphQLNonNull(InvoiceLineItem)),
      description: 'An invoice line item for previous month adjustments'
    },
    nextMonthCharges: {
      type: NextMonthCharge,
      description: 'The details that comprise the charges for next month'
    },
    orgId: {
      type: new GraphQLNonNull(GraphQLID),
      description: '*The organization id to charge'
    },
    orgName: {
      type: GraphQLString,
      description: 'The persisted name of the org as it was when invoiced'
    },
    paidAt: {
      type: GraphQLISO8601Type,
      description: 'the datetime the invoice was successfully paid'
    },
    picture: {
      type: GraphQLURLType,
      description: 'The picture of the organization'
    },
    startAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp for the beginning of the billing cycle'
    },
    startingBalance: {
      type: GraphQLFloat,
      description: 'The balance on the customer account (in cents)'
    },
    status: {
      type: InvoiceStatus,
      description: 'the status of the invoice. starts as pending, moves to paid or unpaid depending on if the payment succeeded'
    }
  })
});
