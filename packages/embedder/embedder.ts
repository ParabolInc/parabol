import {Insertable, Selectable, Updateable, sql, RawBuilder} from 'kysely'
import tracer from 'dd-trace'
import Redlock, {RedlockAbortSignal} from 'redlock'

import 'parabol-server/initSentry'
import getRethink from 'parabol-server/database/rethinkDriver'
import {RDatum} from 'parabol-server/database/stricterR'
import getKysely from 'parabol-server/postgres/getKysely'
import RedisInstance from 'parabol-server/utils/RedisInstance'
import {DB} from 'parabol-server/postgres/pg'
import getDataLoader from 'parabol-server/graphql/getDataLoader'
import {refreshEmbeddingsMeta as refreshRetroDiscussionTopicsMeta} from './indexing/retrospectiveDiscussionTopic'
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
 *    storing that list (and metadata) in the EmbeddingsMetadata table
 * 2. Adding these items in batches to the EmbeddingsJobQueue table and a redis
 *    priority queue called `embedder:queue`
 * 3. Allowing one or more parallel embedding services to calculate the embedding
 *    vectors (EmbeddingJobQueue states queued -> embedding,
 *    then embedding -> [deleting the EmbeddingJobQueue row]
 *
 *    In addition to deleteing the EmbeddingJobQueue row, when a job completes
 *    successfully:
 *
 *       - A row is added to the model table with the embedding vector; the
 *         EmbeddingMetadataId field on this row points the appropriate
 *         metadata row on EmbeddingsMetadata
 *       - The EmbeddingsMetadata.models field is updated with the name of the
 *         table that the embedding has been generated for
 *
 * 4. This process repeats forever using a silly polling loop
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
  await refreshRetroDiscussionTopicsMeta(dataLoader)
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

const maybeQueueIndexTableItems = async (modelManager: ModelManager) => {
  const queueLength = await redisClient.zcard('embedder:queue')
  if (queueLength >= Q_MAX_LENGTH) return
  const itemCountToQueue = Q_MAX_LENGTH - queueLength
  const configuredModels = [...modelManager.getEmbeddingModelsIter()].map((m) => m.getTableName())
  const orgIds = await orgIdsWithFeatureFlag()

  // For each configured embedding model, select rows from EmbeddingsMetadata
  // that haven't been calculated nor exist in the EmbeddingsJobQueue yet
  //
  // Notes:
  //   * `em.models @> ARRAY[v.model]` is an indexed query
  //   * I don't love all overrides, I wish there was a better way
  //     see: https://github.com/kysely-org/kysely/issues/872

  function unnestedArray<T>(value: T): RawBuilder<T> {
    if (!Array.isArray(value)) {
      throw new TypeError('Value must be an array')
    }

    return sql`unnest(ARRAY[${sql.join(value)}]::varchar[])`
  }

  const batchToQueue = (await pg
    .selectFrom('EmbeddingsMetadata as em')
    .selectAll('em')
    .leftJoinLateral(unnestedArray(configuredModels).as('model'), (join) => join.onTrue())
    .leftJoin('Team as t', 'em.teamId', 't.id')
    .select('model' as any)
    .where(({eb, not, or, and, exists, selectFrom}) =>
      and([
        or([
          not(eb('em.models', '<@', sql`ARRAY[${sql.ref('model')}]::varchar[]` as any) as any),
          eb('em.models' as any, 'is', null)
        ]),
        not(
          exists(
            selectFrom('EmbeddingsJobQueue as ejq')
              .select('ejq.id')
              .whereRef('em.objectType', '=', 'ejq.objectType')
              .whereRef('em.refId', '=', 'ejq.refId')
              .whereRef('ejq.model', '=', 'model' as any)
          )
        ),
        eb('t.orgId', 'in', orgIds)
      ])
    )
    .limit(itemCountToQueue)
    .execute()) as unknown as Selectable<DB['EmbeddingsMetadata'] & {model: string}>[]

  if (!batchToQueue.length) {
    console.log(`embedder: no new items to queue`)
    return
  }

  const ejqHash: {
    [key: string]: {
      refUpdatedAt: Date
    }
  } = {}
  const makeKey = (item: {objectType: string | null; refId: string | null}) =>
    `${item.objectType}:${item.refId}`

  const ejqValues = batchToQueue.map((item) => {
    ejqHash[makeKey(item)] = {
      refUpdatedAt: item.refUpdatedAt
    }
    return {
      objectType: item.objectType,
      refId: item.refId as string,
      model: item.model,
      state: 'queued' as DBInsert['EmbeddingsJobQueue']['state']
    }
  })

  const ejqRows = await pg
    .insertInto('EmbeddingsJobQueue')
    .values(ejqValues)
    .returning(['id', 'objectType', 'refId'])
    .execute()

  ejqRows.forEach((item) => {
    const {refUpdatedAt} = ejqHash[makeKey(item)]!
    console.log(`embedder: queued index entry ${item.id}`)
    const score = new Date(refUpdatedAt).getTime()
    redisClient.zadd('embedder:queue', score, item.id)
  })

  console.log(`embedder: queued ${batchToQueue.length} items`)
}

const fetchJobQueueItemById = async (
  id: number
): Promise<Selectable<DB['EmbeddingsJobQueue']> | undefined> => {
  return pg.selectFrom('EmbeddingsJobQueue').selectAll().where('id', '=', id).executeTakeFirst()
}

const fetchMetadataByJobQueueId = async (
  id: number
): Promise<Selectable<DB['EmbeddingsMetadata']> | undefined> => {
  return pg
    .selectFrom('EmbeddingsMetadata as em')
    .selectAll()
    .leftJoin('EmbeddingsJobQueue as ejq', (join) =>
      join.onRef('em.objectType', '=', 'ejq.objectType').onRef('em.refId', '=', 'ejq.refId')
    )
    .where('ejq.id', '=', id)
    .executeTakeFirstOrThrow()
}

const updateJobState = async (
  id: number,
  state: Updateable<DB['EmbeddingsJobQueue']>['state'],
  jobQueueFields: Updateable<DB['EmbeddingsJobQueue']> = {}
) => {
  const jobQueueColumns: Updateable<DB['EmbeddingsJobQueue']> = {
    ...jobQueueFields,
    state
  }
  return pg
    .updateTable('EmbeddingsJobQueue')
    .set(jobQueueColumns)
    .where('id', '=', id)
    .executeTakeFirstOrThrow()
}

const dequeueAndEmbedUntilEmpty = async (modelManager: ModelManager) => {
  while (true) {
    const maybeRedisQItem = await redisClient.zpopmax('embedder:queue', 1)
    if (maybeRedisQItem.length < 2) return // Q is empty, all done!

    const [id, _] = maybeRedisQItem
    if (!id) {
      console.warn(`De-queued undefined item from embedder:queue`)
      continue
    }
    const jobQueueId = parseInt(id, 10)
    const jobQueueItem = await fetchJobQueueItemById(jobQueueId)
    if (!jobQueueItem) {
      console.warn(`Unable to fetch EmbeddingsJobQueue.id = ${id}`)
      continue
    }

    const metadata = await fetchMetadataByJobQueueId(jobQueueId)

    let fullText = metadata?.embedText
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
    for (const embeddingModel of modelManager.getEmbeddingModelsIter()) {
      let textToEmbed = fullText
      const {maxInputTokens} = embeddingModel.getModelParams()
      // we're using word count as an appoximation of tokens
      if (wordCount * WORD_COUNT_TO_TOKEN_RATIO > maxInputTokens) {
        try {
          const generator = modelManager.getFirstGenerator()
          if (!generator) throw new Error(`Generator unavailable`)
          const textToSummarize = fullText.slice(0, generator.getModelParams().maxInputTokens)
          textToEmbed = await generator.summarize(textToSummarize, 0.8, maxInputTokens)
        } catch (e) {
          await updateJobState(jobQueueId, 'failed', {
            stateMessage: `unable to summarize long embed text: ${e}`
          })
          continue
        }
      }
      console.log(`textToEmbed: ${textToEmbed}`)
      let embeddingVector: number[]
      try {
        embeddingVector = await embeddingModel.getEmbedding(textToEmbed)
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
      await pg.transaction().execute(async (trx) => {
        const modelTable = embeddingModel.getTableName()
        // get fields to update correct metadata row
        const jobQueueItem = await trx
          .selectFrom('EmbeddingsJobQueue')
          .select(['objectType', 'refId', 'model'])
          .where('id', '=', jobQueueId)
          .executeTakeFirstOrThrow()
        // (1) update metadata row
        const metadataColumnsToUpdate: {
          models: RawBuilder<string[]>
          embedText?: string | null | undefined
        } = {
          // update models as a set
          models: sql<string[]>`(
SELECT array_agg(DISTINCT value)
FROM (
  SELECT unnest(COALESCE("models", '{}')) AS value
  UNION
  SELECT unnest(ARRAY[${modelTable}]::VARCHAR[]) AS value
) AS combined_values
)`
        }
        if (metadata?.embedText !== fullText) {
          metadataColumnsToUpdate.embedText = fullText
        }
        const updatedMetadata = await trx
          .updateTable('EmbeddingsMetadata')
          .set(metadataColumnsToUpdate)
          .where('objectType', '=', jobQueueItem.objectType)
          .where('refId', '=', jobQueueItem.refId)
          .returning(['id'])
          .executeTakeFirstOrThrow()
        // (2) upsert into model table
        await trx
          .insertInto(modelTable as any)
          .values({
            embedText: fullText !== textToEmbed ? textToEmbed : null,
            embedding: numberVectorToString(embeddingVector),
            embeddingsMetadataId: updatedMetadata.id
          })
          .onConflict((oc) =>
            oc.column('id').doUpdateSet((eb) => ({
              embedText: eb.ref('excluded.embedText'),
              embeddingsMetadataId: eb.ref('excluded.embeddingsMetadataId')
            }))
          )
          .executeTakeFirstOrThrow()
        // (3) delete completed job queue item
        return await trx
          .deleteFrom('EmbeddingsJobQueue')
          .where('id', '=', jobQueueId)
          .executeTakeFirstOrThrow()
      })
    }
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
      await maybeQueueIndexTableItems(modelManager)

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
  console.log(`embedder: no valid configuration (check AI_EMBEDDER_ENABLED in .env)`)
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
    await modelManager.createEmbeddingsTables(pg)
    console.log(`\n⚡⚡⚡️️ Server ID: ${SERVER_ID}. Embedder is ready ⚡⚡⚡️️️`)
    tick(modelManager)
  } else {
    doNothingForever()
  }
}

run()
