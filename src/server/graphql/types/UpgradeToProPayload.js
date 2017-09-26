import {GraphQLObjectType} from 'graphql';
import CreditCard from 'server/graphql/types/CreditCard';

const UpgradeToProPayload = new GraphQLObjectType({
  name: 'UpgradeToProPayload',
  fields: () => ({
    creditCard: {
      type: CreditCard,
      description: 'the credit card details that got updated'
    },
    //upcomingInvoice: {
    //  type: Invoice,
    //  description: 'The new upcoming invoice'
    //}
  })
});

export default UpgradeToProPayload;
