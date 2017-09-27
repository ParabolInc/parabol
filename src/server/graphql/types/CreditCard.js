import {GraphQLInt, GraphQLObjectType, GraphQLString} from 'graphql';

const CreditCard = new GraphQLObjectType({
  name: 'CreditCard',
  description: 'A credit card',
  fields: () => ({
    // TODO uncomment when we move to relay
    // id: {
    //  type: GraphQLID,
    //  resolve: (source) => {
    //    return source.id;
    //  }
    // },
    brand: {
      type: GraphQLString,
      description: 'The brand of the credit card, as provided by skype'
    },
    expiry: {
      type: GraphQLString,
      description: 'The MM/YY string of the expiration date'
    },
    last4: {
      type: GraphQLInt,
      description: 'The last 4 digits of a credit card'
    }
  })
});

export default CreditCard;
