import getKysely from '../server/postgres/getKysely'
import {activeEmbeddingModelId, embeddingModelIds} from './activeEmbeddingModel'
import {getEmbedderJobPriority} from './getEmbedderJobPriority'

export const queueEmbedForOtherGenerations = async (embeddingsMetadataIds: number[]) => {
  const otherModelIds = embeddingModelIds.filter((modelId) => modelId !== activeEmbeddingModelId)
  if (otherModelIds.length === 0 || embeddingsMetadataIds.length === 0) return
  const priority = await getEmbedderJobPriority('corpusUpdate', null, 0)
  await getKysely()
    .insertInto('EmbeddingsJobQueueV2')
    .values(
      embeddingsMetadataIds.flatMap((embeddingsMetadataId) =>
        otherModelIds.map((modelId) => ({
          jobType: 'embed:start' as const,
          priority,
          embeddingsMetadataId,
          modelId
        }))
      )
    )
    .execute()
}
