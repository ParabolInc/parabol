import {sql} from 'kysely'
import getKysely from 'parabol-server/postgres/getKysely'
import type {DiscussionMeta} from './addEmbeddingsMetadataForRetrospectiveDiscussionTopic'
import getModelManager from './ai_models/ModelManager'
import {getEmbedderJobPriority} from './getEmbedderJobPriority'

export const insertDiscussionsIntoMetadataAndQueue = async (discussions: DiscussionMeta[]) => {
  const pg = getKysely()
  const metadataRows = discussions.map(({id, teamId, createdAt}) => ({
    refId: id,
    objectType: 'retrospectiveDiscussionTopic' as const,
    teamId,
    // Not techincally updatedAt since discussions are updated after they get created
    refUpdatedAt: createdAt
  }))
  if (!metadataRows[0]) return

  const modelManager = getModelManager()
  const modelIds = [...modelManager.embeddingModels.keys()]
  const priority = await getEmbedderJobPriority('historicalUpdate', null, 0)
  // This is ugly but it runs fast, which is what we need for historical data
  return (
    pg
      .with('Insert', (qc) =>
        qc
          .insertInto('EmbeddingsMetadata')
          .values(metadataRows)
          .onConflict((oc) => oc.doNothing())
          .returning('id')
      )
      // create n*m rows for n models & m discussions
      .with('Metadata', (qc) =>
        qc
          .selectFrom('Insert')
          .innerJoin(
            sql<{modelId: string}>`UNNEST(ARRAY[${sql.join(modelIds)}])`.as('modelId'),
            (join) => join.on('Insert.id', 'is not', null)
          )
          .select(['id', 'modelId'])
      )
      .insertInto('EmbeddingsJobQueueV2')
      .columns(['jobType', 'priority', 'embeddingsMetadataId', 'modelId'])
      .expression(({selectFrom}) =>
        selectFrom('Metadata').select(({ref}) => [
          sql.lit('embed:start').as('jobType'),
          sql.lit(priority).as('priority'),
          ref('Metadata.id').as('embeddingsMetadataId'),
          ref('Metadata.modelId').as('modelId')
        ])
      )
      .execute()
  )
}
