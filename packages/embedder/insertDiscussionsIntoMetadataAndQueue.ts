import {sql} from 'kysely'
import getKysely from 'parabol-server/postgres/getKysely'
import {DiscussionMeta} from './addEmbeddingsMetadataForRetrospectiveDiscussionTopic'
import getModelManager from './ai_models/ModelManager'
import {getEmbedderPriority} from './getEmbedderPriority'

export const insertDiscussionsIntoMetadataAndQueue = async (
  discussions: DiscussionMeta[],
  maxDelayInDays: number
) => {
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
  const tableNames = [...modelManager.embeddingModels.keys()]
  const priority = getEmbedderPriority(maxDelayInDays)
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
            sql<{model: string}>`UNNEST(ARRAY[${sql.join(tableNames)}])`.as('model'),
            (join) => join.on('Insert.id', 'is not', null)
          )
          .select(['id', 'model'])
      )
      .insertInto('EmbeddingsJobQueue')
      .columns(['jobType', 'priority', 'embeddingsMetadataId', 'model'])
      .expression(({selectFrom}) =>
        selectFrom('Metadata').select(({ref}) => [
          sql.lit('embed:start').as('jobType'),
          priority.as('priority'),
          ref('Metadata.id').as('embeddingsMetadataId'),
          ref('Metadata.model').as('model')
        ])
      )
      .execute()
  )
}
