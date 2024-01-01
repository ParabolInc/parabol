import {Insertable, Selectable, Updateable, sql} from 'kysely'
import tracer from 'dd-trace'
import Redlock, {RedlockAbortSignal} from 'redlock'

import 'parabol-server/initSentry'
import getRethink from 'parabol-server/database/rethinkDriver'
import {RDatum} from 'parabol-server/database/stricterR'
import getKysely from 'parabol-server/postgres/getKysely'
import RedisInstance from 'parabol-server/utils/RedisInstance'
import {DB} from 'parabol-server/postgres/pg'
import getDataLoader from 'parabol-server/graphql/getDataLoader'
import {refreshEmbeddingsIndex as refreshRetroDiscussionTopicsEmbeddingsIndex} from './indexing/retrospectiveDiscussionTopic'
import numberVectorToString from './indexing/numberVectorToString'
import getModelManager, {ModelManager} from './ai_models/ModelManager'
import {countWords} from './indexing/countWords'
import {createEmbeddingTextFrom} from './indexing/createEmbeddingTextFrom'
import {DataLoaderWorker} from 'parabol-server/graphql/graphql'

/*
 * Embedder service
 *
 * This service builds embedding vectors for semantic search. It does so
 * by:
 *
 * 1. Updating a list of all possible items to generating embedding vectors for and
 *    storing that list (and metadata) in the EmbeddingIndex table
 * 2. Adding these items in batches to a redis queue (EmbeddingIndex state new -> queued)
 * 3. Allowing one or more parallel embedding services to calculate the embedding
 *    vectors (Embedding Index states queued -> embedding, then embedding -> embedded)
 * 4. Repeating forever on a polling loop
 *
 * In the future, it would be wonderful to enhance this service such that it were
 * event driven, and new items were added to the EmbeddingIndex table via a published
 * redis events.
 */

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

const pg = getKysely()
const dataLoader = getDataLoader() as DataLoaderWorker

const redisClient = new RedisInstance(`embedder-${SERVER_ID}`)
const redlock = new Redlock([redisClient], {
  driftFactor: 0.01,
  retryCount: 10,
  retryDelay: 250,
  retryJitter: 50,
  automaticExtensionThreshold: 500
})

const refreshIndexTable = async () => {
  await refreshRetroDiscussionTopicsEmbeddingsIndex(dataLoader)
  // In the future, other sorts of objects to index could be added here...
}

const orgIdsWithFeatureFlag = async () => {
  // I had to add a secondary index to the Organization table to get
  // this query to be cheap
  const r = await getRethink()
  return await r
    .table('Organization')
    .getAll('relatedDiscussions', {index: 'featureFlagsIndex' as any})
    .filter((r: RDatum) => r('featureFlags').contains('relatedDiscussions'))
    .map((r: RDatum) => r('id'))
    .coerceTo('array')
    .run()
}

const maybeQueueIndexTableItems = async () => {
  const queueLength = await redisClient.zcard('embedder:queue')
  if (queueLength >= Q_MAX_LENGTH) return
  const itemCountToQueue = Q_MAX_LENGTH - queueLength
  const orgIds = await orgIdsWithFeatureFlag()
  const batchToQueue = await pg
    .selectFrom('EmbeddingsIndex')
    .selectAll()
    .where('state', '=', 'new')
    .where('orgId', 'in', orgIds)
    .limit(itemCountToQueue)
    .execute()

  if (!batchToQueue.length) {
    console.log(`embedder: no new items to queue`)
    return
  }

  batchToQueue.forEach((item) => {
    console.log(`embedder: queued index entry ${item.id}`)
    const score = new Date(item.refDateTime).getTime()
    redisClient.zadd('embedder:queue', score, item.id)
  })

  await pg
    .updateTable('EmbeddingsIndex')
    .set({
      state: 'queued',
      stateUpdatedAt: new Date() // This sets the column to the current time
    })
    .where(
      'id',
      'in',
      batchToQueue.map((item) => item.id)
    )
    .execute()

  console.log(`embedder: queued ${batchToQueue.length} items`)
}

const fetchEmbeddedIndexItemById = async (
  id: number
): Promise<Selectable<DB['EmbeddingsIndex']> | undefined> => {
  return pg.selectFrom('EmbeddingsIndex').selectAll().where('id', '=', id).executeTakeFirst()
}

const updateEmbeddedIndexItemStateById = async (
  id: number,
  state: Updateable<DB['EmbeddingsIndex']>['state'],
  otherFields: Updateable<DB['EmbeddingsIndex']> = {}
) => {
  // we treat models as a set
  const {models: maybeModels, ...restOfOtherFields} = otherFields
  const modelsUpdate = maybeModels
    ? {
        models: sql`(
      SELECT array_agg(DISTINCT value)
      FROM (
        SELECT unnest(COALESCE("models", '{}')) AS value
        UNION
        SELECT unnest(${maybeModels}::text[]) AS value
      ) AS combined_values
    )` as unknown as string[]
      }
    : {}

  const columnsToUpdate: Updateable<DB['EmbeddingsIndex']> = {
    ...restOfOtherFields,
    state,
    stateUpdatedAt: new Date(),
    ...modelsUpdate
  }
  return pg.updateTable('EmbeddingsIndex').set(columnsToUpdate).where('id', '=', id).execute()
}

