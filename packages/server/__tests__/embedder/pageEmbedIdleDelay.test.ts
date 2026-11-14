import {sql} from 'kysely'
import {claimEmbeddingsJob} from '../../../embedder/claimEmbeddingsJob'
import {finishEmbeddingsJob} from '../../../embedder/finishEmbeddingsJob'
import getKysely from '../../postgres/getKysely'

jest.mock('../../utils/getRedis', () => ({
  __esModule: true,
  default: () => ({publish: async () => 1})
}))
jest.mock('../../utils/embeddingResponder', () => ({
  embeddingResponder: {channelName: 'embedderResponse:test', nextRequestId: () => 1}
}))
jest.mock('../../../embedder/getEmbedderJobPriority', () => ({
  ...jest.requireActual('../../../embedder/getEmbedderJobPriority'),
  getEmbedderJobPriority: async () => 123_456
}))

const pg = getKysely()
const pageId = -(Date.now() % 1_000_000_000)

const publishPageEdit = () => {
  process.env.AI_EMBEDDER_WORKERS = '1'
  const {publishToEmbedder} =
    require('../../graphql/mutations/helpers/publishToEmbedder') as typeof import('../../graphql/mutations/helpers/publishToEmbedder')
  return publishToEmbedder({jobType: 'embedPage:start', pageId})
}

const delayOf = async () => {
  const {delaySeconds} = await pg
    .selectFrom('EmbeddingsJobQueueV2')
    .select(sql<number>`extract(epoch from "runAfter" - now())::float8`.as('delaySeconds'))
    .where('pageId', '=', pageId)
    .executeTakeFirstOrThrow()
  return delaySeconds
}

afterEach(async () => {
  await pg.deleteFrom('EmbeddingsJobQueueV2').where('pageId', '=', pageId).execute()
})

afterAll(async () => {
  await pg.destroy()
})

it('waits for edits to settle before embedding a page', async () => {
  await publishPageEdit()
  const delay = await delayOf()
  expect(delay).toBeGreaterThan(18)
  expect(delay).toBeLessThan(22)
})

it('pushes the job back when the page is edited again', async () => {
  await publishPageEdit()
  await pg
    .updateTable('EmbeddingsJobQueueV2')
    .set({runAfter: sql`now() + interval '5 seconds'`})
    .where('pageId', '=', pageId)
    .execute()
  expect(await delayOf()).toBeLessThan(6)
  await publishPageEdit()
  expect(await delayOf()).toBeGreaterThan(18)
})

it('embeds a page that keeps changing within 2 minutes of its first save', async () => {
  await publishPageEdit()
  await pg
    .updateTable('EmbeddingsJobQueueV2')
    .set({updatedAt: sql`now() - interval '110 seconds'`})
    .where('pageId', '=', pageId)
    .execute()
  await publishPageEdit()
  await publishPageEdit()
  const delay = await delayOf()
  expect(delay).toBeGreaterThan(9)
  expect(delay).toBeLessThan(11)
})

it('queues the page again when it is saved during an embed that started after the cap', async () => {
  await publishPageEdit()
  const job = await pg.transaction().execute(async (trx) => {
    await trx
      .updateTable('EmbeddingsJobQueueV2')
      .set({
        priority: -2_000_000_000,
        runAfter: sql`now() - interval '1 second'`,
        updatedAt: sql`now() - interval '200 seconds'`
      })
      .where('pageId', '=', pageId)
      .execute()
    return claimEmbeddingsJob(trx)
  })
  expect(job?.pageId).toBe(pageId)
  await publishPageEdit()
  await finishEmbeddingsJob(job!.id)
  const queued = await pg
    .selectFrom('EmbeddingsJobQueueV2')
    .select('state')
    .where('pageId', '=', pageId)
    .executeTakeFirst()
  expect(queued).toEqual({state: 'queued'})
})
