import {Logger} from '../../packages/server/utils/Logger'
import {identityManager} from '../../packages/server/utils/ServerIdentityManager'

;(async () => {
  try {
    await identityManager.claimIdentity()
    require('./preDeploy')
  } catch (err) {
    Logger.error('Failed to bootstrap preDeploy component:', err)
    process.exit(1)
  }
})()
