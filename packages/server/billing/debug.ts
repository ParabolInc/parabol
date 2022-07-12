// call with yarn sucrase-node billing/debug.ts
import '../../../scripts/webpack/utils/dotenv'
import {getStripeManager} from '../utils/stripe'

const doDebugStuff = async () => {
  const manager = getStripeManager()
  const res = await manager.updateSubscriptionQuantity('foo', 39, 1597966749)
  console.log('res', {res})
}

doDebugStuff()
