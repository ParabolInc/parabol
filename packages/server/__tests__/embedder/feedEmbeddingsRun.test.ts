import {sql} from 'kysely'
import type {ModelId} from '../../../embedder/ai_models/modelIdDefinitions'
import TextEmbeddingsInference from '../../../embedder/ai_models/TextEmbeddingsInference'
import type {EmbeddingsRun} from '../../../embedder/embeddingsRun'
import {feedEmbeddingsRun, getEmbeddingsRunProgress} from '../../../embedder/feedEmbeddingsRun'
import {
  getEmbeddingsPagesTableName,
  getEmbeddingsTableName
} from '../../../embedder/getEmbeddingsTableName'
import numberVectorToString from '../../../embedder/indexing/numberVectorToString'
import generateUID from '../../generateUID'
import getKysely from '../../postgres/getKysely'

jest.mock('../../../embedder/ai_models/modelIdDefinitions', () => {
  const actual = jest.requireActual<
    typeof import('../../../embedder/ai_models/modelIdDefinitions')
  >('../../../embedder/ai_models/modelIdDefinitions')
  const generation = actual.modelIdDefinitions['Svenni551/Qwen3-Embedding-0.6B-ONNX-INT8#v3']
  return {
    ...actual,
    modelIdDefinitions: {
      ...actual.modelIdDefinitions,
      feedRunSource: {...generation, tableSuffix: 'feed_run_source'},
      feedRunTarget: {...generation, tableSuffix: 'feed_run_target'}
    }
  }
})

jest.mock('../../../embedder/activeEmbeddingModel', () => ({
  activeEmbeddingModelId: 'feedRunSource',
  embeddingModelIds: ['feedRunSource', 'feedRunTarget']
}))

const pg = getKysely()
const source = 'feedRunSource' as ModelId
const target = 'feedRunTarget' as ModelId
const sourcePages = getEmbeddingsPagesTableName(source)!
const targetPages = getEmbeddingsPagesTableName(target)!
const sourceMetadata = getEmbeddingsTableName(source)
const targetMetadata = getEmbeddingsTableName(target)
const userId = `feedRunTest|${generateUID()}`
const vector = numberVectorToString(Array.from({length: 1024}, (_, i) => (i === 0 ? 1 : 0)))
const pageIds: Record<string, number> = {}
const metadataIds: Record<string, number> = {}

const run = (overrides: Partial<EmbeddingsRun> = {}): EmbeddingsRun => ({
  modelId: target,
  sourceModelId: source,
  state: 'running',
  copyMetadata: true,
  queueSize: 10,
  pageCursor: null,
  metadataCursor: null,
  metadataDone: false,
  pagesDone: false,
  ...overrides
})

const insertPage = async (key: string, daysAgo: number, deletedAt: Date | null = null) => {
  const {id} = await pg
    .insertInto('Page')
    .values({
      userId,
      sortOrder: key,
      title: key,
      plaintextContent: key,
      updatedAt: sql`now() - ${daysAgo} * interval '1 day'`,
      deletedAt
    })
    .returning('id')
    .executeTakeFirstOrThrow()
  pageIds[key] = id
}

const insertPageRow = (table: typeof sourcePages, pageId: number) =>
  pg
    .insertInto(table)
    .values({
      embedText: 'text',
      tsv: sql`to_tsvector('simple', 'text')`,
      embedding: vector,
      pageId,
      chunkNumber: 0,
      pageUpdatedAt: new Date()
    })
    .execute()

const insertMetadata = async (key: string) => {
  const {id} = await pg
    .insertInto('EmbeddingsMetadata')
    .values({objectType: 'meetingTemplate', refId: `${userId}-${key}`, teamId: userId})
    .returning('id')
    .executeTakeFirstOrThrow()
  metadataIds[key] = id
}

const insertMetadataRow = (
  table: typeof sourceMetadata,
  embeddingsMetadataId: number,
  chunk: number
) =>
  pg
    .insertInto(table)
    .values({
      embedText: `chunk ${chunk}`,
      tsv: sql`to_tsvector('simple', 'chunk')`,
      embedding: vector,
      embeddingsMetadataId,
      chunkNumber: chunk
    })
    .execute()

const queuedJobs = () =>
  pg
    .selectFrom('EmbeddingsJobQueueV2')
    .select(['jobType', 'pageId', 'embeddingsMetadataId'])
    .where('modelId', '=', target)
    .orderBy('id')
    .execute()

