import tracer from 'dd-trace'
import EmbedderChannelId from 'parabol-client/shared/gqlIds/EmbedderChannelId'
import 'parabol-server/initSentry'
import {DB} from 'parabol-server/postgres/pg'
import RedisInstance from 'parabol-server/utils/RedisInstance'
import {addEmbeddingsMetadata} from './addEmbeddingsMetadata'
import getModelManager from './ai_models/ModelManager'
import {processJobQueue} from './processJobQueue'

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

export interface PubSubEmbedderMessage {
  jobId?: string | undefined
  objectType: EmbeddingObjectType
  startAt?: Date | undefined
  endAt: Date | undefined
}

const parseEmbedderMessage = (message: string): PubSubEmbedderMessage => {
  const {jobId, objectType, startAt, endAt} = JSON.parse(message)
  return {
    jobId,
    objectType,
    startAt: startAt ? new Date(startAt) : undefined,
    endAt: endAt ? new Date(endAt) : undefined
  }
}

const run = async () => {
  const SERVER_ID = process.env.SERVER_ID
  if (!SERVER_ID) throw new Error('env.SERVER_ID is required')
  const embedderEnabled = parseEnvBoolean(process.env.AI_EMBEDDER_ENABLED)
  if (!embedderEnabled) console.log('env.AI_EMBEDDER_ENABLED is false. Embedder will not run.')

  const subscriber = new RedisInstance(`embedder_sub_${SERVER_ID}`)
  const publisher = new RedisInstance(`embedder_pub_${SERVER_ID}`)
  const embedderChannel = EmbedderChannelId.join(SERVER_ID)
  const modelManager = getModelManager()
  await modelManager.maybeCreateTables()
  await modelManager.removeOldTriggers()

  // subscribe to direct messages
  const onMessage = async (_channel: string, message: string) => {
    const parsedMessage = parseEmbedderMessage(message)
    await addEmbeddingsMetadata(publisher, parsedMessage)
  }
  subscriber.on('message', onMessage)
  subscriber.subscribe(embedderChannel)

  console.log(`\n⚡⚡⚡️️ Server ID: ${SERVER_ID}. Embedder is ready ⚡⚡⚡️️️`)
  processJobQueue(modelManager)
}

run()
