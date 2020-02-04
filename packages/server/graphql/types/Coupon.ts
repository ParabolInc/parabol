import {GraphQLInt, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import {GQLContext} from '../graphql'

const Coupon = new GraphQLObjectType<any, GQLContext>({
  name: 'Coupon',
  description: 'The discount coupon from Stripe, if any',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The ID of the discount coupon from Stripe'
    },
    amountOff: {
      type: GraphQLInt,
      description: 'The amount off the invoice, if any'
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The name of the discount coupon from Stripe'
    },
    percentOff: {
      type: GraphQLInt,
      description: 'The percent off the invoice, if any'
    }
  })
})

export default Coupon
