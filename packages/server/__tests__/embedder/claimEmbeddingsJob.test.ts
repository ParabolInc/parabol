import {sql} from 'kysely'
import {claimEmbeddingsJob} from '../../../embedder/claimEmbeddingsJob'
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
