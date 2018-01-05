import {GraphQLObjectType} from 'graphql';
import {resolveNotification, resolveOrganization} from 'server/graphql/resolvers';
import NotifyPaymentRejected from 'server/graphql/types/NotifyPaymentRejected';
import Organization from 'server/graphql/types/Organization';

const StripeFailPaymentPayload = new GraphQLObjectType({
  name: 'StripeFailPaymentPayload',
  fields: () => ({
    organization: {
      type: Organization,
      resolve: resolveOrganization
    },
    notification: {
      type: NotifyPaymentRejected,
      description: 'The notification to billing leaders stating the payment was rejected',
      resolve: resolveNotification
    }
  })
});

export default StripeFailPaymentPayload;
