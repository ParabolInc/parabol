import {getNewDataLoader} from '../../packages/server/dataloader/getNewDataLoader'
import runBackfill from '../../packages/server/integrations/probe/backfillSuggestedServices'
import {isDetectionEnabled} from '../../packages/server/integrations/probe/detectServicesForUser'
import {Logger} from '../../packages/server/utils/Logger'

const DEFAULT_DAYS = 60
const DEFAULT_BATCH_SIZE = 50
// The vendors are the bottleneck, not us. Pausing between batches keeps a backfill of tens of
// thousands of users from looking like an attack to anyone we call.
const PAUSE_BETWEEN_BATCHES_MS = 5000

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * One-off operator script: detect which third-party services existing users already have, for
 * everyone seen in the last N days. New signups are covered by bootstrapNewUser, so this only
 * ever needs to run once — re-running is harmless because completed lookups are never repeated.
 *
 * Usage: node backfillSuggestedServices.js [days] [batchSize]
 */
const backfillSuggestedServices = async () => {
  if (!isDetectionEnabled()) {
    Logger.error('🔎 SUGGESTED_SERVICES_ENABLED is not true. Refusing to call any vendor.')
    return
  }
  const days = Number(process.argv[2]) || DEFAULT_DAYS
  const batchSize = Number(process.argv[3]) || DEFAULT_BATCH_SIZE
  const lastSeenAfter = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  Logger.log(
    `🔎 Backfilling suggested services for users seen since ${lastSeenAfter.toISOString()}`
  )

  const dataLoader = getNewDataLoader('backfillSuggestedServices')
  let total = 0
  try {
    while (true) {
      const processed = await runBackfill({lastSeenAfter, limit: batchSize, dataLoader})
      if (processed === 0) break
      total += processed
      Logger.log(`🔎 ${total} users processed`)
      await sleep(PAUSE_BETWEEN_BATCHES_MS)
    }
  } finally {
    dataLoader.dispose()
  }
  Logger.log(`🔎 Backfill complete: ${total} users processed`)
}

if (require.main === module) {
  backfillSuggestedServices()
    .then(() => process.exit(0))
    .catch((e) => {
      Logger.error('🔎 Backfill failed', e)
      process.exit(1)
    })
}

export default backfillSuggestedServices
