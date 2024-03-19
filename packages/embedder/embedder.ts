import tracer from 'dd-trace'
import EmbedderChannelId from 'parabol-client/shared/gqlIds/EmbedderChannelId'
import RootDataLoader from 'parabol-server/dataloader/RootDataLoader'
import 'parabol-server/initSentry'
import {DB} from 'parabol-server/postgres/pg'
import {Logger} from 'parabol-server/utils/Logger'
import RedisInstance from 'parabol-server/utils/RedisInstance'
import RedisStream from '../gql-executor/RedisStream'
import JobQueueStream from './JobQueueStream'
import {addEmbeddingsMetadata} from './addEmbeddingsMetadata'
import getModelManager from './ai_models/ModelManager'
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

function parseEnvBoolean(envVarValue: string | undefined): boolean {
  return envVarValue === 'true'
}

export type EmbeddingObjectType = DB['EmbeddingsMetadata']['objectType']

export interface MessageToEmbedder {
  objectType: EmbeddingObjectType
  startAt?: Date
  endAt?: Date
  meetingId?: string
}
export type EmbedderOptions = Omit<MessageToEmbedder, 'objectType'>

export const ALL_OBJECT_TYPES: EmbeddingObjectType[] = ['retrospectiveDiscussionTopic']

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
  const embedderEnabled = parseEnvBoolean(process.env.AI_EMBEDDER_ENABLED)
  if (!embedderEnabled) {
    Logger.log('env.AI_EMBEDDER_ENABLED is false. Embedder will not run.')
    return
  }

  const subscriber = new RedisInstance(`embedder_sub_${SERVER_ID}`)
  const publisher = new RedisInstance(`embedder_pub_${SERVER_ID}`)
  const isPrimaryEmbedder = await establishPrimaryEmbedder(publisher)
  const modelManager = getModelManager()
  if (isPrimaryEmbedder) {
    // only 1 worker needs to perform these on startup
    await modelManager.maybeCreateTables()
    await modelManager.removeOldTriggers()
    await importHistoricalMetadata(publisher)
    resetStalledJobs()
  }

  const onMessage = async (_channel: string, message: string) => {
    const parsedMessage = parseEmbedderMessage(message)
    await addEmbeddingsMetadata(parsedMessage)
  }
  subscriber.on('message', onMessage)
  subscriber.subscribe(embedderChannel)

  // subscribe to consumer group
  try {
    await publisher.xgroup('CREATE', 'embedderStream', 'embedderConsumerGroup', '$', 'MKSTREAM')
  } catch (e) {
    // stream already exists
  }

  const incomingStream = new RedisStream('embedderStream', 'embedderConsumerGroup', embedderChannel)
  const dataLoader = new RootDataLoader({maxBatchSize: 1000})
  const jobQueueStream = new JobQueueStream(modelManager, dataLoader)

  Logger.log(`\n⚡⚡⚡️️ Server ID: ${SERVER_ID}. Embedder is ready ⚡⚡⚡️️️`)

  // async iterables run indefinitely and we have 2 of them, so merge them
  const streams = mergeAsyncIterators([incomingStream, jobQueueStream])
  for await (const [idx, message] of streams) {
    switch (idx) {
      case 0:
        onMessage('', message)
        continue
      case 1:
        Logger.log(`Embedded ${message.embeddingsMetadataId} -> ${message.model}`)
        continue
    }
  }
}

run()
