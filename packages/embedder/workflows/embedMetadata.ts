import ms from 'ms'
import getKysely from 'parabol-server/postgres/getKysely'
import {JobQueueError} from '../JobQueueError'
import {EmbeddingsTableName} from '../ai_models/AbstractEmbeddingsModel'
import getModelManager from '../ai_models/ModelManager'
import {JobQueueStepRun, ParentJob} from '../custom'
import {createEmbeddingTextFrom, isEmbeddingOutdated} from '../indexing/createEmbeddingTextFrom'
import numberVectorToString from '../indexing/numberVectorToString'
import {getSimilarRetroTopics} from './getSimilarRetroTopics'

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
      metadata.language = language!
      await pg
        .updateTable('EmbeddingsMetadata')
        .set({fullText, language})
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
  // Cannot use summarization strategy if generation model has same context length as embedding model
  // We must split the text & not tokens because BERT tokenizer is not trained for linebreaks e.g. \n\n
  const errors = await Promise.all(
    chunks.map(async (chunk, chunkNumber) => {
      const embeddingVector = await embeddingModel.getEmbedding(chunk)
      if (embeddingVector instanceof Error) {
        return new JobQueueError(
          `unable to get embeddings: ${embeddingVector.message}`,
          ms('1m'),
          10,
          {forceBuildText: true}
        )
      }
      await pg
        // cast to any because these types won't be available in CI
        .insertInto(embeddingModel.tableName)
        .values({
          // TODO is the extra space of a null embedText really worth it?!
          embedText: chunks.length > 1 ? chunk : null,
          embedding: numberVectorToString(embeddingVector),
          embeddingsMetadataId,
          chunkNumber: chunks.length > 1 ? chunkNumber : null
        })
        .onConflict((oc) =>
          oc.columns(['embeddingsMetadataId', 'chunkNumber']).doUpdateSet((eb) => ({
            embedText: eb.ref('excluded.embedText'),
            embedding: eb.ref('excluded.embedding')
          }))
        )
        .execute()
      return undefined
    })
  )
  const firstError = errors.find((error) => error instanceof JobQueueError)
  // Logger.log(`Embedded ${embeddingsMetadataId} -> ${model}`)
  return firstError || data
}
