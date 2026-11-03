import {activeEmbeddingModelId} from '../../../embedder/activeEmbeddingModel'
import {getEmbeddingsTableName} from '../../../embedder/getEmbeddingsTableName'
import {primeSupportedLanguages} from '../../../embedder/getSupportedLanguages'
import {embedMetadata} from '../../../embedder/workflows/embedMetadata'
import {getNewDataLoader} from '../../dataloader/getNewDataLoader'
import generateUID from '../../generateUID'
import getKysely from '../../postgres/getKysely'

jest.mock('../../../embedder/ai_models/ModelManager', () => ({
  __esModule: true,
  default: () => ({getEmbedder: () => mockEmbedder})
}))

const pg = getKysely()
const teamId = `embedMetadataTeam${generateUID()}`
const PROMPT = 'Instruct: Find the same point\nQuery: '
const unitVector = Array.from({length: 1024}, (_, index) => (index === 0 ? 1 : 0))

const mockEmbedder = {
  tableName: getEmbeddingsTableName(activeEmbeddingModelId),
  languages: ['en'],
  discussionText: 'plain',
  reflectionPrompt: PROMPT,
  chunkText: jest.fn(async (text: string) => [text]),
  getEmbedding: jest.fn(async (): Promise<number[] | Error> => unitVector)
}

const insertMetadata = async (objectType: 'retroReflection' | 'meetingTemplate', text: string) => {
  const {id} = await pg
    .insertInto('EmbeddingsMetadata')
    .values({
      objectType,
      refId: generateUID(),
      teamId,
      language: 'en',
      fullText: text,
      refUpdatedAt: new Date(Date.now() + 60_000)
    })
    .returning('id')
    .executeTakeFirstOrThrow()
  return id
}

const run = (embeddingsMetadataId: number) =>
  embedMetadata({
    dataLoader: getNewDataLoader('embedMetadataTest'),
    data: {embeddingsMetadataId, modelId: activeEmbeddingModelId!}
  })

jest.mock('../../../embedder/indexing/createEmbeddingTextFrom', () => ({
  createEmbeddingTextFrom: jest.fn(),
  isEmbeddingOutdated: jest.fn(async () => false)
}))

beforeAll(primeSupportedLanguages)

beforeEach(() => mockEmbedder.getEmbedding.mockClear())

afterAll(async () => {
  await pg.deleteFrom('EmbeddingsMetadata').where('teamId', '=', teamId).execute()
  await pg.destroy()
})

it("embeds a reflection with the model's reflection prompt", async () => {
  await run(await insertMetadata('retroReflection', 'standups run too long'))
  expect(mockEmbedder.getEmbedding).toHaveBeenCalledWith(`${PROMPT}standups run too long`)
})

it('embeds everything else as it reads', async () => {
  await run(await insertMetadata('meetingTemplate', 'Start Stop Continue'))
  expect(mockEmbedder.getEmbedding).toHaveBeenCalledWith('Start Stop Continue')
})
