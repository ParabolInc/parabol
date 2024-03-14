import {sql} from 'kysely'
import ms from 'ms'
import sleep from 'parabol-client/utils/sleep'
import 'parabol-server/initSentry'
import getKysely from 'parabol-server/postgres/getKysely'
import {EmbeddingsTable} from './ai_models/AbstractEmbeddingsModel'
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
              .where('retryAfter', '<', new Date())
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

    const {id: jobId, embeddingsMetadataId, retryCount, model} = job
    const metadata = await pg
      .selectFrom('EmbeddingsMetadata')
      .selectAll()
      .where('id', '=', embeddingsMetadataId)
      .executeTakeFirst()

    if (!metadata) {
      await updateJobState(jobId, 'failed', {
        stateMessage: `unable to fetch metadata by EmbeddingsJobQueue.id = ${jobId}`,
        retryCount: retryCount + 1
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
      await updateJobState(jobId, 'failed', {
        stateMessage: `unable to create embedding text: ${e}`,
        retryCount: retryCount + 1
      })
      continue
    }

    const embeddingModel = modelManager.embeddingModelsMapByTable[model]
    if (!embeddingModel) {
      await updateJobState(jobId, 'failed', {
        stateMessage: `embedding model ${model} not available`,
        retryCount: retryCount + 1
      })
      continue
    }

    const tokens = await embeddingModel.getTokens(fullText)
    if (tokens instanceof Error) {
      await updateJobState(jobId, 'failed', {
        stateMessage: `unable to get tokens: ${tokens.message}`,
        retryCount: retryCount + 1,
        retryAfter: retryCount < 10 ? new Date(Date.now() + ms('1m')) : null
      })
      continue
    }

    const isFullTextTooBig = tokens.length > embeddingModel.maxInputTokens
    // Cannot use summarization strategy if generation model has same context length as embedding model
    // We must split the text & not tokens because the endpoint doesn't support decoding input tokens
    const chunks = isFullTextTooBig ? embeddingModel.splitText(fullText, 0) : [fullText]

    await Promise.all(
      chunks.map(async (chunk, chunkNumber) => {
        const embeddingVector = await embeddingModel.getEmbedding(chunk)
        if (embeddingVector instanceof Error) {
          await updateJobState(jobId, 'failed', {
            stateMessage: `unable to get embeddings: ${embeddingVector.message}`,
            retryCount: retryCount + 1,
            retryAfter: retryCount < 10 ? new Date(Date.now() + ms('1m')) : null
          })
          return
        }
        await pg
          .insertInto(embeddingModel.tableName as EmbeddingsTable)
          .values({
            // TODO is the extra space of a null embedText really worth it?!
            embedText: isFullTextTooBig ? chunk : null,
            embedding: numberVectorToString(embeddingVector),
            embeddingsMetadataId,
            chunkNumber: isFullTextTooBig ? chunkNumber : null
          })
          .onConflict((oc) =>
            oc.doUpdateSet((eb) => ({
              embedText: eb.ref('excluded.embedText'),
              embedding: eb.ref('excluded.embedding')
            }))
          )
          .execute()
      })
    )

    await pg.deleteFrom('EmbeddingsJobQueue').where('id', '=', jobId).executeTakeFirstOrThrow()
    console.log(`embedder: completed ${embeddingsMetadataId} -> ${model}`)
  }
}
