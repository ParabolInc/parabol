import {parseModelEnvVars} from '../../../embedder/ai_models/parseModelEnvVars'

const savedEmbedding = process.env.AI_EMBEDDING_MODELS
const savedGeneration = process.env.AI_GENERATION_MODELS
const config = (model: string, apiModel?: unknown) => ({model, apiModel, url: '', maxTokens: 8192})

afterAll(() => {
  for (const [name, value] of Object.entries({
    AI_EMBEDDING_MODELS: savedEmbedding,
    AI_GENERATION_MODELS: savedGeneration
  })) {
    if (value === undefined) delete process.env[name]
    else process.env[name] = value
  }
})

it('preserves the canonical embedding model and optional API alias', () => {
  const models = [config('openai:text-embedding-3-small', 'gateway-embedding-alias')]
  process.env.AI_EMBEDDING_MODELS = JSON.stringify(models)
  expect(parseModelEnvVars('AI_EMBEDDING_MODELS')).toEqual(models)
})

it.each([
  ['openai:text-embedding-3-small', 'openai:text-embedding-3-small'],
  [
    'text-embeddings-inference:microsoft/harrier-oss-v1-270m',
    'vllm:Parabol/harrier-oss-v1-270m-ONNX-INT8'
  ]
])('rejects duplicate canonical models: %s and %s', (first, second) => {
  process.env.AI_EMBEDDING_MODELS = JSON.stringify([config(first), config(second)])
  expect(() => parseModelEnvVars('AI_EMBEDDING_MODELS')).toThrow('Duplicate embedding model')
})

it.each(['', ' ', 42, null])('rejects an invalid API alias: %s', (apiModel) => {
  process.env.AI_EMBEDDING_MODELS = JSON.stringify([
    config('openai:text-embedding-3-small', apiModel)
  ])
  expect(() => parseModelEnvVars('AI_EMBEDDING_MODELS')).toThrow('apiModel')
})

it('rejects an API alias for providers that cannot use it', () => {
  process.env.AI_EMBEDDING_MODELS = JSON.stringify([
    config('text-embeddings-inference:BAAI/bge-large-en-v1.5', 'alias')
  ])
  expect(() => parseModelEnvVars('AI_EMBEDDING_MODELS')).toThrow('apiModel')
})

it('leaves generation model parsing unchanged', () => {
  const models = [config('openai:custom-generation-model')]
  process.env.AI_GENERATION_MODELS = JSON.stringify(models)
  expect(parseModelEnvVars('AI_GENERATION_MODELS')).toEqual(JSON.parse(JSON.stringify(models)))
})
