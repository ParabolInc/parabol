import {ModelManager} from '../../../embedder/ai_models/ModelManager'
import OpenAICompatibleEmbedding from '../../../embedder/ai_models/OpenAICompatibleEmbedding'
import {Logger} from '../../utils/Logger'

const ACTIVE = 'Svenni551/Qwen3-Embedding-0.6B-ONNX-INT8'
const FILLING = 'Parabol/harrier-oss-v1-270m-ONNX-INT8'
const savedModels = process.env.AI_EMBEDDING_MODELS

const makeManager = () => {
  process.env.AI_EMBEDDING_MODELS = JSON.stringify(
    [ACTIVE, FILLING].map((modelId) => ({
      model: `text-embeddings-inference:${modelId}`,
      url: 'http://localhost:1/',
      maxTokens: 512
    }))
  )
  const manager = new ModelManager()
  return {
    manager,
    active: manager.getEmbedder(ACTIVE),
    filling: manager.getEmbedder(FILLING)
  }
}

afterAll(() => {
  process.env.AI_EMBEDDING_MODELS = savedModels
})

it("starts without waiting for a model that isn't active to fill", async () => {
  const {manager, active, filling} = makeManager()
  const createActive = jest.spyOn(active, 'createTable').mockResolvedValue()
  const createFilling = jest.spyOn(filling, 'createTable').mockReturnValue(new Promise(() => {}))
  await manager.maybeCreateTables()
  expect(createActive).toHaveBeenCalled()
  expect(createFilling).toHaveBeenCalled()
})

it("waits for the active model's tables", async () => {
  const {manager, active, filling} = makeManager()
  let created = false
  jest.spyOn(active, 'createTable').mockImplementation(async () => {
    await new Promise((resolve) => setTimeout(resolve, 20))
    created = true
  })
  jest.spyOn(filling, 'createTable').mockResolvedValue()
  await manager.maybeCreateTables()
  expect(created).toBe(true)
})

it('logs a fill that fails and keeps going', async () => {
  const {manager, active, filling} = makeManager()
  const logError = jest.spyOn(Logger, 'error').mockImplementation(() => {})
  jest.spyOn(active, 'createTable').mockResolvedValue()
  jest.spyOn(filling, 'createTable').mockRejectedValue(new Error('pod died'))
  await manager.maybeCreateTables()
  await new Promise((resolve) => setImmediate(resolve))
  expect(logError).toHaveBeenCalled()
})

it('takes a model under the id it went by before, and keys it by its id now', () => {
  process.env.AI_EMBEDDING_MODELS = JSON.stringify([
    {
      model: 'text-embeddings-inference:microsoft/harrier-oss-v1-270m',
      url: 'http://localhost:1/',
      maxTokens: 512
    }
  ])
  const manager = new ModelManager()
  expect([...manager.embeddingModels.keys()]).toEqual([FILLING])
  expect(manager.getEmbedder().modelId).toBe(FILLING)
})

it('selects an OpenAI-compatible embedder and keeps its storage identity', () => {
  const savedKey = process.env.OPEN_AI_API_KEY
  process.env.OPEN_AI_API_KEY = 'synthetic-test-value'
  try {
    process.env.AI_EMBEDDING_MODELS = JSON.stringify([
      {
        model: 'openai:text-embedding-3-small',
        apiModel: 'gateway-embedding-alias',
        url: 'http://localhost:1/v1',
        maxTokens: 8192
      }
    ])
    const manager = new ModelManager()
    expect(manager.getEmbedder()).toBeInstanceOf(OpenAICompatibleEmbedding)
    expect([...manager.embeddingModels.keys()]).toEqual(['text-embedding-3-small'])
    expect(manager.getEmbedder().tableName).toBe('Embeddings_openai_te3_small')
  } finally {
    if (savedKey === undefined) delete process.env.OPEN_AI_API_KEY
    else process.env.OPEN_AI_API_KEY = savedKey
  }
})
