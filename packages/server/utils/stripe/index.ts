import StripeManager from './StripeManager'
import StubStripeManager from './StubStripeManager'

export function getStripeManager(): StripeManager {
  return process.env.CI ? StubStripeManager() : new StripeManager()
}
