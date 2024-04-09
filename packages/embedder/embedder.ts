import tracer from 'dd-trace'
import EmbedderChannelId from 'parabol-client/shared/gqlIds/EmbedderChannelId'
import 'parabol-server/initSentry'
import {Logger} from 'parabol-server/utils/Logger'
import RedisInstance from 'parabol-server/utils/RedisInstance'
import {Tuple} from '../client/types/generics'
import RedisStream from '../gql-executor/RedisStream'
import {EmbeddingsJobQueueStream} from './EmbeddingsJobQueueStream'
import {addEmbeddingsMetadata} from './addEmbeddingsMetadata'
import getModelManager from './ai_models/ModelManager'
import {MessageToEmbedder} from './custom'
import {establishPrimaryEmbedder} from './establishPrimaryEmbedder'
import {importHistoricalMetadata} from './importHistoricalMetadata'
import {mergeAsyncIterators} from './mergeAsyncIterators'
import {resetStalledJobs} from './resetStalledJobs'

tracer.init({
  service: `embedder`,
  appsec: process.env.DD_APPSEC_ENABLED === 'true',
  plugins: false,
  version: process.env.npm_package_version
})
tracer.use('pg')

const parseEmbedderMessage = (message: string): MessageToEmbedder => {
  const {startAt, endAt, ...input} = JSON.parse(message)
  return {
    ...input,
    startAt: startAt ? new Date(startAt) : undefined,
    endAt: endAt ? new Date(endAt) : undefined
  }
}

const run = async () => {
  const SERVER_ID = process.env.SERVER_ID
  if (!SERVER_ID) throw new Error('env.SERVER_ID is required')
  const embedderChannel = EmbedderChannelId.join(SERVER_ID)
  const NUM_WORKERS = parseInt(process.env.AI_EMBEDDER_WORKERS!)
  if (!(NUM_WORKERS > 0)) {
    Logger.log('env.AI_EMBEDDER_WORKERS is < 0. Embedder will not run.')
    return
  }

  const redis = new RedisInstance(`embedder_${SERVER_ID}`)
  const primaryLock = await establishPrimaryEmbedder(redis)
  const modelManager = getModelManager()
  let streams: AsyncIterableIterator<any> | undefined = undefined
  const kill = () => {
    primaryLock?.release()
    streams?.return?.()
    process.exit()
  }
  process.on('SIGTERM', kill)
  process.on('SIGINT', kill)
  if (primaryLock) {
    // only 1 worker needs to perform these on startup
    await modelManager.maybeCreateTables()
    await importHistoricalMetadata()
    resetStalledJobs()
  }

  const onMessage = async (_channel: string, message: string) => {
    const parsedMessage = parseEmbedderMessage(message)
    await addEmbeddingsMetadata(parsedMessage)
  }

  // subscribe to consumer group
  try {
    await redis.xgroup(
      'CREATE',
      'embedMetadataStream',
      'embedMetadataConsumerGroup',
      '$',
      'MKSTREAM'
    )
  } catch (e) {
    // stream already exists
  }

  const messageStream = new RedisStream(
    'embedMetadataStream',
    'embedMetadataConsumerGroup',
    embedderChannel
  )

  // Assume 3 workers for type safety, but it doesn't really matter at runtime
  const jobQueueStreams = Array.from(
    {length: NUM_WORKERS},
    () => new EmbeddingsJobQueueStream()
  ) as Tuple<EmbeddingsJobQueueStream, 3>

  Logger.log(`\n⚡⚡⚡️️ Server ID: ${SERVER_ID}. Embedder is ready ⚡⚡⚡️️️`)

  streams = mergeAsyncIterators([messageStream, ...jobQueueStreams])
  for await (const [idx, message] of streams) {
    switch (idx) {
      case 0:
        onMessage('', message)
        continue
      default:
        Logger.log(`Worker ${idx} finished job ${message.id}`)
        continue
    }
  }

  // On graceful shutdown
  Logger.log('Streaming Complete. Goodbye!')
}

run()
