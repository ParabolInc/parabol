import getKysely from 'parabol-server/postgres/getKysely'
import {Logger} from 'parabol-server/utils/Logger'
import {addEmbeddingsMetadataForRetrospectiveDiscussionTopic} from './addEmbeddingsMetadataForRetrospectiveDiscussionTopic'

// Check to see if the oldest discussion topic exists in the metadata table
// If not, get the date of the oldest discussion topic in the metadata table and import all items before that date
export const importHistoricalRetrospectiveDiscussionTopic = async () => {
  const pg = getKysely()
  const isEarliestMetadataImported = await pg
    .selectFrom('EmbeddingsMetadata')
    .select('id')
    .where(({eb, selectFrom}) =>
      eb(
        'EmbeddingsMetadata.refId',
        '=',
        selectFrom('Discussion')
          .select('Discussion.id')
          .where('discussionTopicType', '=', 'reflectionGroup')
          .orderBy(['createdAt', 'id'])
          .limit(1)
      )
    )
    .limit(1)
    .executeTakeFirst()

  if (isEarliestMetadataImported) return
  const earliestImportedDiscussion = await pg
    .selectFrom('EmbeddingsMetadata')
    .select(['id', 'refUpdatedAt', 'refId'])
    .where('objectType', '=', 'meetingTemplate')
    .orderBy('refUpdatedAt')
    .limit(1)
    .executeTakeFirst()
  const endAt = earliestImportedDiscussion?.refUpdatedAt ?? undefined
  Logger.log(`Importing discussion history up to ${endAt || 'now'}`)
  return addEmbeddingsMetadataForRetrospectiveDiscussionTopic({endAt})
}
