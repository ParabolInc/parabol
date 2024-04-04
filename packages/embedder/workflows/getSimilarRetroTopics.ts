import getKysely from 'parabol-server/postgres/getKysely'
import {JobQueueStepRun} from '../custom'
import {EmbeddingsTable, EmbeddingsTableName} from '../ai_models/AbstractEmbeddingsModel'

export const getSimilarRetroTopics: JobQueueStepRun<{
  embeddingsMetadataId: number
  model: EmbeddingsTableName
}> = async (context) => {
  const {data, dataLoader} = context
  const {embeddingsMetadataId, model} = data
  const MAX_CANDIDATES = 10
  const SIMILARITY_THRESHOLD = 0.67
  const pg = getKysely()
  const metadata = await dataLoader.get('embeddingsMetadata').loadNonNull(embeddingsMetadataId)
  const {teamId} = metadata
  const similarEmbeddings = await pg
    .with('Vector', (qc) =>
      qc
        .selectFrom(model as EmbeddingsTable)
        .select('embedding')
        .where('embeddingsMetadataId', '=', embeddingsMetadataId)
        .orderBy('chunkNumber')
        // truncate strategy: only get discussions similar to the first chunk
        .limit(1)
    )
    .with('CosineSimilarity', (pg) =>
      pg
        .selectFrom([model as EmbeddingsTable, 'Vector', 'EmbeddingsMetadata'])
        .select(({eb, val, parens}) => [
          'id as embeddingId',
          'refId as discussionId',
          'embeddingsMetadataId',
          eb(val(1), '-', parens('embedding' as any, '<=>' as any, 'Vector.embedding')).as(
            'similarity'
          )
        ])
        .innerJoin('EmbeddingsMetadata', `embeddingsMetadataId`, 'EmbeddingsMetadata.id')
        .where('objectType', '=', 'retrospectiveDiscussionTopic')
        .where('teamId', '=', teamId)
    )
    .selectFrom('CosineSimilarity')
    .select(['embeddingId', 'similarity', 'embeddingsMetadataId'])
    .where('similarity', '>=', SIMILARITY_THRESHOLD)
    .orderBy('similarity', 'desc')
    .limit(MAX_CANDIDATES)
    .execute()
  if (similarEmbeddings.length === 0) return false
  return {
    embeddingsMetadataId,
    model,
    similarEmbeddings,
    isRerank: true
  }
}
