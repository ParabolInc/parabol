import getKysely from 'parabol-server/postgres/getKysely'
import {EmbeddingsTable, EmbeddingsTableName} from '../ai_models/AbstractEmbeddingsModel'
import {JobQueueStepRun, ParentJob} from '../custom'
import {rerankRetroTopics} from './rerankRetroTopics'

export const getSimilarRetroTopics: JobQueueStepRun<
  {
    embeddingsMetadataId: number
    model: EmbeddingsTableName
  },
  ParentJob<typeof rerankRetroTopics>
> = async (context) => {
  const {data, dataLoader} = context
  const {embeddingsMetadataId} = data
  const model = data.model as EmbeddingsTable
  const MAX_CANDIDATES = 10
  const SIMILARITY_THRESHOLD = 0.67
  const pg = getKysely()
  const metadata = await dataLoader.get('embeddingsMetadata').loadNonNull(embeddingsMetadataId)
  const {teamId} = metadata
  const similarEmbeddings = await pg
    .with('Vector', (qc) =>
      qc
        .selectFrom(model)
        .select('embedding')
        .where('embeddingsMetadataId', '=', embeddingsMetadataId)
        .orderBy('chunkNumber')
        // truncate strategy: only get discussions similar to the first chunk
        .limit(1)
    )
    .with('Model', (qc) =>
      qc
        .selectFrom(model)
        .select([`${model}.id`, 'embeddingsMetadataId', 'embedding'])
        .innerJoin('EmbeddingsMetadata', 'EmbeddingsMetadata.id', `${model}.embeddingsMetadataId`)
        .where('teamId', '=', teamId)
        .where('objectType', '=', 'retrospectiveDiscussionTopic')
        .where('embeddingsMetadataId', '!=', embeddingsMetadataId)
    )
    .with('CosineSimilarity', (pg) =>
      pg
        .selectFrom(['Model', 'Vector'])
        .select(({eb, val, parens, ref}) => [
          ref('Model.id').as('embeddingId'),
          ref('Model.embeddingsMetadataId').as('embeddingsMetadataId'),
          eb(
            val(1),
            '-',
            parens('Model.embedding' as any, '<=>' as any, ref('Vector.embedding') as any)
          ).as('similarity')
        ])
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
    similarEmbeddings
  }
}
