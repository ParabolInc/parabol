import {sql} from 'kysely'
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
  expect(delay).toBeGreaterThan(55)
  expect(delay).toBeLessThan(65)
})

it('pushes the job back when the page is edited again', async () => {
  await publishPageEdit()
  await pg
    .updateTable('EmbeddingsJobQueueV2')
    .set({runAfter: sql`now() + interval '10 seconds'`})
    .where('pageId', '=', pageId)
    .execute()
  expect(await delayOf()).toBeLessThan(15)
  await publishPageEdit()
  expect(await delayOf()).toBeGreaterThan(55)
})
