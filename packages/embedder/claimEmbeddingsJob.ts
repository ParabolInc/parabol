import {type CompiledQuery, type Kysely, sql} from 'kysely'
import getKysely from '../server/postgres/getKysely'
import type {EmbeddingsJobQueueV2} from '../server/postgres/types'
import type {DB} from '../server/postgres/types/pg'
import type {JobType} from './custom'

type ClaimedJob = EmbeddingsJobQueueV2 & {jobType: JobType; jobData: Record<string, unknown>}

const claimQuery: CompiledQuery<ClaimedJob> = getKysely()
  .updateTable('EmbeddingsJobQueueV2')
  .set({
    state: 'running',
    // Use raw SQL for the DB-side timestamp so parameters stay empty/static
    startAt: sql`CURRENT_TIMESTAMP`
  })
  .where('id', '=', (eb) =>
    eb
      .selectFrom('EmbeddingsJobQueueV2')
      .select('id')
      .where('state', '=', 'queued')
      .where('runAfter', '<=', sql<Date>`CURRENT_TIMESTAMP`)
      .orderBy('priority', 'asc')
      .orderBy('id', 'asc')
      .limit(1)
      .forUpdate()
      .skipLocked()
  )
  .returningAll()
  .compile()

export const claimEmbeddingsJob = async (db: Kysely<DB> = getKysely()) => {
  const {rows} = await db.executeQuery(claimQuery)
  return rows[0]
}
