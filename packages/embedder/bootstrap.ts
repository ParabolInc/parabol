import {identityManager} from 'parabol-server/utils/ServerIdentityManager'
import {Logger} from 'parabol-server/utils/Logger'

;(async () => {
  try {
    await identityManager.claimIdentity()
    require('./embedder')
  } catch (err) {
    Logger.error('Failed to bootstrap embedder component:', err)
    process.exit(1)
  }
})()
