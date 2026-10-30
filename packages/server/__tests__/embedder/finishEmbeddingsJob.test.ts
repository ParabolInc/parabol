import {type RawBuilder, sql} from 'kysely'
import {finishEmbeddingsJob} from '../../../embedder/finishEmbeddingsJob'
import getKysely from '../../postgres/getKysely'

const pg = getKysely()
const pageId = -(Date.now() % 1_000_000_000) - 1_000_000_000

const insertRunningJob = async (runAfter: RawBuilder<Date>) => {
  const {id} = await pg
    .insertInto('EmbeddingsJobQueueV2')
    .values({
      jobType: 'embedPage:start',
      priority: 0,
      pageId,
      state: 'running',
      startAt: sql`now() - interval '10 seconds'`,
      runAfter
    })
    .returning('id')
    .executeTakeFirstOrThrow()
  return id
}

afterEach(async () => {
  await pg.deleteFrom('EmbeddingsJobQueueV2').where('pageId', '=', pageId).execute()
})

afterAll(async () => {
  await pg.destroy()
})

it('removes a finished job', async () => {
  const jobId = await insertRunningJob(sql<Date>`now() - interval '1 minute'`)
  await finishEmbeddingsJob(jobId)
  const job = await pg
    .selectFrom('EmbeddingsJobQueueV2')
    .select('id')
    .where('id', '=', jobId)
    .executeTakeFirst()
  expect(job).toBeUndefined()
})

it('queues the page again when it was edited during the job', async () => {
  const jobId = await insertRunningJob(sql<Date>`now() + interval '50 seconds'`)
  await finishEmbeddingsJob(jobId)
  const job = await pg
    .selectFrom('EmbeddingsJobQueueV2')
    .select(['state', 'startAt'])
    .where('id', '=', jobId)
    .executeTakeFirstOrThrow()
  expect(job).toEqual({state: 'queued', startAt: null})
})
