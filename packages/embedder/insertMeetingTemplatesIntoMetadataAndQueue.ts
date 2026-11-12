import {type Kysely, sql} from 'kysely'
import getKysely from '../server/postgres/getKysely'
import type {DB} from '../server/postgres/types/pg'
import {activeEmbeddingModelId} from './activeEmbeddingModel'
import {getEmbedderJobPriority} from './getEmbedderJobPriority'

export interface MeetingTemplateMeta {
  id: string
  teamId: string
  updatedAt: Date
}

export const insertMeetingTemplatesIntoMetadataAndQueue = async (
  meetingTemplates: MeetingTemplateMeta[],
  pg: Kysely<DB> = getKysely()
) => {
  const metadataRows = meetingTemplates.map(({id, teamId, updatedAt}) => ({
    refId: id,
    objectType: 'meetingTemplate' as const,
    teamId,
    refUpdatedAt: updatedAt
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
