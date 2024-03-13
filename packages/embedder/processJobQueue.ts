import {sql} from 'kysely'
import ms from 'ms'
import sleep from 'parabol-client/utils/sleep'
import 'parabol-server/initSentry'
import getKysely from 'parabol-server/postgres/getKysely'
import {EmbeddingsTable} from './ai_models/AbstractModel'
import {ModelManager} from './ai_models/ModelManager'
import {createEmbeddingTextFrom} from './indexing/createEmbeddingTextFrom'
import {getRootDataLoader} from './indexing/getRootDataLoader'
import numberVectorToString from './indexing/numberVectorToString'
import {updateJobState} from './indexing/updateJobState'

export const processJobQueue = async (modelManager: ModelManager) => {
  const pg = getKysely()
  const dataLoader = getRootDataLoader()

  // use a loop here to avoid tail call recursion since this will run indefinitely
  while (true) {
    let job = await pg
      .with(
        (cte) => cte('ids').materialized(),
        (db) =>
          db
            .selectFrom('EmbeddingsJobQueue')
            .select('id')
            .where('state', '=', 'queued')
            .limit(1)
            .forUpdate()
            .skipLocked()
      )
      .updateTable('EmbeddingsJobQueue')
      .set({state: 'embedding'})
      .where('id', '=', sql`ANY(SELECT id FROM ids)` as any)
      .returningAll()
      .executeTakeFirst()
    if (!job) {
      job = await pg
        .with(
          (cte) => cte('ids').materialized(),
          (db) =>
            db
              .selectFrom('EmbeddingsJobQueue')
              .select('id')
              .where('state', '=', 'failed')
              .where('retryAfter', '<', sql`NOW()`)
              .limit(1)
              .forUpdate()
              .skipLocked()
        )
        .updateTable('EmbeddingsJobQueue')
        .set({state: 'embedding'})
        .where('id', '=', sql`ANY(SELECT id FROM ids)` as any)
        .returningAll()
        .executeTakeFirst()
      if (!job) {
        // the queue is empty! wait a minute
        await sleep(ms('1m'))
        continue
      }
    }

    const metadata = await pg
      .selectFrom('EmbeddingsMetadata')
      .selectAll()
      .where('id', '=', job.embeddingsMetadataId)
      .executeTakeFirst()

    if (!metadata) {
      await updateJobState(job.id, 'failed', {
        stateMessage: `unable to fetch metadata by EmbeddingsJobQueue.id = ${job.id}`
      })
      continue
    }

    let {fullText} = metadata
    try {
      if (!fullText) {
        fullText = await createEmbeddingTextFrom(metadata, dataLoader)
        await pg
          .updateTable('EmbeddingsMetadata')
          .set({fullText})
          .where('id', '=', metadata.id)
          .execute()
      }
    } catch (e) {
      await updateJobState(job.id, 'failed', {
        stateMessage: `unable to create embedding text: ${e}`
      })
      continue
    }

    const embeddingModel = modelManager.embeddingModelsMapByTable[job.model]
    if (!embeddingModel) {
      await updateJobState(job.id, 'failed', {
        stateMessage: `embedding model ${job.model} not available`
      })
      continue
    }

    const tokens = await embeddingModel.getTokens(fullText)
    if (tokens instanceof Error) {
      await updateJobState(job.id, 'failed', {
        stateMessage: `unable to get tokens: ${tokens.message}`
      })
      continue
    }

    if (tokens.length > embeddingModel.maxInputTokens) {
      await updateJobState(job.id, 'failed', {
        stateMessage: `fullText is too long for ${job.model}`
      })
      continue
    }

    const embeddingVector = await embeddingModel.getEmbedding(fullText)
    if (embeddingVector instanceof Error) {
      await updateJobState(job.id, 'failed', {
        stateMessage: `unable to get embeddings: ${embeddingVector.message}`
      })
      continue
    }

    await pg
      .insertInto(embeddingModel.tableName as EmbeddingsTable)
      .values({
        // TODO is the extra space really worth it?!
        embedText: null,
        embedding: numberVectorToString(embeddingVector),
        embeddingsMetadataId: job.embeddingsMetadataId
      })
      .onConflict((oc) =>
        oc.doUpdateSet((eb) => ({
          embedText: eb.ref('excluded.embedText'),
          embedding: eb.ref('excluded.embedding')
        }))
      )
      .execute()

    await pg.deleteFrom('EmbeddingsJobQueue').where('id', '=', job.id).executeTakeFirstOrThrow()
    console.log(`embedder: completed ${job.embeddingsMetadataId} -> ${job.model}`)
  }
}
