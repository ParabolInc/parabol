import {GraphQLNonNull, GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLBoolean} from 'graphql'

const Coupon = new GraphQLObjectType({
  name: 'Coupon',
  description: 'The discount coupon from Stripe, if any',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The ID of the discount coupon from Stripe'
    },
    amount_off: {
      type: GraphQLInt,
      description: 'The amount off the invoice, if any'
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The name of the discount coupon from Stripe'
    },
    percent_off: {
      type: GraphQLInt,
      description: 'The percent off the invoice, if any'
    },
    valid: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'The discount coupon is valid or not'
    }
  })
})

export default Coupon
