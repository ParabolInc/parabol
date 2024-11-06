import {ExpressionOrFactory, SqlBool, sql} from 'kysely'
import {DB} from 'parabol-server/postgres/types/pg'
import {Logger} from 'parabol-server/utils/Logger'
import getKysely from '../server/postgres/getKysely'
import {AddEmbeddingsMetadataParams} from './addEmbeddingsMetadata'
import {insertDiscussionsIntoMetadataAndQueue} from './insertDiscussionsIntoMetadataAndQueue'

export interface DiscussionMeta {
  id: string
  teamId: string
  createdAt: Date
}

const validateDiscussions = async (discussions: (DiscussionMeta & {meetingId: string})[]) => {
  const pg = getKysely()
  if (discussions.length === 0) return discussions
  // Exclude discussions that belong to an unfinished meeting
  const meetingIds = [...new Set(discussions.map(({meetingId}) => meetingId))]
  const endedMeetings = await pg
    .selectFrom('NewMeeting')
    .select('id')
    .where('id', 'in', meetingIds)
    .where('endedAt', 'is', null)
    .execute()
  const endedMeetingIds = endedMeetings.map(({id}) => id)
  const endedMeetingIdsSet = new Set(endedMeetingIds)
  return discussions.filter(({meetingId}) => endedMeetingIdsSet.has(meetingId))
}

export const addEmbeddingsMetadataForRetrospectiveDiscussionTopic = async ({
  startAt,
  endAt
}: AddEmbeddingsMetadataParams) => {
  const pg = getKysely()
  // PG only accepts 65K parameters (inserted columns * number of rows + query params). Make the batches as big as possible
  const PG_MAX_PARAMS = 65535
  const QUERY_PARAMS = 10
  const METADATA_COLS_PER_ROW = 4
  const BATCH_SIZE = Math.floor((PG_MAX_PARAMS - QUERY_PARAMS) / METADATA_COLS_PER_ROW)
  const pgStartAt = startAt || new Date(0)
  const pgEndAt = (endAt || new Date('4000')).getTime() / 1000

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
    await insertDiscussionsIntoMetadataAndQueue(validDiscussions, 5)
    const jsTime = new Date(createdAtEpoch * 1000)
    Logger.log(
      `Inserted ${validDiscussions.length}/${discussions.length} discussions in metadata ending at ${jsTime}`
    )
  }
}
