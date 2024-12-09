// call with yarn sucrase-node billing/debug.ts
import '../../../scripts/webpack/utils/dotenv'
import {getStripeManager} from '../utils/stripe'
import {Logger} from '../utils/Logger'

const doDebugStuff = async () => {
  const manager = getStripeManager()
  const res = await manager.updateSubscriptionQuantity('foo', 39, 1597966749)
  Logger.log('res', {res})
}

doDebugStuff()
