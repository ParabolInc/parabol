import {GraphQLFloat, GraphQLInt, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import {GQLContext} from '../graphql'
import GraphQLISO8601Type from './GraphQLISO8601Type'

const NextPeriodCharges = new GraphQLObjectType<any, GQLContext>({
  name: 'NextPeriodCharges',
  description: 'A single line item for the charges for next month',
  fields: () => ({
    amount: {
      type: new GraphQLNonNull(GraphQLFloat),
      description: 'The amount for the line item (in USD)'
    },
    nextPeriodEnd: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The datetime the next period will end'
    },
    quantity: {
      type: new GraphQLNonNull(GraphQLInt),
      description:
        'The total number of days that all org users have been inactive during the billing cycle'
    },
    unitPrice: {
      type: GraphQLFloat,
      description:
        'The per-seat monthly price of the subscription (in dollars), null if invoice is not per-seat'
    },
    interval: {
      type: GraphQLString,
      description: '"year" if enterprise, else "month" for team'
    }
  })
})

export default NextPeriodCharges
