import {sql} from 'kysely'
import {claimEmbeddingsJob} from '../../../embedder/claimEmbeddingsJob'
import {FIRST_FILL_PRIORITY} from '../../../embedder/getEmbedderJobPriority'
import getKysely from '../../postgres/getKysely'

const pg = getKysely()

afterAll(async () => {
  await pg.destroy()
})

it('claims only jobs whose time has come', async () => {
  const rollback = new Error('rollback')
  const claimed = await pg
    .transaction()
    .execute(async (trx) => {
      const [later, due] = await trx
        .insertInto('EmbeddingsJobQueueV2')
        .values([
          {
            jobType: 'embedPage:start',
            priority: -2_000_000_000,
            pageId: -1,
            runAfter: sql`now() + interval '1 hour'`
          },
          {
            jobType: 'embedPage:start',
            priority: -1_999_999_999,
            pageId: -2,
            runAfter: sql`now() - interval '1 second'`
          }
        ])
        .returning('id')
        .execute()
      const job = await claimEmbeddingsJob(trx)
      throw Object.assign(rollback, {result: {job, laterId: later!.id, dueId: due!.id}})
    })
    .catch(
      (
        error: Error & {result?: {job: {id: number} | undefined; laterId: number; dueId: number}}
      ) => {
        if (error !== rollback) throw error
        return error.result!
      }
    )
  expect(claimed.job?.id).toBe(claimed.dueId)
})

it('leaves a model fill to the other workers when it only takes live work', async () => {
  const rollback = new Error('rollback')
  const claimed = await pg
    .transaction()
    .execute(async (trx) => {
      const {id: fillJobId} = await trx
        .insertInto('EmbeddingsJobQueueV2')
        .values({jobType: 'embedPage:start', priority: FIRST_FILL_PRIORITY, pageId: -3})
        .returning('id')
        .executeTakeFirstOrThrow()
      const job = await claimEmbeddingsJob(trx, true)
      throw Object.assign(rollback, {result: {job, fillJobId}})
    })
    .catch((error: Error & {result?: {job: {id: number} | undefined; fillJobId: number}}) => {
      if (error !== rollback) throw error
      return error.result!
    })
  expect(claimed.job?.id).not.toBe(claimed.fillJobId)
})

it('takes live work when it only takes live work', async () => {
  const rollback = new Error('rollback')
  const claimed = await pg
    .transaction()
    .execute(async (trx) => {
      const {id: liveJobId} = await trx
        .insertInto('EmbeddingsJobQueueV2')
        .values({jobType: 'embedPage:start', priority: -2_000_000_000, pageId: -4})
        .returning('id')
        .executeTakeFirstOrThrow()
      const job = await claimEmbeddingsJob(trx, true)
      throw Object.assign(rollback, {result: {job, liveJobId}})
    })
    .catch((error: Error & {result?: {job: {id: number} | undefined; liveJobId: number}}) => {
      if (error !== rollback) throw error
      return error.result!
    })
  expect(claimed.job?.id).toBe(claimed.liveJobId)
})
