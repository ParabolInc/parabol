import Stripe from 'stripe'
import {toEpochSeconds} from '../epochTime'
import StripeManager from './StripeManager'

// using proxy to start gradual coverage of StripeManager
export default function StubStripeManager() {
  return new Proxy<StripeManager>(new StripeManager(), {
    get: (target, propKey) => {
      if (propKey === 'createEnterpriseSubscription') {
        return async (customerId: string, orgId: string, quantity: number, plan?: string) => {
          return {
            customerId,
            orgId,
            quantity,
            plan,
            current_period_start: toEpochSeconds(new Date()),
            current_period_end: toEpochSeconds(new Date()) + 10_000
          } as unknown as Stripe.subscriptions.ISubscription
        }
      }
      return target[propKey]
    }
  })
}
