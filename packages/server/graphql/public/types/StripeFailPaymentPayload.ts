import NotificationPaymentRejected from '../../../database/types/NotificationPaymentRejected'
import {StripeFailPaymentPayloadResolvers} from '../resolverTypes'

export type StripeFailPaymentPayloadSource = {
  orgId: string
  notificationId: string
}

const StripeFailPaymentPayload: StripeFailPaymentPayloadResolvers = {
  organization: ({orgId}, _args, {dataLoader}) => {
    return dataLoader.get('organizations').load(orgId)
  },
  notification: async ({notificationId}, _args, {dataLoader}) => {
    const notification = await dataLoader.get('notifications').load(notificationId)
    return notification as NotificationPaymentRejected
  }
}

export default StripeFailPaymentPayload
