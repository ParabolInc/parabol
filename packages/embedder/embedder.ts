import {Insertable} from 'kysely'
import tracer from 'dd-trace'
import Redlock, {RedlockAbortSignal} from 'redlock'

import 'parabol-server/initSentry'
import getKysely from 'parabol-server/postgres/getKysely'
import {DB} from 'parabol-server/postgres/pg'
import {refreshRetroDiscussionTopicsMeta as refreshRetroDiscussionTopicsMeta} from './indexing/retrospectiveDiscussionTopic'
import {orgIdsWithFeatureFlag} from './indexing/orgIdsWithFeatureFlag'
import getModelManager, {ModelManager} from './ai_models/ModelManager'
import {countWords} from './indexing/countWords'
import {createEmbeddingTextFrom} from './indexing/createEmbeddingTextFrom'
import {
  selectJobQueueItemById,
  selectMetadataByJobQueueId,
  updateJobState
} from './indexing/embeddingsTablesOps'
import {selectMetaToQueue} from './indexing/embeddingsTablesOps'
import {insertNewJobs} from './indexing/embeddingsTablesOps'
import {completeJobTxn} from './indexing/embeddingsTablesOps'
import {getRootDataLoader} from './indexing/getRootDataLoader'
import {getRedisClient} from './indexing/getRedisClient'

/*
 * TODO List
 * - [ ] implement a clean-up function that re-queues items that haven't transitioned
 *       to a completed state, or that failed
 */

export type DBInsert = {
  [K in keyof DB]: Insertable<DB[K]>
}

const POLLING_PERIOD_SEC = 60 // How often do we try to grab the lock and re-index?
const Q_MAX_LENGTH = 100 // How many EmbeddingIndex items do we batch in redis?
const WORD_COUNT_TO_TOKEN_RATIO = 3.0 / 2 // We multiple the word count by this to estimate token count

const {AI_EMBEDDER_ENABLED} = process.env
const {SERVER_ID} = process.env

tracer.init({
  service: `embedder`,
  appsec: process.env.DD_APPSEC_ENABLED === 'true',
  plugins: false,
  version: process.env.npm_package_version
})
tracer.use('pg')

const refreshMetadata = async () => {
  const dataLoader = getRootDataLoader()
  await refreshRetroDiscussionTopicsMeta(dataLoader)
  // In the future, other sorts of objects to index could be added here...
}
const maybeQueueMetadataItems = async (modelManager: ModelManager) => {
  const redisClient = getRedisClient()
  const queueLength = await redisClient.zcard('embedder:queue')
  if (queueLength >= Q_MAX_LENGTH) return
  const itemCountToQueue = Q_MAX_LENGTH - queueLength
  const modelTables = modelManager.embeddingModels.map((m) => m.tableName)
  const orgIds = await orgIdsWithFeatureFlag()

  // For each configured embedding model, select rows from EmbeddingsMetadata
  // that haven't been calculated nor exist in the EmbeddingsJobQueue yet
  //
  // Notes:
  //   * `em.models @> ARRAY[v.model]` is an indexed query
  //   * I don't love all overrides, I wish there was a better way
  //     see: https://github.com/kysely-org/kysely/issues/872

  const batchToQueue = await selectMetaToQueue(modelTables, orgIds, itemCountToQueue)

  if (!batchToQueue.length) {
    console.log(`embedder: no new items to queue`)
    return
  }

  const ejqHash: {
    [key: string]: {
      refUpdatedAt: Date
    }
  } = {}
  const makeKey = (item: {objectType: string; refId: string}) => `${item.objectType}:${item.refId}`

  const ejqValues = batchToQueue.map((item) => {
    ejqHash[makeKey(item)] = {
      refUpdatedAt: item.refUpdatedAt
    }
    return {
      objectType: item.objectType,
      refId: item.refId as string,
      model: item.model,
      state: 'queued' as const
    }
  })

  const ejqRows = await insertNewJobs(ejqValues)

  ejqRows.forEach((item) => {
    const {refUpdatedAt} = ejqHash[makeKey(item)]!
    const score = new Date(refUpdatedAt).getTime()
    redisClient.zadd('embedder:queue', score, item.id)
  })

  console.log(`embedder: queued ${batchToQueue.length} items`)
}

