import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import {resolveNotification, resolveOrganization} from '../resolvers'
import NotifyPaymentRejected from './NotifyPaymentRejected'
import Organization from './Organization'
import StandardMutationError from './StandardMutationError'

const StripeFailPaymentPayload = new GraphQLObjectType<any, GQLContext>({
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
      description: 'The notification to a billing leader stating the payment was rejected',
      resolve: resolveNotification
    }
  })
})

export default StripeFailPaymentPayload
