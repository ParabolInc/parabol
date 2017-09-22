import {GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql';
import Notification, {notificationInterfaceFields} from 'server/graphql/types/Notification';

const NotifyPayment = new GraphQLObjectType({
  name: 'NotifyPayment',
  description: 'A notification sent to a user concerning payment (ie failed payment)',
  interfaces: () => [Notification],
  fields: () => ({
    last4: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The last 4 digits of a credit card'
    },
    brand: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The brand of credit card'
    },
    ...notificationInterfaceFields
  })
});

export default NotifyPayment;
