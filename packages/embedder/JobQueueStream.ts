import {Selectable, sql} from 'kysely'
import ms from 'ms'
import sleep from 'parabol-client/utils/sleep'
import RootDataLoader from 'parabol-server/dataloader/RootDataLoader'
import 'parabol-server/initSentry'
import getKysely from 'parabol-server/postgres/getKysely'
import {DB} from 'parabol-server/postgres/pg'
import {EmbeddingsTable} from './ai_models/AbstractEmbeddingsModel'
import {ModelManager} from './ai_models/ModelManager'
import {createEmbeddingTextFrom} from './indexing/createEmbeddingTextFrom'
import numberVectorToString from './indexing/numberVectorToString'
import {updateJobState} from './indexing/updateJobState'

type Job = Selectable<DB['EmbeddingsJobQueue']>
export default class JobQueueStream implements AsyncIterableIterator<Job> {
  private dataLoader: RootDataLoader
  private modelManager: ModelManager

  constructor(modelManager: ModelManager, dataLoader: RootDataLoader) {
    this.modelManager = modelManager
    this.dataLoader = dataLoader
  }

  [Symbol.asyncIterator]() {
    return this
  }
  async next(): Promise<IteratorResult<Job>> {
    const pg = getKysely()
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
      .set({state: 'embedding', startAt: new Date()})
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
        console.log('JobQueueStream: no jobs found')
        // queue is empty, so sleep for a while
        await sleep(ms('1m'))
        return this.next()
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
      return this.next()
    }

    let {fullText} = metadata
    try {
      if (!fullText) {
        fullText = await createEmbeddingTextFrom(metadata, this.dataLoader)
        await pg
          .updateTable('EmbeddingsMetadata')
          .set({fullText})
          .where('id', '=', embeddingsMetadataId)
          .execute()
      }
    } catch (e) {
      // get the trace since the error message may be unobvious
      console.trace(e)
      await updateJobState(jobId, 'failed', {
        stateMessage: `unable to create embedding text: ${e}`,
        retryCount: retryCount + 1
      })
      return this.next()
    }

    const embeddingModel = this.modelManager.embeddingModelsMapByTable[model]
    if (!embeddingModel) {
      await updateJobState(jobId, 'failed', {
        stateMessage: `embedding model ${model} not available`,
        retryCount: retryCount + 1
      })
      return this.next()
    }

    const tokens = await embeddingModel.getTokens(fullText)
    if (tokens instanceof Error) {
      await updateJobState(jobId, 'failed', {
        stateMessage: `unable to get tokens: ${tokens.message}`,
        retryCount: retryCount + 1,
        retryAfter: retryCount < 10 ? new Date(Date.now() + ms('1m')) : null
      })
      return this.next()
    }

    const isFullTextTooBig = tokens.length > embeddingModel.maxInputTokens
    // Cannot use summarization strategy if generation model has same context length as embedding model
    // We must split the text & not tokens because the endpoint doesn't support decoding input tokens
    const chunks = isFullTextTooBig ? embeddingModel.splitText(fullText, 0) : [fullText]
    if (isFullTextTooBig) {
      console.log('we split!', chunks)
    }
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
          // cast to any because these types won't be available in CI
          .insertInto(embeddingModel.tableName as EmbeddingsTable)
          .values({
            // TODO is the extra space of a null embedText really worth it?!
            embedText: isFullTextTooBig ? chunk : null,
            embedding: numberVectorToString(embeddingVector),
            embeddingsMetadataId,
            chunkNumber: isFullTextTooBig ? chunkNumber : null
          })
          .onConflict((oc) =>
            oc.column('embeddingsMetadataId').doUpdateSet((eb) => ({
              embedText: eb.ref('excluded.embedText'),
              embedding: eb.ref('excluded.embedding')
            }))
          )
          .execute()
      })
    )

    await pg.deleteFrom('EmbeddingsJobQueue').where('id', '=', jobId).executeTakeFirstOrThrow()
    return {done: false, value: job}
  }
  return() {
    return Promise.resolve({done: true as const, value: undefined})
  }
  throw(error: any) {
    return Promise.resolve({done: true, value: error})
  }
}
