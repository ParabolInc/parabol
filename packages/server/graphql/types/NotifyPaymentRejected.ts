import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {resolveOrganization} from '../resolvers'
import Notification, {notificationInterfaceFields} from './Notification'
import Organization from './Organization'

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
