import {ExpressionOrFactory, SqlBool, sql} from 'kysely'
import getRethink from 'parabol-server/database/rethinkDriver'
import {RDatum} from 'parabol-server/database/stricterR'
import getKysely from 'parabol-server/postgres/getKysely'
import {DB} from 'parabol-server/postgres/pg'
import {Logger} from 'parabol-server/utils/Logger'
import {EMBEDDER_JOB_PRIORITY} from './EMBEDDER_JOB_PRIORITY'
import getModelManager from './ai_models/ModelManager'
import {EmbedderOptions} from './custom'

interface DiscussionMeta {
  id: string
  teamId: string
  createdAt: Date
}

const validateDiscussions = async (discussions: (DiscussionMeta & {meetingId: string})[]) => {
  const r = await getRethink()
  if (discussions.length === 0) return discussions
  // Exclude discussions that belong to an unfinished meeting
  const meetingIds = [...new Set(discussions.map(({meetingId}) => meetingId))]
  const endedMeetingIds = await r
    .table('NewMeeting')
    .getAll(r.args(meetingIds), {index: 'id'})
    .filter((row: RDatum) => row('endedAt').default(null).ne(null))('id')
    .distinct()
    .run()
  const endedMeetingIdsSet = new Set(endedMeetingIds)
  return discussions.filter(({meetingId}) => endedMeetingIdsSet.has(meetingId))
}

const insertDiscussionsIntoMetadata = async (discussions: DiscussionMeta[], priority: number) => {
  const pg = getKysely()
  const metadataRows = discussions.map(({id, teamId, createdAt}) => ({
    refId: id,
    objectType: 'retrospectiveDiscussionTopic' as const,
    teamId,
    // Not techincally updatedAt since discussions are be updated after they get created
    refUpdatedAt: createdAt
  }))
  if (!metadataRows[0]) return

  const modelManager = getModelManager()
  const tableNames = [...modelManager.embeddingModels.keys()]
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
          .fullJoin(
            sql<{model: string}>`UNNEST(ARRAY[${sql.join(tableNames)}])`.as('model'),
            (join) => join.onTrue()
          )
          .select(['id', 'model'])
      )
      .insertInto('EmbeddingsJobQueue')
      .columns(['jobType', 'priority', 'jobData'])
      .expression(({selectFrom}) =>
        selectFrom('Metadata').select(({lit, fn, ref}) => [
          sql.lit('embed').as('jobType'),
          lit(priority).as('priority'),
          fn('json_build_object', [
            sql.lit('embeddingsMetadataId'),
            ref('Metadata.id'),
            sql.lit('model'),
            ref('Metadata.model')
          ]).as('jobData')
        ])
      )
      .execute()
  )
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
    await insertDiscussionsIntoMetadata(discussions, EMBEDDER_JOB_PRIORITY.MEETING)
    return
  }
  // PG only accepts 65K parameters (inserted columns * number of rows + query params). Make the batches as big as possible
  const PG_MAX_PARAMS = 65535
  const QUERY_PARAMS = 10
  const METADATA_COLS_PER_ROW = 4
  const BATCH_SIZE = Math.floor((PG_MAX_PARAMS - QUERY_PARAMS) / METADATA_COLS_PER_ROW)
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
    await insertDiscussionsIntoMetadata(validDiscussions, EMBEDDER_JOB_PRIORITY.TOPIC_HISTORY)
    const jsTime = new Date(createdAtEpoch * 1000)
    Logger.log(
      `Inserted ${validDiscussions.length}/${discussions.length} discussions in metadata ending at ${jsTime}`
    )
  }
}
