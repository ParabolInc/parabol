// call with pnpm sucrase-node billing/debug.ts
import '../../../scripts/webpack/utils/dotenv'
import {Logger} from '../utils/Logger'
import {getStripeManager} from '../utils/stripe'

const doDebugStuff = async () => {
  const manager = getStripeManager()
  const res = await manager.updateSubscriptionQuantity('foo', 39, 1597966749)
  Logger.log('res', {res})
}

doDebugStuff()
