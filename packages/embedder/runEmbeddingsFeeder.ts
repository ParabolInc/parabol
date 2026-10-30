import ms from 'ms'
import getRedis from '../server/utils/getRedis'
import {Logger} from '../server/utils/Logger'
import {getEmbeddingsRun, saveEmbeddingsRunProgress} from './embeddingsRun'
import {feedEmbeddingsRun} from './feedEmbeddingsRun'

const FEED_EVERY_MS = ms('1m')

const feedOnce = async () => {
  const redis = getRedis()
  const isFeeder = await redis.set('embeddingsRun:feeder', '1', 'PX', FEED_EVERY_MS - 5_000, 'NX')
  if (!isFeeder) return
  const fed = await feedEmbeddingsRun(await getEmbeddingsRun())
  if (!fed) return
  const {run, pages, metadataRows} = fed
  await saveEmbeddingsRunProgress(run)
  const reached = run.pageCursor ? `, down to pages updated ${run.pageCursor.split('|')[0]}` : ''
  const done = run.pagesDone && run.metadataDone ? '; done' : ''
  Logger.log(
    `Embeddings run ${run.modelId}: queued ${pages} pages and ${metadataRows} metadata rows${reached}${done}`
  )
  await redis.publish('embeddingsJobAdded', '')
}

export const runEmbeddingsFeeder = () => {
  const tick = async () => {
    try {
      await feedOnce()
    } catch (error) {
      Logger.error(error)
    } finally {
      setTimeout(tick, FEED_EVERY_MS).unref()
    }
  }
  setTimeout(tick, FEED_EVERY_MS).unref()
}
