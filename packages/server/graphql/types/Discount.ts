import {GraphQLNonNull, GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLBoolean} from 'graphql'

const Discount = new GraphQLObjectType({
  name: 'Discount',
  description: 'The discount from Stripe, if any',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The ID of the discount coupon from Stripe'
    },
    amount_off: {
      type: GraphQLString,
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

export default Discount
