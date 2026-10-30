import {sql} from 'kysely'
import type {ModelId} from '../../../../../embedder/ai_models/modelIdDefinitions'
import TextEmbeddingsInference from '../../../../../embedder/ai_models/TextEmbeddingsInference'
import {getEmbeddingsPagesTableName} from '../../../../../embedder/getEmbeddingsTableName'
import numberVectorToString from '../../../../../embedder/indexing/numberVectorToString'
import generateUID from '../../../../generateUID'
import getKysely from '../../../../postgres/getKysely'
import {updatePageAccessTable} from '../../../../postgres/updatePageAccessTable'
import {queueViewerPagesForEmbedding} from '../queueViewerPagesForEmbedding'

const mockQueuedThisHour = new Set<string>()
const mockRun = new Map<string, string>()
const mockSet = jest.fn(async (key: string) => {
  if (mockQueuedThisHour.has(key)) return null
  mockQueuedThisHour.add(key)
  return 'OK'
})

jest.mock('../../../../../embedder/ai_models/modelIdDefinitions', () => {
  const actual = jest.requireActual<
    typeof import('../../../../../embedder/ai_models/modelIdDefinitions')
  >('../../../../../embedder/ai_models/modelIdDefinitions')
  const generation = actual.modelIdDefinitions['Svenni551/Qwen3-Embedding-0.6B-ONNX-INT8#v3']
  return {
    ...actual,
    modelIdDefinitions: {
      ...actual.modelIdDefinitions,
      searchQueueLive: {...generation, tableSuffix: 'search_queue_live'},
      searchQueueNext: {...generation, tableSuffix: 'search_queue_next'}
    }
  }
})
jest.mock('../../../../../embedder/activeEmbeddingModel', () => ({
  activeEmbeddingModelId: 'searchQueueLive',
  embeddingModelIds: ['searchQueueLive', 'searchQueueNext']
}))
jest.mock('../../../../utils/getRedis', () => ({
  __esModule: true,
  default: () => ({
    set: (...args: [string]) => mockSet(...args),
    hgetall: async () => Object.fromEntries(mockRun),
    publish: async () => 1
  })
}))

const pg = getKysely()
const live = 'searchQueueLive' as ModelId
const next = 'searchQueueNext' as ModelId
const viewerId = `searchQueueTest|${generateUID()}`
const otherUserId = `searchQueueOther|${generateUID()}`
const longText = 'Notes from the planning session about the launch checklist. '.repeat(5)
const vector = numberVectorToString(Array.from({length: 1024}, (_, i) => (i === 0 ? 1 : 0)))
const pageIds: Record<string, number> = {}

const insertUser = (id: string) =>
  pg
    .insertInto('User')
    .values({
      id,
      email: `${id}@example.com`,
      picture: 'https://example.com/pic.png',
      preferredName: 'Search Queue Tester'
    })
    .execute()

const insertPage = async (
  key: string,
  ownerId: string,
  {daysAgo = 1, text = longText, deletedAt = null as Date | null} = {}
) => {
  const {id} = await pg
    .insertInto('Page')
    .values({
      userId: ownerId,
      sortOrder: key,
      title: key,
      plaintextContent: text,
      updatedAt: sql`now() - ${daysAgo} * interval '1 day'`,
      deletedAt
    })
    .returning('id')
    .executeTakeFirstOrThrow()
  await pg
    .insertInto('PageUserAccess')
    .values({userId: ownerId, pageId: id, role: 'owner'})
    .execute()
  await updatePageAccessTable(pg, id, {skipDeleteOld: true})
  pageIds[key] = id
}

const insertChunk = (modelId: ModelId, pageId: number) =>
  pg
    .insertInto(getEmbeddingsPagesTableName(modelId)!)
    .values({
      embedText: 'text',
      tsv: sql`to_tsvector('simple', 'text')`,
      embedding: vector,
      pageId,
      chunkNumber: 0,
      pageUpdatedAt: new Date()
    })
    .execute()

const queuedPageIds = async (modelId: ModelId) => {
  const rows = await pg
    .selectFrom('EmbeddingsJobQueueV2')
    .select('pageId')
    .where('modelId', '=', modelId)
    .orderBy('id')
    .execute()
  return rows.map(({pageId}) => pageId)
}

beforeAll(async () => {
  process.env.AI_EMBEDDER_WORKERS = '1'
  for (const modelId of [live, next]) {
    await new TextEmbeddingsInference(modelId, 'http://localhost:3040/', 2048).createTable()
  }
  await insertUser(viewerId)
  await insertUser(otherUserId)
  await insertPage('neverEmbedded', viewerId, {daysAgo: 2})
  await insertPage('liveOnly', viewerId, {daysAgo: 1})
  await insertPage('embedded', viewerId)
  await insertPage('short', viewerId, {text: 'Too short to embed'})
  await insertPage('trashed', viewerId, {deletedAt: new Date()})
  await insertPage('someoneElses', otherUserId)
  await insertChunk(live, pageIds.liveOnly!)
  await insertChunk(live, pageIds.embedded!)
  await insertChunk(next, pageIds.embedded!)
})

afterEach(async () => {
  mockQueuedThisHour.clear()
  mockRun.clear()
  mockSet.mockClear()
  await pg.deleteFrom('EmbeddingsJobQueueV2').where('modelId', 'in', [live, next]).execute()
})

afterAll(async () => {
  await pg.deleteFrom('Page').where('userId', 'in', [viewerId, otherUserId]).execute()
  await pg.deleteFrom('User').where('id', 'in', [viewerId, otherUserId]).execute()
  const tables = [live, next].map((modelId) => sql.id(getEmbeddingsPagesTableName(modelId)!))
  await sql`DROP TABLE IF EXISTS ${sql.join(tables)}, "Embeddings_search_queue_live", "Embeddings_search_queue_next"`.execute(
    pg
  )
  await pg.destroy()
})

const startRun = (state: 'running' | 'paused') => {
  mockRun.set('modelId', next)
  mockRun.set('sourceModelId', live)
  mockRun.set('state', state)
  mockRun.set('copyMetadata', '1')
  mockRun.set('queueSize', '100')
}

it('queues the pages the viewer can open that lack vectors in the active generation', async () => {
  await queueViewerPagesForEmbedding(viewerId)
  expect(await queuedPageIds(live)).toEqual([pageIds.neverEmbedded])
  expect(await queuedPageIds(next)).toEqual([])
})

it('also queues them, newest first, for the generation a run is filling', async () => {
  startRun('running')
  await queueViewerPagesForEmbedding(viewerId)
  expect(await queuedPageIds(live)).toEqual([pageIds.neverEmbedded])
  expect(await queuedPageIds(next)).toEqual([pageIds.liveOnly, pageIds.neverEmbedded])
})

it("leaves a paused run's generation alone", async () => {
  startRun('paused')
  await queueViewerPagesForEmbedding(viewerId)
  expect(await queuedPageIds(next)).toEqual([])
})

it('runs at most once an hour for a viewer', async () => {
  await queueViewerPagesForEmbedding(viewerId)
  await pg.deleteFrom('EmbeddingsJobQueueV2').where('modelId', 'in', [live, next]).execute()
  await queueViewerPagesForEmbedding(viewerId)
  expect(await queuedPageIds(live)).toEqual([])
  expect(mockSet).toHaveBeenCalledWith(`embedOnSearch:${viewerId}`, '1', 'EX', 3600, 'NX')
  await queueViewerPagesForEmbedding(otherUserId)
  expect(await queuedPageIds(live)).toEqual([pageIds.someoneElses])
})
