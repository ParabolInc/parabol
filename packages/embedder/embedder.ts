import tracer from 'dd-trace'
import EmbedderChannelId from 'parabol-client/shared/gqlIds/EmbedderChannelId'
import 'parabol-server/initSentry'
import getKysely from 'parabol-server/postgres/getKysely'
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
  // jobId?: string
  objectType: EmbeddingObjectType
  startAt?: Date
  endAt?: Date
  refId?: string
}

export type EmbedderOptions = Omit<PubSubEmbedderMessage, 'objectType'>

const parseEmbedderMessage = (message: string): PubSubEmbedderMessage => {
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

  // add historical metadata
  const ALL_OBJECT_TYPES: EmbeddingObjectType[] = ['retrospectiveDiscussionTopic']
  const pg = getKysely()
  ALL_OBJECT_TYPES.forEach(async (objectType) => {
    switch (objectType) {
      case 'retrospectiveDiscussionTopic':
        pg.selectFrom('EmbeddingsMetadata')
          .selectAll()
          .where(({eb, selectFrom}) =>
            eb(
              'EmbeddingsMetadata.refId',
              '=',
              selectFrom('Discussion').orderBy('createdAt').limit(1)
            )
          )
      default:
        throw new Error(`Invalid object type: ${objectType}`)
    }
  })
  processJobQueue(modelManager)
}

run()
