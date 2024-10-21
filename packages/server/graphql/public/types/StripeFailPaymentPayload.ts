import {PaymentRejectedNotification} from '../../../postgres/types/Notification'
import {StripeFailPaymentPayloadResolvers} from '../resolverTypes'

export type StripeFailPaymentPayloadSource = {
  orgId: string
  notificationId: string
}

const StripeFailPaymentPayload: StripeFailPaymentPayloadResolvers = {
  organization: ({orgId}, _args, {dataLoader}) => {
    return dataLoader.get('organizations').loadNonNull(orgId)
  },
  notification: async ({notificationId}, _args, {dataLoader}) => {
    const notification = await dataLoader
      .get('notifications')
      .loadNonNull<PaymentRejectedNotification>(notificationId)
    return notification
  }
}

export default StripeFailPaymentPayload
