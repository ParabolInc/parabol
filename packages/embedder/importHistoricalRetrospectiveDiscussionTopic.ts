import getKysely from 'parabol-server/postgres/getKysely'
import RedisInstance from 'parabol-server/utils/RedisInstance'
import {addEmbeddingsMetadataForRetrospectiveDiscussionTopic} from './addEmbeddingsMetadataForRet'

export const importHistoricalRetrospectiveDiscussionTopic = async (redis: RedisInstance) => {
  const pg = getKysely()
  const isEarliestMetadataImported = await pg
    .selectFrom('EmbeddingsMetadata')
    .select('id')
    .where(({eb, selectFrom}) =>
      eb(
        'EmbeddingsMetadata.refId',
        '=',
        selectFrom('Discussion').select('Discussion.id').orderBy(['createdAt', 'id']).limit(1)
      )
    )
    .limit(1)
    .executeTakeFirst()

  if (isEarliestMetadataImported) return
  const earliestDiscussion = await pg
    .selectFrom('Discussion')
    .select('createdAt')
    .orderBy('createdAt')
    .limit(1)
    .executeTakeFirst()
  const endAt = earliestDiscussion?.createdAt ?? undefined
  return addEmbeddingsMetadataForRetrospectiveDiscussionTopic(redis, {endAt})
}
