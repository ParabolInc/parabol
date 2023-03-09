import {getUserId} from '../../../utils/authorization'
import {getStripeManager} from '../../../utils/stripe'
import {MutationResolvers} from '../resolverTypes'

const createPaymentIntent: MutationResolvers['createPaymentIntent'] = async (_source) => {
  // RESOLUTION
  const manager = getStripeManager()

  // TODO: get the tier amount from the client. Do this is in: https://github.com/ParabolInc/parabol/issues/7693
  const paymentIntent = await manager.createPaymentIntent(1000)

  const {client_secret: clientSecret} = paymentIntent
  const data = {clientSecret}
  return data
}

export default createPaymentIntent
