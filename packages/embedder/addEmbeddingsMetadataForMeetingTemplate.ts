import {ExpressionOrFactory, SqlBool, sql} from 'kysely'
import {DB} from 'parabol-server/postgres/types/pg'
import {Logger} from 'parabol-server/utils/Logger'
import getKysely from '../server/postgres/getKysely'
import {AddEmbeddingsMetadataParams} from './addEmbeddingsMetadata'
import {insertMeetingTemplatesIntoMetadataAndQueue} from './insertMeetingTemplatesIntoMetadataAndQueue'

export const addEmbeddingsMetadataForMeetingTemplate = async ({
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
    const lessThanTimeOrId: ExpressionOrFactory<DB, 'MeetingTemplate', SqlBool> = curEndId
      ? ({eb}) =>
          eb('updatedAt', '<', pgTime).or(eb('updatedAt', '=', pgTime).and('id', '>', curEndId))
      : ({eb}) => eb('updatedAt', '<=', pgTime)
    const templates = await pg
      .selectFrom('MeetingTemplate')
      .select([
        'id',
        'teamId',
        'updatedAt',
        sql<number>`extract(epoch from "updatedAt")`.as('updatedAtEpoch')
      ])
      .where('updatedAt', '>', pgStartAt)
      .where(lessThanTimeOrId)
      .orderBy('updatedAt', 'desc')
      .orderBy('id')
      .limit(BATCH_SIZE)
      .execute()
    const earliestInBatch = templates.at(-1)
    if (!earliestInBatch) break
    const {updatedAtEpoch, id} = earliestInBatch
    curEndId = curEndAt === updatedAtEpoch ? id : ''
    curEndAt = updatedAtEpoch
    await insertMeetingTemplatesIntoMetadataAndQueue(templates, 5)
    const jsTime = new Date(updatedAtEpoch * 1000)
    Logger.log(`Inserted ${templates.length} meetingtemplates in metadata ending at ${jsTime}`)
  }
}
