import {
  GraphQLFloat,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql'
import connectionDefinitions from '../connectionDefinitions'
import {GQLContext} from '../graphql'
import Coupon from './Coupon'
import CreditCard from './CreditCard'
import GraphQLEmailType from './GraphQLEmailType'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import GraphQLURLType from './GraphQLURLType'
import InvoiceLineItem from './InvoiceLineItem'
import InvoiceStatusEnum from './InvoiceStatusEnum'
import NextPeriodCharges from './NextPeriodCharges'
import PageInfoDateCursor from './PageInfoDateCursor'
import TierEnum from './TierEnum'

/* Each invoice has 3 levels.
 * L1 is a the invoice itself: how much to pay.
 * L2 is line items (next month charges, added users, removed users, inactivity credits, previousBalance) with a quantity
 * L3 is a detailed line item & is a breakdown of the L2 quantity (eg a user with the pause/unpause dates)
 */

const Invoice = new GraphQLObjectType<any, GQLContext>({
  name: 'Invoice',
  description: 'A monthly billing invoice for an organization',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'A shortid for the invoice'
    },
    tier: {
      type: new GraphQLNonNull(TierEnum),
      description: 'The tier this invoice pays for'
    },
    amountDue: {
      type: new GraphQLNonNull(GraphQLFloat),
      description:
        'The amount the card will be charged (total + startingBalance with a min value of 0)'
    },
    createdAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The datetime the invoice was first generated'
    },
    coupon: {
      type: Coupon,
      description: 'The discount coupon information from Stripe, if any discount applied'
    },
    total: {
      type: new GraphQLNonNull(GraphQLFloat),
      description: 'The total amount for the invoice (in USD)'
    },
    billingLeaderEmails: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLEmailType))),
      description: 'The emails the invoice was sent to'
    },
    creditCard: {
      type: CreditCard,
      description: 'the card used to pay the invoice'
    },
    endAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The timestamp for the end of the billing cycle'
    },
    invoiceDate: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The date the invoice was created'
    },
    lines: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(InvoiceLineItem))),
      description: 'An invoice line item for previous month adjustments'
    },
    nextPeriodCharges: {
      type: new GraphQLNonNull(NextPeriodCharges),
      description: 'The details that comprise the charges for next month'
    },
    orgId: {
      type: new GraphQLNonNull(GraphQLID),
      description: '*The organization id to charge'
    },
    orgName: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The persisted name of the org as it was when invoiced'
    },
    paidAt: {
      type: GraphQLISO8601Type,
      description: 'the datetime the invoice was successfully paid'
    },
    payUrl: {
      type: GraphQLString,
      description: 'The URL to pay via stripe if payment was not collected in app'
    },
    picture: {
      type: GraphQLURLType,
      description: 'The picture of the organization'
    },
    startAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The timestamp for the beginning of the billing cycle'
    },
    startingBalance: {
      type: new GraphQLNonNull(GraphQLFloat),
      description: 'The balance on the customer account (in cents)'
    },
    status: {
      type: new GraphQLNonNull(InvoiceStatusEnum),
      description:
        'the status of the invoice. starts as pending, moves to paid or unpaid depending on if the payment succeeded'
    }
  })
})

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
})

export const InvoiceConnection = connectionType
export const InvoiceEdge = edgeType
export default Invoice
