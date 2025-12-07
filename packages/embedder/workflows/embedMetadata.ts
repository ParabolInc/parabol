import {sql} from 'kysely'
import ms from 'ms'
import getKysely from 'parabol-server/postgres/getKysely'
import RedisInstance from 'parabol-server/utils/RedisInstance'
import type {EmbeddingsTableName} from '../ai_models/AbstractEmbeddingsModel'
import getModelManager from '../ai_models/ModelManager'
import type {JobQueueStepRun, ParentJob} from '../custom'
import {createEmbeddingTextFrom, isEmbeddingOutdated} from '../indexing/createEmbeddingTextFrom'
import numberVectorToString from '../indexing/numberVectorToString'
import {JobQueueError} from '../JobQueueError'
import {PriorityLock} from '../PriorityLock'
import type {getSimilarRetroTopics} from './getSimilarRetroTopics'

export const embedMetadata: JobQueueStepRun<
  {
    embeddingsMetadataId: number
    model: EmbeddingsTableName
    forceBuildText?: boolean
  },
  ParentJob<typeof getSimilarRetroTopics>
> = async (context) => {
  const {data, dataLoader} = context
  const pg = getKysely()
  const {embeddingsMetadataId, model, forceBuildText} = data
  const modelManager = getModelManager()
  const SERVER_ID = process.env.SERVER_ID || 'embedder'
  const redis = new RedisInstance(`embedder_queue_${SERVER_ID}`)
  const priorityLock = new PriorityLock(redis)

  await priorityLock.waitForLowPriority()

  const metadata = await dataLoader.get('embeddingsMetadata').load(embeddingsMetadataId)
  if (!metadata) return new JobQueueError(`Invalid embeddingsMetadataId: ${embeddingsMetadataId}`)

  const updateFullText =
    !metadata.fullText ||
    !metadata.language ||
    forceBuildText ||
    (await isEmbeddingOutdated(metadata, dataLoader))

  if (updateFullText) {
    try {
      const {body: fullText, language} = await createEmbeddingTextFrom(metadata, dataLoader)
      metadata.fullText = fullText
      metadata.language = language! as any
      await pg
        .updateTable('EmbeddingsMetadata')
        .set({fullText, language: language as any, refUpdatedAt: new Date()})
        .where('id', '=', embeddingsMetadataId)
        .execute()
    } catch (e) {
      return new JobQueueError(e as Error, undefined, 0, {
        forceBuildText: true
      })
    }
  }
  const {fullText, language} = metadata

  const embeddingModel = modelManager.getEmbedder(model)
  if (!embeddingModel) {
    return new JobQueueError(`embedding model ${model} not available`)
  }
  // Exit successfully, we don't want to fail the job because the language is not supported
  if (!language || !embeddingModel.languages.includes(language)) return false
  const chunks = await embeddingModel.chunkText(fullText!)
  if (chunks instanceof Error) {
    return new JobQueueError(`unable to get tokens: ${chunks.message}`, ms('1m'), 10, {
      forceBuildText: true
    })
  }
  // Delete existing chunks for this metadataID to prevent stale data
  await pg
    // cast to any because these types won't be available in CI
    .deleteFrom(embeddingModel.tableName as any)
    .where('embeddingsMetadataId', '=', embeddingsMetadataId)
    .execute()

  // Cannot use summarization strategy if generation model has same context length as embedding model
  // We must split the text & not tokens because BERT tokenizer is not trained for linebreaks e.g. \n\n
  const errors: (JobQueueError | undefined)[] = []

  for (let i = 0; i < chunks.length; i++) {
    // Pause embedding if a search is active, prioritizing seach over embedding:
    await priorityLock.waitForLowPriority()
    const chunk = chunks[i]!
    const embeddingVector = await embeddingModel.getEmbedding(chunk)
    if (embeddingVector instanceof Error) {
      errors.push(
        new JobQueueError(`unable to get embeddings: ${embeddingVector.message}`, ms('1m'), 10, {
          forceBuildText: true
        })
      )
      continue
    }
    await pg
      // cast to any because these types won't be available in CI
      .insertInto(embeddingModel.tableName as any)
      .values({
        // TODO is the extra space of a null embedText really worth it?!
        embedText: chunk,
        tsv: sql`to_tsvector('english', ${chunk})`, // TODO: other languages
        embedding: numberVectorToString(embeddingVector),
        embeddingsMetadataId,
        chunkNumber: chunks.length > 1 ? i : null
      })
      .execute()
  }
  const firstError = errors.find((error) => error instanceof JobQueueError)
  // Logger.log(`Embedded ${embeddingsMetadataId} -> ${model}`)
  return firstError || data
}
