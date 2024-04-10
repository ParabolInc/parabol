import tracer from 'dd-trace'
import 'parabol-server/initSentry'
import {Logger} from 'parabol-server/utils/Logger'
import RedisInstance from 'parabol-server/utils/RedisInstance'
import {Tuple} from '../client/types/generics'
import {EmbeddingsJobQueueStream} from './EmbeddingsJobQueueStream'
import {WorkflowOrchestrator} from './WorkflowOrchestrator'
import getModelManager from './ai_models/ModelManager'
import {establishPrimaryEmbedder} from './establishPrimaryEmbedder'
import {importHistoricalMetadata} from './importHistoricalMetadata'
import {logPerformance} from './logPerformance'
import {mergeAsyncIterators} from './mergeAsyncIterators'
import {resetStalledJobs} from './resetStalledJobs'

tracer.init({
  service: `embedder`,
  appsec: process.env.DD_APPSEC_ENABLED === 'true',
  plugins: false,
  version: process.env.npm_package_version
})
tracer.use('pg')

const run = async () => {
  const SERVER_ID = process.env.SERVER_ID
  if (!SERVER_ID) throw new Error('env.SERVER_ID is required')
  const NUM_WORKERS = parseInt(process.env.AI_EMBEDDER_WORKERS!)
  if (!(NUM_WORKERS > 0)) {
    Logger.log('env.AI_EMBEDDER_WORKERS is < 0. Embedder will not run.')
    return
  }

  const redis = new RedisInstance(`embedder_${SERVER_ID}`)
  const primaryLock = await establishPrimaryEmbedder(redis)
  const modelManager = getModelManager()
  if (primaryLock) {
    // only 1 worker needs to perform these on startup
    await modelManager.maybeCreateTables()
    await importHistoricalMetadata()
    resetStalledJobs()
  }

  const orchestrator = new WorkflowOrchestrator()
  // Assume 3 workers for type safety, but it doesn't really matter at runtime
  const jobQueueStreams = Array.from(
    {length: NUM_WORKERS},
    () => new EmbeddingsJobQueueStream(orchestrator)
  ) as Tuple<EmbeddingsJobQueueStream, 3>
  const streams = mergeAsyncIterators(jobQueueStreams)

  const kill: NodeJS.SignalsListener = (signal) => {
    Logger.log(`Kill signal received: ${signal}`)
    primaryLock?.release()
    streams.return?.()
    process.exit()
  }
  process.on('SIGTERM', kill)
  process.on('SIGINT', kill)

  Logger.log(`\n⚡⚡⚡️️ Server ID: ${SERVER_ID}. Embedder is ready ⚡⚡⚡️️️`)

  const counter = logPerformance(10, 6)

  for await (const _ of streams) {
    // Logger.log(`Worker ${idx} finished job ${message.id}`)
    counter.i++
  }

  // On graceful shutdown
  Logger.log('Streaming Complete. Goodbye!')
}

run()
