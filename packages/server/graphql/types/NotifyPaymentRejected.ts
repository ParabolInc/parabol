import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import {resolveOrganization} from '../resolvers'
import Notification, {notificationInterfaceFields} from './Notification'
import {NotificationEnumType} from './NotificationEnum'
import Organization from './Organization'

const NotifyPaymentRejected: GraphQLObjectType<any, GQLContext> = new GraphQLObjectType<
  any,
  GQLContext
>({
  name: 'NotifyPaymentRejected',
  description: 'A notification sent to a user when their payment has been rejected',
  interfaces: () => [Notification],
  isTypeOf: ({type}: {type: NotificationEnumType}) => type === 'PAYMENT_REJECTED',
  fields: () => ({
    organization: {
      type: new GraphQLNonNull(Organization),
      resolve: resolveOrganization
    },
    ...notificationInterfaceFields
  })
})

export default NotifyPaymentRejected