const dequeueAndEmbedUntilEmpty = async (modelManager: ModelManager) => {
  const dataLoader = getRootDataLoader()
  const redisClient = getRedisClient()
  while (true) {
    const maybeRedisQItem = await redisClient.zpopmax('embedder:queue', 1)
    if (maybeRedisQItem.length < 2) return // Q is empty, all done!

    const [id, _] = maybeRedisQItem
    if (!id) {
      console.log(`embedder: de-queued undefined item from embedder:queue`)
      continue
    }
    const jobQueueId = parseInt(id, 10)
    const jobQueueItem = await selectJobQueueItemById(jobQueueId)
    if (!jobQueueItem) {
      console.log(`embedder: unable to fetch EmbeddingsJobQueue.id = ${id}`)
      continue
    }

    const metadata = await selectMetadataByJobQueueId(jobQueueId)
    if (!metadata) {
      await updateJobState(jobQueueId, 'failed', {
        stateMessage: `unable to fetch metadata by EmbeddingsJobQueue.id = ${id}`
      })
      continue
    }

    let fullText = metadata?.fullText
    try {
      if (!fullText) {
        fullText = await createEmbeddingTextFrom(jobQueueItem, dataLoader)
      }
    } catch (e) {
      await updateJobState(jobQueueId, 'failed', {
        stateMessage: `unable to create embedding text: ${e}`
      })
      continue
    }

    const wordCount = countWords(fullText)

    const embeddingModel = modelManager.embeddingModelsMapByTable[jobQueueItem.model]
    if (!embeddingModel) {
      await updateJobState(jobQueueId, 'failed', {
        stateMessage: `embedding model ${jobQueueItem.model} not available`
      })
      continue
    }
    const itemKey = `${jobQueueItem.objectType}:${jobQueueItem.refId}`
    const modelTable = embeddingModel.tableName

    let embedText = fullText
    const maxInputTokens = embeddingModel.maxInputTokens
    // we're using word count as an appoximation of tokens
    if (wordCount * WORD_COUNT_TO_TOKEN_RATIO > maxInputTokens) {
      try {
        const generator = modelManager.generationModels[0] // use 1st generator
        if (!generator) throw new Error(`Generator unavailable`)
        const summarizeOptions = {maxInputTokens, truncate: true}
        console.log(`embedder:     ...summarizing ${itemKey} for ${modelTable}`)
        embedText = await generator.summarize(fullText, summarizeOptions)
      } catch (e) {
        await updateJobState(jobQueueId, 'failed', {
          stateMessage: `unable to summarize long embed text: ${e}`
        })
        continue
      }
    }
    // console.log(`embedText: ${embedText}`)

    let embeddingVector: number[]
    try {
      embeddingVector = await embeddingModel.getEmbedding(embedText)
    } catch (e) {
      await updateJobState(jobQueueId, 'failed', {
        stateMessage: `unable to get embeddings: ${e}`
      })
      continue
    }

    // complete job, do the following atomically
    // (1) update EmbeddingsMetadata to reflect model completion
    // (2) upsert model table row with embedding
    // (3) delete EmbeddingsJobQueue row
    await completeJobTxn(modelTable, jobQueueId, metadata, fullText, embedText, embeddingVector)
    console.log(`embedder: completed ${itemKey} -> ${modelTable}`)
  }
}

const tick = async (modelManager: ModelManager) => {
  console.log(`embedder: tick`)
  const redisClient = getRedisClient()
  const redlock = new Redlock([redisClient], {
    driftFactor: 0.01,
    retryCount: 10,
    retryDelay: 250,
    retryJitter: 50,
    automaticExtensionThreshold: 500
  })

  await redlock
    .using(['embedder:lock'], 10000, async (signal: RedlockAbortSignal) => {
      console.log(`embedder: acquired index queue lock`)
      // N.B. one of the many benefits of using redlock is the using() interface
      // will automatically extend the lock if these operations exceed the
      // original redis timeout time
      await refreshMetadata()
      await maybeQueueMetadataItems(modelManager)

      if (signal.aborted) {
        // Not certain which conditions this would happen, it would
        // happen after operations took place, so nothing much to do here.
        console.log('embedder: lock was lost!')
      }
    })
    .catch((err: string) => {
      // Handle errors (including lock acquisition errors)
      console.error('embedder: an error occurred ', err)
    })
  console.log('embedder: index queue lock released')

  // get the highest priority item and embed it
  await dequeueAndEmbedUntilEmpty(modelManager)

  setTimeout(() => tick(modelManager), POLLING_PERIOD_SEC * 1000)
}

function parseEnvBoolean(envVarValue: string | undefined): boolean {
  return envVarValue === 'true'
}

const run = async () => {
  console.log(`embedder: run()`)
  const embedderEnabled = parseEnvBoolean(AI_EMBEDDER_ENABLED)
  const modelManager = getModelManager()
  if (embedderEnabled && modelManager) {
    const pg = getKysely()
    await modelManager.maybeCreateTables(pg)
    console.log(`\n⚡⚡⚡️️ Server ID: ${SERVER_ID}. Embedder is ready ⚡⚡⚡️️️`)
    tick(modelManager)
  } else {
    console.log(`embedder: no valid configuration (check AI_EMBEDDER_ENABLED in .env)`)
    // exit
  }
}

run()
