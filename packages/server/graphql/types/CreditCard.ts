import {GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import {GQLContext} from '../graphql'

const CreditCard = new GraphQLObjectType<any, GQLContext>({
  name: 'CreditCard',
  description: 'A credit card',
  fields: () => ({
    brand: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The brand of the credit card, as provided by stripe'
    },
    expiry: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The MM/YY string of the expiration date'
    },
    last4: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The last 4 digits of a credit card'
    }
  })
})

export default CreditCard
