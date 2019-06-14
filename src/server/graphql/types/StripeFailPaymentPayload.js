import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {resolveNotification, resolveOrganization} from 'server/graphql/resolvers'
import NotifyPaymentRejected from 'server/graphql/types/NotifyPaymentRejected'
import Organization from 'server/graphql/types/Organization'
import StandardMutationError from 'server/graphql/types/StandardMutationError'

const StripeFailPaymentPayload = new GraphQLObjectType({
  name: 'StripeFailPaymentPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    organization: {
      type: Organization,
      resolve: resolveOrganization
    },
    notification: {
      type: new GraphQLNonNull(NotifyPaymentRejected),
      description: 'The notification to billing leaders stating the payment was rejected',
      resolve: resolveNotification
    }
  })
})

export default StripeFailPaymentPayload
