import ms from 'ms'
import getModelManager from '../ai_models/ModelManager'
import type {ModelId} from '../ai_models/modelIdDefinitions'
import type {JobQueueStepRun} from '../custom'
import {createEmbeddingTextFrom} from '../indexing/createEmbeddingTextFrom'
import {JobQueueError} from '../JobQueueError'
import {
  getRerankedEmbeddingsFromChunks,
  type SimilarEmbedding
} from './helpers/getRerankedEmbeddingsFromChunks'
import {publishSimilarRetroTopics} from './helpers/publishSimilarRetroTopics'

export const rerankRetroTopics: JobQueueStepRun<{
  similarEmbeddings: SimilarEmbedding[]
  embeddingsMetadataId: number
  modelId: ModelId
}> = async ({data, dataLoader}) => {
  const {similarEmbeddings, embeddingsMetadataId, modelId} = data
  const metadata = await dataLoader.get('embeddingsMetadata').load(embeddingsMetadataId)
  if (!metadata) return new JobQueueError(`Invalid embeddingsMetadataId: ${embeddingsMetadataId}`)

  let rerankText: string = ''
  try {
    const {body} = await createEmbeddingTextFrom(metadata, dataLoader, true)
    rerankText = body
  } catch (e) {
    return new JobQueueError(e as Error)
  }

  const modelManager = getModelManager()
  const embeddingModel = modelManager.embeddingModels.get(modelId)
  if (!embeddingModel) {
    return new JobQueueError(`embedding model ${modelId} not available`)
  }

  const chunks = await embeddingModel.chunkText(rerankText)
  if (chunks instanceof Error) {
    return new JobQueueError(`unable to get tokens: ${chunks.message}`, ms('1m'), 10)
  }

  const results = await getRerankedEmbeddingsFromChunks(
    embeddingsMetadataId,
    chunks,
    similarEmbeddings,
    embeddingModel
  )
  if (results instanceof JobQueueError) return results

  await publishSimilarRetroTopics(embeddingsMetadataId, results, dataLoader)
  return false
}
