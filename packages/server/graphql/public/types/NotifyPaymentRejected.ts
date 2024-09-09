import {NotifyPaymentRejectedResolvers} from '../resolverTypes'

const NotifyPaymentRejected: NotifyPaymentRejectedResolvers = {
  __isTypeOf: ({type}) => type === 'PAYMENT_REJECTED',
  organization: async ({orgId}, _args, {dataLoader}) => {
    return dataLoader.get('organizations').loadNonNull(orgId)
  }
}

export default NotifyPaymentRejected