beforeAll(async () => {
  for (const modelId of [source, target]) {
    await new TextEmbeddingsInference(modelId, 'http://localhost:3040/', 2048).createTable()
  }
  await pg
    .insertInto('User')
    .values({
      id: userId,
      email: `${userId}@example.com`,
      picture: 'https://example.com/pic.png',
      preferredName: 'Feed Run Tester'
    })
    .execute()
  await insertPage('older', 200)
  await insertPage('third', 3)
  await insertPage('trashed', 6, new Date())
  await insertPage('newest', 1)
  await insertPage('alreadyDone', 4)
  await insertPage('second', 2)
  await insertPage('neverEmbedded', 5)
  for (const key of ['newest', 'second', 'third', 'alreadyDone', 'older', 'trashed']) {
    await insertPageRow(sourcePages, pageIds[key]!)
  }
  await insertPageRow(targetPages, pageIds.alreadyDone!)
  await insertMetadata('missing')
  await insertMetadata('copied')
  await insertMetadataRow(sourceMetadata, metadataIds.missing!, 0)
  await insertMetadataRow(sourceMetadata, metadataIds.missing!, 1)
  await insertMetadataRow(sourceMetadata, metadataIds.copied!, 0)
  await insertMetadataRow(targetMetadata, metadataIds.copied!, 0)
})

afterEach(async () => {
  await pg.deleteFrom('EmbeddingsJobQueueV2').where('modelId', '=', target).execute()
  await pg
    .deleteFrom(targetMetadata)
    .where('embeddingsMetadataId', '=', metadataIds.missing!)
    .execute()
})

afterAll(async () => {
  await pg.deleteFrom('Page').where('userId', '=', userId).execute()
  await pg.deleteFrom('User').where('id', '=', userId).execute()
  await pg.deleteFrom('EmbeddingsMetadata').where('id', 'in', Object.values(metadataIds)).execute()
  await sql`DROP TABLE IF EXISTS ${sql.id(sourcePages)}, ${sql.id(targetPages)}, ${sql.id(sourceMetadata)}, ${sql.id(targetMetadata)}`.execute(
    pg
  )
  await pg.destroy()
})

const queuedPageIds = async () => (await queuedJobs()).map(({pageId}) => pageId)

it('queues the newest embedded pages first, up to the queue size', async () => {
  await feedEmbeddingsRun(run({queueSize: 2}))
  expect(await queuedPageIds()).toEqual([pageIds.newest, pageIds.second])
})

it('skips pages that already have vectors in the target or none in the source', async () => {
  await feedEmbeddingsRun(run())
  expect(await queuedPageIds()).toEqual([
    pageIds.newest,
    pageIds.second,
    pageIds.third,
    pageIds.older
  ])
})

it('continues below its cursor, so pages that never get vectors are offered once', async () => {
  const first = await feedEmbeddingsRun(run({queueSize: 2}))
  await pg.deleteFrom('EmbeddingsJobQueueV2').where('modelId', '=', target).execute()
  const second = await feedEmbeddingsRun(first!.run)
  expect(await queuedPageIds()).toEqual([pageIds.third, pageIds.older])
  await pg.deleteFrom('EmbeddingsJobQueueV2').where('modelId', '=', target).execute()
  const third = await feedEmbeddingsRun(second!.run)
  expect(await queuedPageIds()).toEqual([])
  expect(third!.run.pagesDone).toBe(true)
})

it('queues nothing while paused or done, or once the source generation is gone', async () => {
  expect(await feedEmbeddingsRun(run({state: 'paused'}))).toBeNull()
  expect(await feedEmbeddingsRun(run({pagesDone: true, metadataDone: true}))).toBeNull()
  expect(await feedEmbeddingsRun(run({sourceModelId: 'gone' as ModelId}))).toBeNull()
  expect(await queuedJobs()).toEqual([])
})

it('copies metadata vectors, then marks metadata done', async () => {
  const first = await feedEmbeddingsRun(run())
  const copied = await pg
    .selectFrom(targetMetadata)
    .select(['chunkNumber', 'embedText'])
    .where('embeddingsMetadataId', '=', metadataIds.missing!)
    .orderBy('chunkNumber')
    .execute()
  expect(copied).toEqual([
    {chunkNumber: 0, embedText: 'chunk 0'},
    {chunkNumber: 1, embedText: 'chunk 1'}
  ])
  expect((await queuedJobs()).every(({jobType}) => jobType === 'embedPage:start')).toBe(true)
  const second = await feedEmbeddingsRun(first!.run)
  expect(second!.run.metadataDone).toBe(true)
})

it('queues metadata embeds first when the space differs', async () => {
  await feedEmbeddingsRun(run({copyMetadata: false, queueSize: 3}))
  expect(await queuedJobs()).toEqual([
    {jobType: 'embed:start', pageId: null, embeddingsMetadataId: metadataIds.missing},
    {jobType: 'embedPage:start', pageId: pageIds.newest, embeddingsMetadataId: null},
    {jobType: 'embedPage:start', pageId: pageIds.second, embeddingsMetadataId: null}
  ])
})

it('reports progress from the tables', async () => {
  await feedEmbeddingsRun(run({copyMetadata: false, queueSize: 3}))
  expect(await getEmbeddingsRunProgress(target, source)).toEqual({
    recentPages: {done: 1, total: 4},
    olderPages: {done: 0, total: 1},
    metadata: {done: 1, total: 2},
    queued: 3
  })
})
