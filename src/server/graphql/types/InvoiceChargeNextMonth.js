import {GraphQLFloat, GraphQLInt, GraphQLNonNull, GraphQLObjectType} from 'graphql';
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type';


const InvoiceChargeNextMonth = new GraphQLObjectType({
  name: 'InvoiceChargeNextMonth',
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

export default InvoiceChargeNextMonth;
