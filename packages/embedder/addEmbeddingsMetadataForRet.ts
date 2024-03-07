import ms from 'ms'
import getRethink from 'parabol-server/database/rethinkDriver'
import getKysely from 'parabol-server/postgres/getKysely'
import RedisInstance from 'parabol-server/utils/RedisInstance'
import Redlock from 'redlock'

const insertDiscussionsIntoMetadata = async (
  discussions: {id: string; teamId: string; createdAt: Date}[]
) => {
  const pg = getKysely()
  if (discussions.length === 0) return
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
    (v, i) => metadataRows.slice(i * metadataBatchSize, i * metadataBatchSize + metadataBatchSize)
  )
  return Promise.all(
    insertBatches.map((batch) => {
      return pg
        .insertInto('EmbeddingsMetadata')
        .values(batch)
        .onConflict((oc) => oc.doNothing())
        .execute()
    })
  )
}

export const addEmbeddingsMetadataForRetrospectiveDiscussionTopic = async (
  redis: RedisInstance,
  startAt: Date | undefined,
  endAt: Date | undefined
) => {
  const redlock = new Redlock([redis], {retryCount: 0})
  try {
    await redlock.acquire([`embedder_metadata_retrospectiveDiscussionTopic`], ms('10m'))
  } catch {
    // lock not acquired, another worker must be doing the job. abort
    return
  }
  // load up the metadata table will all discussion topics that are a part of meetings ended within the given date range

  const r = await getRethink()
  const pg = getKysely()
  const BATCH_SIZE = 1000
  const rStartAt = startAt || r.minval
  const rEndAt = endAt || r.maxval

  let curStartAt = rStartAt
  for (let i = 0; i < 1e6; i++) {
    const endedMeetings = await r
      .table('NewMeeting')
      .between(curStartAt, rEndAt, {index: 'endedAt'})
      .orderBy({index: 'endedAt'})
      .filter({meetingType: 'retrospective'})
      .limit(BATCH_SIZE)
      .pluck('id', 'endedAt')
      .run()
    if (endedMeetings.length === 0) break
    const endedMeetingIds = endedMeetings.map(({id}) => id!)
    const endedMeetingDiscussions = await pg
      .selectFrom('Discussion')
      .select(['id', 'teamId', 'createdAt'])
      .where('meetingId', 'in', endedMeetingIds)
      .execute()
    await insertDiscussionsIntoMetadata(endedMeetingDiscussions)

    // assumes that fewer than BATCH_SIZE meetings share the same endedAt value.
    // If this is not safe, we need to index on `endedAt + id`
    const lastMeeting = endedMeetings[endedMeetings.length - 1]
    curStartAt = lastMeeting.endedAt
  }
}
