import {Logger} from 'parabol-server/utils/Logger'
import {identityManager} from 'parabol-server/utils/ServerIdentityManager'

;(async () => {
  try {
    await identityManager.claimIdentity()
    // biome-ignore lint/style/noCommonJs: Bootstrap requires dynamic loading
    require('./embedder')
  } catch (err) {
    Logger.error('Failed to bootstrap embedder component:', err)
    process.exit(1)
  }
})()