const dequeueAndEmbedUntilEmpty = async (modelManager: ModelManager) => {
  while (true) {
    const maybeQItem = await redisClient.zpopmax('embedder:queue', 1)
    if (maybeQItem.length < 2) return // Q is empty, all done!

    const [embeddingsIndexIdStr, _] = maybeQItem
    if (!embeddingsIndexIdStr) {
      console.warn(`De-queued undefined item from embedder:queue`)
      continue
    }
    const embeddingsIndexId = parseInt(embeddingsIndexIdStr, 10)
    const embeddingsIndexItem = await fetchEmbeddedIndexItemById(embeddingsIndexId)
    if (!embeddingsIndexItem) {
      await updateEmbeddedIndexItemStateById(embeddingsIndexId, 'failed', {
        stateMessage: `unable to fetch ${embeddingsIndexId} from EmbeddingsIndex`
      })
      continue
    }

    let fullText: string
    try {
      fullText = await createEmbeddingTextFrom(embeddingsIndexItem, dataLoader)
    } catch (e) {
      await updateEmbeddedIndexItemStateById(embeddingsIndexId, 'failed', {
        stateMessage: `unable to create embedding text: ${e}`
      })
      continue
    }

    const wordCount = countWords(fullText)
    const modelsRan: string[] = []
    for (const embeddingsModel of modelManager.getEmbeddingsModelsIter()) {
      let textToEmbed = fullText
      const {maxInputTokens} = embeddingsModel.getModelParams()
      // we're using word count as an appoximation of tokens
      if (wordCount * WORD_COUNT_TO_TOKEN_RATIO > maxInputTokens) {
        try {
          const generator = modelManager.getGenerator()
          if (!generator) throw new Error(`Generator unavailable`)
          const textToSummarize = fullText.slice(0, generator.getModelParams().maxInputTokens)
          textToEmbed = await generator.summarize(textToSummarize, 0.8, maxInputTokens)
        } catch (e) {
          await updateEmbeddedIndexItemStateById(embeddingsIndexId, 'failed', {
            stateMessage: `unable to summarize long embed text: ${e}`
          })
          continue
        }
      }
      console.log(`textToEmbed: ${textToEmbed}`)
      let embeddingsVector: number[]
      try {
        embeddingsVector = await embeddingsModel.getEmbeddings(textToEmbed)
      } catch (e) {
        await updateEmbeddedIndexItemStateById(embeddingsIndexId, 'failed', {
          stateMessage: `unable to get embeddings: ${e}`
        })
        continue
      }

      // upsert
      await pg
        .insertInto(embeddingsModel.getTableName() as any)
        .values({
          embedText: fullText.length !== textToEmbed.length ? textToEmbed : null,
          embedding: numberVectorToString(embeddingsVector),
          embeddingsIndexId: embeddingsIndexId
        })
        .onConflict((oc) =>
          oc
            .column('id') // Assuming 'id' is the unique column that might cause a conflict
            .doUpdateSet((eb) => ({
              embedText: eb.ref('excluded.embedText'),
              embeddingsIndexId: eb.ref('excluded.embeddingsIndexId')
            }))
        )
        .execute()
      modelsRan.push(embeddingsModel.getTableName())
    }
    // update EmbeddingIndex row
    await updateEmbeddedIndexItemStateById(embeddingsIndexId, 'embedded', {
      embedText: fullText,
      stateMessage: null,
      models: modelsRan
    })
  }
}

const tick = async (modelManager: ModelManager) => {
  console.log(`embedder: tick`)
  await redlock
    .using(['embedder:lock'], 10000, async (signal: RedlockAbortSignal) => {
      console.log(`embedder: acquired index queue lock`)
      // N.B. one of the many benefits of using redlock is the using() interface
      // will automatically extend the lock if these operations exceed the
      // original redis timeout time
      await refreshIndexTable()
      await maybeQueueIndexTableItems()

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

const doNothingForever = () => {
  console.log(`embedder: no valid configuration (check GPT_MODELS in .env)`)
  setTimeout(doNothingForever, 60 * 1000)
}

function parseEnvBoolean(envVarValue: string | undefined): boolean {
  return envVarValue === 'true'
}

const run = async () => {
  console.log(`embedder: run()`)
  const embedderEnabled = parseEnvBoolean(AI_EMBEDDER_ENABLED)
  const modelManager = getModelManager()
  if (embedderEnabled && modelManager) {
    modelManager.createEmbeddingsTables(pg).then(() => {
      console.log(`\n⚡⚡⚡️️ Server ID: ${SERVER_ID}. Embedder is ready ⚡⚡⚡️️️`)
      tick(modelManager)
    })
  } else {
    console.log('WARN: embedder service not enabled in AI_CONFIG (check .env)')
    doNothingForever()
  }
}

run()
