import franc from 'franc-min'
import ms from 'ms'
import RootDataLoader from 'parabol-server/dataloader/RootDataLoader'
import getKysely from 'parabol-server/postgres/getKysely'
import {EmbedJob} from './EmbeddingsJobQueueStream'
import {EmbeddingsTable} from './ai_models/AbstractEmbeddingsModel'
import getModelManager from './ai_models/ModelManager'
import {createEmbeddingTextFrom} from './indexing/createEmbeddingTextFrom'
import {failJob} from './indexing/failJob'
import numberVectorToString from './indexing/numberVectorToString'
import {iso6393To1} from './iso6393To1'

export const processJobEmbed = async (job: EmbedJob, dataLoader: RootDataLoader) => {
  const pg = getKysely()
  const {id: jobId, retryCount, jobData} = job
  const {embeddingsMetadataId, model} = jobData
  const modelManager = getModelManager()

  const metadata = await pg
    .selectFrom('EmbeddingsMetadata')
    .selectAll()
    .where('id', '=', embeddingsMetadataId)
    .executeTakeFirst()

  if (!metadata) {
    await failJob(jobId, `unable to fetch metadata by EmbeddingsJobQueue.id = ${jobId}`)
    return
  }

  let {fullText, language} = metadata
  try {
    if (!fullText) {
      fullText = await createEmbeddingTextFrom(metadata, dataLoader)
      language = iso6393To1[franc(fullText) as keyof typeof iso6393To1]
      await pg
        .updateTable('EmbeddingsMetadata')
        .set({fullText, language})
        .where('id', '=', embeddingsMetadataId)
        .execute()
    }
  } catch (e) {
    // get the trace since the error message may be unobvious
    console.trace(e)
    await failJob(jobId, `unable to create embedding text: ${e}`)
    return
  }

  const embeddingModel = modelManager.embeddingModels.get(model)
  if (!embeddingModel) {
    await failJob(jobId, `embedding model ${model} not available`)
    return
  }

  // Exit successfully, we don't want to fail the job because the language is not supported
  if (!embeddingModel.languages.includes(language!)) return true

  const chunks = await embeddingModel.chunkText(fullText)
  if (chunks instanceof Error) {
    await failJob(
      jobId,
      `unable to get tokens: ${chunks.message}`,
      retryCount < 10 ? new Date(Date.now() + ms('1m')) : null
    )
    return
  }
  // Cannot use summarization strategy if generation model has same context length as embedding model
  // We must split the text & not tokens because BERT tokenizer is not trained for linebreaks e.g. \n\n
  const isSuccessful = await Promise.all(
    chunks.map(async (chunk, chunkNumber) => {
      const embeddingVector = await embeddingModel.getEmbedding(chunk)
      if (embeddingVector instanceof Error) {
        await failJob(
          jobId,
          `unable to get embeddings: ${embeddingVector.message}`,
          retryCount < 10 ? new Date(Date.now() + ms('1m')) : null
        )
        return false
      }
      await pg
        // cast to any because these types won't be available in CI
        .insertInto(embeddingModel.tableName as EmbeddingsTable)
        .values({
          // TODO is the extra space of a null embedText really worth it?!
          embedText: chunks.length > 1 ? chunk : null,
          embedding: numberVectorToString(embeddingVector),
          embeddingsMetadataId,
          chunkNumber: chunks.length > 1 ? chunkNumber : null
        })
        .onConflict((oc) =>
          oc.column('embeddingsMetadataId').doUpdateSet((eb) => ({
            embedText: eb.ref('excluded.embedText'),
            embedding: eb.ref('excluded.embedding')
          }))
        )
        .execute()
      return true
    })
  )
  // Logger.log(`Embedded ${embeddingsMetadataId} -> ${model}`)
  return isSuccessful
}
