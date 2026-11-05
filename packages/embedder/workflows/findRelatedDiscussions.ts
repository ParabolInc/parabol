import {sql} from 'kysely'
import getKysely from '../../server/postgres/getKysely'
import getModelManager from '../ai_models/ModelManager'
import {type ModelId, modelIdDefinitions} from '../ai_models/modelIdDefinitions'
import type {JobQueueStepRun} from '../custom'
import numberVectorToString from '../indexing/numberVectorToString'
import {JobQueueError} from '../JobQueueError'
import {publishSimilarRetroTopics} from './helpers/publishSimilarRetroTopics'

const MAX_RELATED_DISCUSSIONS = 3

export const getStepAfterEmbeddingTopic = (modelId: ModelId) =>
  modelIdDefinitions[modelId].relatedDiscussionPrompt
    ? 'findRelatedDiscussions'
    : 'getSimilarRetroTopics'

export const findRelatedDiscussions: JobQueueStepRun<{
  embeddingsMetadataId: number
  modelId: ModelId
}> = async ({data, dataLoader}) => {
  const {embeddingsMetadataId, modelId} = data
  const {relatedDiscussionPrompt, relatedDiscussionFloor} = modelIdDefinitions[modelId]
  const embeddingModel = getModelManager().getEmbedder(modelId)
  if (!embeddingModel) return new JobQueueError(`embedding model ${modelId} not available`)
  const metadata = await dataLoader.get('embeddingsMetadata').loadNonNull(embeddingsMetadataId)
  const {teamId, refId: discussionId, fullText} = metadata
  if (!fullText) return false
  const {meetingId} = await dataLoader.get('discussions').loadNonNull(discussionId)
  const chunks = await embeddingModel.chunkText(fullText)
  if (chunks instanceof Error) {
    return new JobQueueError(`unable to get tokens: ${chunks.message}`, true)
  }
  const queryVector = await embeddingModel.getEmbedding(`${relatedDiscussionPrompt}${chunks[0]}`)
  if (queryVector instanceof Error) {
    return new JobQueueError(`unable to get embeddings: ${queryVector.message}`, true)
  }
  const tableName = embeddingModel.tableName
  const similarity = sql<number>`max(1 - (${sql.ref(`${tableName}.embedding`)} <=> ${numberVectorToString(queryVector)}))`
  const relatedDiscussions = await getKysely()
    .selectFrom(tableName)
    .innerJoin('EmbeddingsMetadata', 'EmbeddingsMetadata.id', `${tableName}.embeddingsMetadataId`)
    .innerJoin('Discussion', 'Discussion.id', 'EmbeddingsMetadata.refId')
    .select(['EmbeddingsMetadata.id as embeddingsMetadataId', similarity.as('similarity')])
    .where('EmbeddingsMetadata.teamId', '=', teamId)
    .where('EmbeddingsMetadata.objectType', '=', 'retrospectiveDiscussionTopic')
    .where('Discussion.meetingId', '!=', meetingId)
    .groupBy('EmbeddingsMetadata.id')
    .having(similarity, '>=', relatedDiscussionFloor)
    .orderBy('similarity', 'desc')
    .limit(MAX_RELATED_DISCUSSIONS)
    .execute()
  await publishSimilarRetroTopics(embeddingsMetadataId, relatedDiscussions, dataLoader)
  return false
}
