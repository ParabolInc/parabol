import getKysely from 'parabol-server/postgres/getKysely'
import {Logger} from 'parabol-server/utils/Logger'
import {addEmbeddingsMetadataForMeetingTemplate} from './addEmbeddingsMetadataForMeetingTemplate'

// Check to see if the oldest discussion topic exists in the metadata table
// If not, get the date of the oldest discussion topic in the metadata table and import all items before that date
export const importHistoricalMeetingTemplates = async () => {
  const pg = getKysely()
  const isEarliestMetadataImported = await pg
    .selectFrom('EmbeddingsMetadata')
    .select('id')
    .where(({eb, selectFrom}) =>
      eb(
        'EmbeddingsMetadata.refId',
        '=',
        selectFrom('MeetingTemplate')
          .select('MeetingTemplate.id')
          .orderBy(['updatedAt', 'id'])
          .limit(1)
      )
    )
    .limit(1)
    .executeTakeFirst()

  if (isEarliestMetadataImported) return
  const earliestImportedTemplate = await pg
    .selectFrom('EmbeddingsMetadata')
    .select(['id', 'refUpdatedAt', 'refId'])
    .where('objectType', '=', 'meetingTemplate')
    .orderBy('refUpdatedAt')
    .limit(1)
    .executeTakeFirst()
  const endAt = earliestImportedTemplate?.refUpdatedAt ?? undefined
  Logger.log(`Importing meeting template history up to ${endAt || 'now'}`)
  return addEmbeddingsMetadataForMeetingTemplate({endAt})
}
