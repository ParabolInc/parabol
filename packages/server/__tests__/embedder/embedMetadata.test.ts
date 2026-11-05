import {
  activeEmbeddingDefinition,
  activeEmbeddingModelId
} from '../../../embedder/activeEmbeddingModel'
import type {ModelId} from '../../../embedder/ai_models/modelIdDefinitions'
import {getEmbeddingsTableName} from '../../../embedder/getEmbeddingsTableName'
import {primeSupportedLanguages} from '../../../embedder/getSupportedLanguages'
import {createEmbeddingTextFrom} from '../../../embedder/indexing/createEmbeddingTextFrom'
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
const unitVector = Array.from(
  {length: activeEmbeddingDefinition!.embeddingDimensions},
  (_, index) => (index === 0 ? 1 : 0)
)

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

describe('when the text is rebuilt', () => {
  const OTHER_MODEL: ModelId = 'microsoft/harrier-oss-v1-270m'
  const QWEN3: ModelId = 'Svenni551/Qwen3-Embedding-0.6B-ONNX-INT8'
  const notActive = activeEmbeddingModelId === OTHER_MODEL ? QWEN3 : OTHER_MODEL

  const storedText = async (id: number) => {
    const {fullText} = await pg
      .selectFrom('EmbeddingsMetadata')
      .select('fullText')
      .where('id', '=', id)
      .executeTakeFirstOrThrow()
    return fullText
  }

  const rebuild = (embeddingsMetadataId: number, modelId: ModelId) =>
    embedMetadata({
      dataLoader: getNewDataLoader('embedMetadataTest'),
      data: {embeddingsMetadataId, modelId, forceBuildText: true}
    })

  beforeEach(() =>
    jest.mocked(createEmbeddingTextFrom).mockResolvedValue({body: 'rebuilt text', language: 'en'})
  )

  it('keeps it for the active model', async () => {
    const id = await insertMetadata('meetingTemplate', 'old text')
    await rebuild(id, activeEmbeddingModelId!)
    expect(await storedText(id)).toBe('rebuilt text')
  })

  it("embeds it for another model and leaves the active model's text alone", async () => {
    const id = await insertMetadata('meetingTemplate', 'old text')
    await rebuild(id, notActive)
    expect(mockEmbedder.getEmbedding).toHaveBeenCalledWith('rebuilt text')
    expect(await storedText(id)).toBe('old text')
  })
})
