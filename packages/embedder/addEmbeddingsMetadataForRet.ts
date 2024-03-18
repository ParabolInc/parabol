import ms from 'ms'
import getRethink from 'parabol-server/database/rethinkDriver'
import {RDatum} from 'parabol-server/database/stricterR'
import getKysely from 'parabol-server/postgres/getKysely'
import RedisInstance from 'parabol-server/utils/RedisInstance'
import Redlock from 'redlock'
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
    // this is technically when the discussion was created. Discussions are mutable.
    // The best solution would be a date range of min(commentUpdatedAt) to max(commentUpdatedAt)
    refUpdatedAt: createdAt
  }))

  const PG_MAX_PARAMS = 65535
  const metadataColParams = Object.keys(metadataRows[0]).length
  const metadataBatchSize = Math.trunc(PG_MAX_PARAMS / metadataColParams)
  const insertBatches = Array.from(
    {length: Math.ceil(metadataRows.length / metadataBatchSize)},
    (_, i) => metadataRows.slice(i * metadataBatchSize, i * metadataBatchSize + metadataBatchSize)
  )
  await Promise.all(
    insertBatches.map((batch) => {
      return pg
        .insertInto('EmbeddingsMetadata')
        .values(batch)
        .onConflict((oc) => oc.doNothing())
        .execute()
    })
  )
  return
}

export const addEmbeddingsMetadataForRetrospectiveDiscussionTopic = async (
  redis: RedisInstance,
  {startAt, endAt, refId}: EmbedderOptions
) => {
  const redlock = new Redlock([redis], {retryCount: 0})
  try {
    await redlock.acquire([`embedder_metadata_retrospectiveDiscussionTopic`], ms('10m'))
  } catch {
    // lock not acquired, another worker must be doing the job. abort
    return
  }
  // load up the metadata table will all discussion topics that are a part of meetings ended within the given date range
  const pg = getKysely()

  if (refId) {
    const discussion = await pg
      .selectFrom('Discussion')
      .select(['id', 'teamId', 'createdAt', 'discussionTopicType'])
      .where('id', '=', refId)
      .executeTakeFirst()
    if (!discussion || discussion.discussionTopicType !== 'reflectionGroup') {
      console.error('invalid discussion id', refId)
    } else {
      await insertDiscussionsIntoMetadata([discussion])
    }
    return
  }

  const BATCH_SIZE = 1000
  const pgStartAt = startAt || new Date(0)
  const pgEndAt = endAt || new Date('4000-01-01')

  let curEndAt = pgEndAt
  for (let i = 0; i < 1e6; i++) {
    const discussions = await pg
      .selectFrom('Discussion')
      .select(['id', 'teamId', 'createdAt', 'meetingId'])
      // SQL between is a closed interval, so there will be an overlap between batches
      // as long as BATCH_SIZE > COUNT(createdAt) this isn't a problem
      .where(({eb}) => eb.between('createdAt', pgStartAt, curEndAt))
      .where('discussionTopicType', '=', 'reflectionGroup')
      .orderBy('createdAt', 'desc')
      .limit(BATCH_SIZE)
      .execute()

    const [firstDiscussion] = discussions
    curEndAt = firstDiscussion.createdAt
    const validDiscussions = await validateDiscussions(discussions)
    if (validDiscussions.length === 0) break
    await insertDiscussionsIntoMetadata(validDiscussions)
  }
}
