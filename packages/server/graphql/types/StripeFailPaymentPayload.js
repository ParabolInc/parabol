import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {resolveNotification, resolveOrganization} from '../resolvers'
import NotifyPaymentRejected from './NotifyPaymentRejected'
import Organization from './Organization'
import StandardMutationError from './StandardMutationError'

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
