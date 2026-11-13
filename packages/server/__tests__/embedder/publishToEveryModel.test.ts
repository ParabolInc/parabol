import {FIRST_FILL_PRIORITY} from '../../../embedder/getEmbedderJobPriority'
import generateUID from '../../generateUID'
import getKysely from '../../postgres/getKysely'

jest.mock('../../utils/getRedis', () => ({
  __esModule: true,
  default: () => ({publish: async () => 1})
}))
jest.mock('../../utils/embeddingResponder', () => ({
  embeddingResponder: {
    channelName: 'embedderResponse:test',
    nextRequestId: () => 1,
    waitForResponse: async () => new Float32Array([0.5])
  }
}))
jest.mock('../../../embedder/getEmbedderJobPriority', () => {
  const actual = jest.requireActual('../../../embedder/getEmbedderJobPriority')
  return {
    ...actual,
    getEmbedderJobPriority: async (jobKind: string) =>
      jobKind === 'modelUpdate' ? actual.FIRST_FILL_PRIORITY + 1 : 123_456
  }
})

const HARRIER = 'Parabol/harrier-oss-v1-270m-ONNX-INT8'
const QWEN3 = 'Svenni551/Qwen3-Embedding-0.6B-ONNX-INT8'
const entry = (modelId: string, port: number) => ({
  model: `text-embeddings-inference:${modelId}`,
  url: `http://localhost:${port}/`,
  maxTokens: 1024
})

const pg = getKysely()
const pageId = -(Date.now() % 1_000_000_000)
let embeddingsMetadataId: number

const loadPublishToEmbedder = (models: ReturnType<typeof entry>[]) => {
  jest.resetModules()
  process.env.AI_EMBEDDER_WORKERS = '1'
  process.env.AI_EMBEDDING_MODELS = JSON.stringify(models)
  return (
    require('../../graphql/mutations/helpers/publishToEmbedder') as typeof import('../../graphql/mutations/helpers/publishToEmbedder')
  ).publishToEmbedder
}

const queuedJobs = () =>
  pg
    .selectFrom('EmbeddingsJobQueueV2')
    .select(['modelId', 'jobType', 'priority', 'jobData', 'runAfter'])
    .where((eb) =>
      eb.or([eb('pageId', '=', pageId), eb('embeddingsMetadataId', '=', embeddingsMetadataId)])
    )
    .orderBy('priority')
    .execute()

beforeAll(async () => {
  const {id} = await pg
    .insertInto('EmbeddingsMetadata')
    .values({
      objectType: 'retroReflection',
      refId: generateUID(),
      teamId: `publishTest${generateUID()}`,
      refUpdatedAt: new Date()
    })
    .returning('id')
    .executeTakeFirstOrThrow()
  embeddingsMetadataId = id
})

afterEach(async () => {
  await pg
    .deleteFrom('EmbeddingsJobQueueV2')
    .where((eb) =>
      eb.or([eb('pageId', '=', pageId), eb('embeddingsMetadataId', '=', embeddingsMetadataId)])
    )
    .execute()
})

afterAll(async () => {
  await pg.deleteFrom('EmbeddingsMetadata').where('id', '=', embeddingsMetadataId).execute()
  await pg.destroy()
})

it('embeds a new card for every listed model, the inactive ones behind live work', async () => {
  const publishToEmbedder = loadPublishToEmbedder([entry(HARRIER, 3041), entry(QWEN3, 3040)])
  await publishToEmbedder({
    jobType: 'embed:start',
    embeddingsMetadataId,
    data: {requestId: 9, channelName: 'embedderResponse:test'}
  })
  const [active, inactive] = await queuedJobs()
  expect(active).toMatchObject({
    modelId: HARRIER,
    priority: 123_456,
    jobData: {requestId: 9, channelName: 'embedderResponse:test'}
  })
  expect(inactive).toMatchObject({modelId: QWEN3, jobData: {forceBuildText: true}})
  expect(inactive!.priority).toBeGreaterThanOrEqual(FIRST_FILL_PRIORITY)
})

it('waits for page edits to settle for every listed model', async () => {
  const publishToEmbedder = loadPublishToEmbedder([entry(HARRIER, 3041), entry(QWEN3, 3040)])
  await publishToEmbedder({jobType: 'embedPage:start', pageId})
  const jobs = await queuedJobs()
  expect(jobs.map(({modelId}) => modelId)).toEqual([HARRIER, QWEN3])
  jobs.forEach(({runAfter}) => expect(runAfter.getTime()).toBeGreaterThan(Date.now() + 15_000))
})

it('queues one job when only one model is listed', async () => {
  const publishToEmbedder = loadPublishToEmbedder([entry(HARRIER, 3041)])
  await publishToEmbedder({jobType: 'embed:start', embeddingsMetadataId})
  expect((await queuedJobs()).map(({modelId}) => modelId)).toEqual([HARRIER])
})
