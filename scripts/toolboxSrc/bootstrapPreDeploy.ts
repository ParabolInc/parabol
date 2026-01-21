import {identityManager} from '../../packages/server/utils/ServerIdentityManager'
import {Logger} from '../../packages/server/utils/Logger'

;(async () => {
  try {
    await identityManager.claimIdentity()
    require('./preDeploy')
  } catch (err) {
    Logger.error('Failed to bootstrap preDeploy component:', err)
    process.exit(1)
  }
})()
