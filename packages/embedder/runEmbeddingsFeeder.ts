import ms from 'ms'
import getRedis from '../server/utils/getRedis'
import {Logger} from '../server/utils/Logger'
import {getEmbeddingsRun} from './embeddingsRun'
import {feedEmbeddingsRun} from './feedEmbeddingsRun'

export const runEmbeddingsFeeder = () => {
  setInterval(async () => {
    try {
      const run = await getEmbeddingsRun()
      const progress = await feedEmbeddingsRun(run)
      if (!run || !progress) return
      const {recentPages, olderPages, metadata, queued} = progress
      Logger.log(
        `Embeddings run ${run.modelId}: ${recentPages.done} of ${recentPages.total} pages updated in the last 90 days, ${olderPages.done} of ${olderPages.total} older pages, ${metadata.done} of ${metadata.total} metadata rows, ${queued} queued`
      )
      await getRedis().publish('embeddingsJobAdded', '')
    } catch (error) {
      Logger.error(error)
    }
  }, ms('1m')).unref()
}
