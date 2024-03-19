import {ExpressionOrFactory, SqlBool, sql} from 'kysely'
import getRethink from 'parabol-server/database/rethinkDriver'
import {RDatum} from 'parabol-server/database/stricterR'
import getKysely from 'parabol-server/postgres/getKysely'
import {DB} from 'parabol-server/postgres/pg'
import {Logger} from 'parabol-server/utils/Logger'
import {EmbedderOptions} from './embedder'

interface DiscussionMeta {
  id: string
  teamId: string
  createdAt: Date
}

const validateDiscussions = async (discussions: (DiscussionMeta & {meetingId: string})[]) => {
  const r = await getRethink()
  if (discussions.length === 0) return discussions
  // Exclude discussions that belong to an unfinished meeting
  const meetingIds = discussions.map(({meetingId}) => meetingId)
  const endedMeetingIds = await r
    .table('NewMeeting')
    .getAll(r.args(meetingIds), {index: 'id'})
    .filter((row: RDatum) => row('endedAt').default(null).ne(null))('id')
    .run()
  const endedMeetingIdsSet = new Set(endedMeetingIds)
  return discussions.filter(({meetingId}) => endedMeetingIdsSet.has(meetingId))
}

const insertDiscussionsIntoMetadata = async (discussions: DiscussionMeta[]) => {
  const pg = getKysely()
  const metadataRows = discussions.map(({id, teamId, createdAt}) => ({
    refId: id,
    objectType: 'retrospectiveDiscussionTopic' as const,
    teamId,
    // Not techincally updatedAt since discussions are be updated after they get created
    refUpdatedAt: createdAt
  }))
  if (!metadataRows[0]) return
  await pg
    .insertInto('EmbeddingsMetadata')
    .values(metadataRows)
    .onConflict((oc) => oc.doNothing())
    .execute()
  return
}

export const addEmbeddingsMetadataForRetrospectiveDiscussionTopic = async ({
  startAt,
  endAt,
  meetingId
}: EmbedderOptions) => {
  // load up the metadata table will all discussion topics that are a part of meetings ended within the given date range
  const pg = getKysely()
  if (meetingId) {
    const discussions = await pg
      .selectFrom('Discussion')
      .select(['id', 'teamId', 'createdAt'])
      .where('meetingId', '=', meetingId)
      .execute()
    await insertDiscussionsIntoMetadata(discussions)
    return
  }
  const PG_MAX_PARAMS = 65535
  const METADATA_COLS_PER_ROW = 4
  const BATCH_SIZE = Math.floor(PG_MAX_PARAMS / METADATA_COLS_PER_ROW) // cannot exceed 65535 / 4
  const pgStartAt = startAt || new Date(0)
  const pgEndAt = (endAt || new Date('4000-01-01')).getTime() / 1000

  let curEndAt = pgEndAt
  let curEndId = ''
  for (let i = 0; i < 1e6; i++) {
    // preserve microsecond resolution to keep timestamps equal
    // so we can use the ID as a tiebreaker when count(createdAt) > BATCH_SIZE
    const pgTime = sql<Date>`to_timestamp(${curEndAt})`
    const lessThanTimeOrId: ExpressionOrFactory<DB, 'Discussion', SqlBool> = curEndId
      ? ({eb}) =>
          eb('createdAt', '<', pgTime).or(eb('createdAt', '=', pgTime).and('id', '>', curEndId))
      : ({eb}) => eb('createdAt', '<=', pgTime)
    const discussions = await pg
      .selectFrom('Discussion')
      .select([
        'id',
        'teamId',
        'createdAt',
        'meetingId',
        sql<number>`extract(epoch from "createdAt")`.as('createdAtEpoch')
      ])
      .where('createdAt', '>', pgStartAt)
      .where(lessThanTimeOrId)
      .where('discussionTopicType', '=', 'reflectionGroup')
      .orderBy('createdAt', 'desc')
      .orderBy('id')
      .limit(BATCH_SIZE)
      .execute()
    const earliestDiscussionInBatch = discussions.at(-1)
    if (!earliestDiscussionInBatch) break
    const {createdAtEpoch, id} = earliestDiscussionInBatch
    curEndId = curEndAt === createdAtEpoch ? id : ''
    curEndAt = createdAtEpoch
    const validDiscussions = await validateDiscussions(discussions)
    await insertDiscussionsIntoMetadata(validDiscussions)
    const jsTime = new Date(createdAtEpoch * 1000)
    Logger.log(
      `Inserted ${validDiscussions.length}/${discussions.length} discussions in metadata ending at ${jsTime}`
    )
  }
}
