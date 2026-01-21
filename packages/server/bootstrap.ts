import {Logger} from './utils/Logger'
import {identityManager} from './utils/ServerIdentityManager'

;(async () => {
  try {
    await identityManager.claimIdentity()
    if (__PRODUCTION__) {
      require('./initLogging')
    }
    require('./server')
  } catch (err) {
    Logger.error('Failed to bootstrap server component:', err)
    process.exit(1)
  }
})()
