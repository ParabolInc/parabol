import {GraphQLFloat, GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql';
import CreditCard from 'server/graphql/types/CreditCard';
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type';
import InvoiceChargeNextMonth from 'server/graphql/types/InvoiceChargeNextMonth';
import InvoiceLineItem from 'server/graphql/types/InvoiceLineItem';
import InvoiceStatusEnum from 'server/graphql/types/InvoiceStatusEnum';
import connectionDefinitions from 'server/graphql/connectionDefinitions';
import PageInfoDateCursor from 'server/graphql/types/PageInfoDateCursor';
import {globalIdField} from 'graphql-relay';
import GraphQLEmailType from 'server/graphql/types/GraphQLEmailType';
import GraphQLURLType from 'server/graphql/types/GraphQLURLType';

/* Each invoice has 3 levels.
 * L1 is a the invoice itself: how much to pay.
 * L2 is line items (next month charges, added users, removed users, inactivity credits, previousBalance) with a quantity
 * L3 is a detailed line item & is a breakdown of the L2 quantity (eg a user with the pause/unpause dates)
 */

const Invoice = new GraphQLObjectType({
  name: 'Invoice',
  description: 'A monthly billing invoice for an organization',
  fields: () => ({
    id: globalIdField('Invoice', ({id}) => id),
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
      type: InvoiceChargeNextMonth,
      description: 'The details that comprise the charges for next month'
    },
    orgId: {
      type: GraphQLID,
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
      type: InvoiceStatusEnum,
      description: 'the status of the invoice. starts as pending, moves to paid or unpaid depending on if the payment succeeded'
    }
  })
});

const {connectionType, edgeType} = connectionDefinitions({
  nodeType: Invoice,
  edgeFields: () => ({
    cursor: {
      type: GraphQLISO8601Type
    }
  }),
  connectionFields: () => ({
    pageInfo: {
      type: PageInfoDateCursor,
      description: 'Page info with cursors coerced to ISO8601 dates'
    }
  })
});

export const InvoiceConnection = connectionType;
export const InvoiceEdge = edgeType;
export default Invoice;
