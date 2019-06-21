import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {resolveOrganization} from 'server/graphql/resolvers'
import Notification, {notificationInterfaceFields} from 'server/graphql/types/Notification'
import Organization from 'server/graphql/types/Organization'

const NotifyPaymentRejected = new GraphQLObjectType({
  name: 'NotifyPaymentRejected',
  description: 'A notification sent to a user when their payment has been rejected',
  interfaces: () => [Notification],
  fields: () => ({
    organization: {
      type: new GraphQLNonNull(Organization),
      resolve: resolveOrganization
    },
    ...notificationInterfaceFields
  })
})

export default NotifyPaymentRejected
