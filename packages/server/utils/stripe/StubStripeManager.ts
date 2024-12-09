import Stripe from 'stripe'
import {toEpochSeconds} from '../epochTime'
import {Logger} from '../Logger'
import StripeManager from './StripeManager'

// using proxy to start gradual coverage of StripeManager
export default function StubStripeManager() {
  return new Proxy<StripeManager>(new StripeManager(), {
    get: (target, propKey: keyof typeof target) => {
      switch (propKey) {
        case 'createCustomer':
          return async (_orgId: string, _email: string, _source?: string) => {
            return {
              id: 'stub-customer-id'
            }
          }
        case 'createEnterpriseSubscription':
          return async (customerId: string, orgId: string, quantity: number, plan?: string) => {
            return {
              customerId,
              orgId,
              quantity,
              plan,
              current_period_start: toEpochSeconds(new Date()),
              current_period_end: toEpochSeconds(new Date()) + 10_000
            } as unknown as Stripe.Subscription
          }
        default:
          Logger.warn('StubStripeManager forwarding to real StripeManager', propKey)
          return target[propKey]
      }
    }
  })
}
