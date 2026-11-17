import {sql} from 'kysely'
import getKysely from 'parabol-server/postgres/getKysely'
import {activeEmbeddingModelId} from './activeEmbeddingModel'
import type {DiscussionMeta} from './addEmbeddingsMetadataForRetrospectiveDiscussionTopic'
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

  const priority = await getEmbedderJobPriority('historicalUpdate', null, 0)
  return pg
    .with('Insert', (qc) =>
      qc
        .insertInto('EmbeddingsMetadata')
        .values(metadataRows)
        .onConflict((oc) => oc.doNothing())
        .returning('id')
    )
    .insertInto('EmbeddingsJobQueueV2')
    .columns(['jobType', 'priority', 'embeddingsMetadataId', 'modelId'])
    .expression(({selectFrom}) =>
      selectFrom('Insert').select(({ref}) => [
        sql.lit('embed:start').as('jobType'),
        sql.lit(priority).as('priority'),
        ref('Insert.id').as('embeddingsMetadataId'),
        sql.lit(activeEmbeddingModelId).as('modelId')
      ])
    )
    .execute()
}
