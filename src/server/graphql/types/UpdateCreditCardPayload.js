import {GraphQLObjectType} from 'graphql';
import CreditCard from 'server/graphql/types/CreditCard';

const UpdateCreditCardPayload = new GraphQLObjectType({
  name: 'UpdateCreditCardPayload',
  fields: () => ({
    creditCard: {
      type: CreditCard,
      description: 'the credit card details that got updated'
    }
    // upcomingInvoice: {
    //  type: Invoice,
    //  description: 'The new upcoming invoice'
    // }
  })
});

export default UpdateCreditCardPayload;
