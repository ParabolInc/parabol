import type {Kysely} from 'kysely'
import getKysely from '../server/postgres/getKysely'
import type {DB} from '../server/postgres/types/pg'
import {Logger} from '../server/utils/Logger'
import {insertMeetingTemplatesIntoMetadataAndQueue} from './insertMeetingTemplatesIntoMetadataAndQueue'

const BATCH_SIZE = 10_000

export const importHistoricalMeetingTemplates = async (db: Kysely<DB> = getKysely()) => {
  const templates = await db
    .selectFrom('MeetingTemplate')
    .select(['id', 'teamId', 'updatedAt'])
    .where('isActive', '=', true)
    .where(({not, exists, selectFrom}) =>
      not(
        exists(
          selectFrom('EmbeddingsMetadata')
            .select('EmbeddingsMetadata.id')
            .where('objectType', '=', 'meetingTemplate')
            .whereRef('refId', '=', 'MeetingTemplate.id')
        )
      )
    )
    .execute()
  if (templates.length === 0) return
  Logger.log(`Importing ${templates.length} meeting templates`)
  for (let i = 0; i < templates.length; i += BATCH_SIZE) {
    await insertMeetingTemplatesIntoMetadataAndQueue(templates.slice(i, i + BATCH_SIZE), db)
  }
}
