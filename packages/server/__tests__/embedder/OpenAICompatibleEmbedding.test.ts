import {once} from 'node:events'
import {createServer, type Server} from 'node:http'
import OpenAICompatibleEmbedding from '../../../embedder/ai_models/OpenAICompatibleEmbedding'
import {embeddingUsage} from '../../../embedder/embeddingUsage'

type Reply = {status: number; body: unknown; headers?: Record<string, string>; bodyDelayMs?: number}
type Request = {path?: string; authorization?: string; body: Record<string, unknown>}
const vector = Array.from({length: 1536}, () => 1 / Math.sqrt(1536))
const success = () => ({data: [{index: 0, embedding: vector}], usage: {prompt_tokens: 3}})
let server: Server
let url: string
let requests: Request[]
let replies: Reply[]
const savedKey = process.env.OPEN_AI_API_KEY
const savedStandardKey = process.env.OPENAI_API_KEY
const savedURL = process.env.OPENAI_BASE_URL
const makeModel = (maxTokens = 8192, apiModel?: string) =>
  new OpenAICompatibleEmbedding('text-embedding-3-small', url, maxTokens, apiModel)

beforeAll(async () => {
  server = createServer(async (request, response) => {
    const chunks: Buffer[] = []
    for await (const chunk of request) chunks.push(Buffer.from(chunk))
    requests.push({
      path: request.url,
      authorization: request.headers.authorization,
      body: JSON.parse(Buffer.concat(chunks).toString())
    })
    const reply = replies.shift() ?? {status: 200, body: success()}
    response.writeHead(reply.status, {'Content-Type': 'application/json', ...reply.headers})
    if (reply.bodyDelayMs) {
      response.flushHeaders()
      setTimeout(() => response.end(JSON.stringify(reply.body)), reply.bodyDelayMs)
    } else response.end(JSON.stringify(reply.body))
  })
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('Missing test server port')
  url = `http://127.0.0.1:${address.port}/v1`
})
beforeEach(() => {
  process.env.OPEN_AI_API_KEY = 'synthetic-test-value'
  delete process.env.OPENAI_API_KEY
  delete process.env.OPENAI_BASE_URL
  requests = []
  replies = []
})
afterAll(async () => {
  for (const [name, value] of Object.entries({
    OPEN_AI_API_KEY: savedKey,
    OPENAI_API_KEY: savedStandardKey,
    OPENAI_BASE_URL: savedURL
  })) {
    if (value === undefined) delete process.env[name]
    else process.env[name] = value
  }
  server.closeAllConnections()
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve()))
  )
})
it('authenticates an embedding request and counts the reported usage', async () => {
  const model = makeModel()
  const before = embeddingUsage.tokens
  expect(await model.getEmbeddingWithTokens('A short note')).toEqual({embedding: vector, tokens: 3})
  expect(requests).toEqual([
    {
      path: '/v1/embeddings',
      authorization: 'Bearer synthetic-test-value',
      body: {
        model: 'text-embedding-3-small',
        input: 'A short note',
        dimensions: 1536,
        encoding_format: 'float'
      }
    }
  ])
  expect(embeddingUsage.tokens - before).toBe(3)
})
it('uses a gateway alias without changing its model identity or table', async () => {
  const model = makeModel(8192, 'gateway-embedding-alias')
  await model.getEmbedding('A short note')
  expect(requests[0]?.body.model).toBe('gateway-embedding-alias')
  expect(model.modelId).toBe('text-embedding-3-small')
  expect(model.tableName).toBe('Embeddings_openai_te3_small')
})
it('uses the standard API key and gateway environment variables as fallbacks', async () => {
  delete process.env.OPEN_AI_API_KEY
  process.env.OPENAI_API_KEY = 'standard-synthetic-value'
  process.env.OPENAI_BASE_URL = url
  const model = new OpenAICompatibleEmbedding('text-embedding-3-small', '', 8192)
  await model.getEmbedding('A short note')
  expect(requests[0]?.authorization).toBe('Bearer standard-synthetic-value')
})
it('uses the native OpenAI endpoint when no gateway is configured', () => {
  const model = new OpenAICompatibleEmbedding('text-embedding-3-small', '', 8192)
  expect(model.client.baseURL).toBe('https://api.openai.com/v1')
})
it.each(['Сборка медленная', 'Short note', '<|endoftext|>', '你好'])(
  'counts ordinary Unicode and special-token-looking text: %s',
  async (text) => {
    const model = makeModel()
    const tokens = await model.getTokens(text)
    expect(tokens.length).toBeGreaterThan(0)
    expect(await model.chunkText(text)).toEqual([text])
  }
)
it('refuses blank or over-budget input before making a request', async () => {
  const model = makeModel(3)
  expect(await model.getEmbedding('  \n')).toBeInstanceOf(Error)
  expect(await model.getEmbedding(' a'.repeat(4))).toBeInstanceOf(Error)
  expect(requests).toHaveLength(0)
  expect(await model.getEmbedding(' a'.repeat(3))).toEqual(vector)
})
it('accepts the documented 8192-token boundary', async () => {
  const model = makeModel()
  expect((await model.getTokens(' a'.repeat(8192))).length).toBe(8192)
  expect(await model.getEmbedding(' a'.repeat(8192))).toEqual(vector)
  expect(await model.getEmbedding(' a'.repeat(8193))).toBeInstanceOf(Error)
  expect(requests).toHaveLength(1)
})
it.each([1, 2])('chunks over-budget text with a small token budget: %s', async (maxTokens) => {
  const model = makeModel(maxTokens)
  const chunks = await model.chunkText('one two three four')
  expect(chunks).not.toBeInstanceOf(Error)
  if (chunks instanceof Error) throw chunks
  expect(chunks.join(' ')).toBe('one two three four')
  for (const chunk of chunks) {
    expect((await model.getTokens(chunk)).length).toBeLessThanOrEqual(maxTokens)
  }
})
it('returns a controlled error when an indivisible word exceeds the token budget', async () => {
  expect(await makeModel(1).chunkText('uncharacteristically')).toEqual(
    new Error('Text could not be chunked. The tokenizer cannot support this content.')
  )
})
it.each([0, -1, 0.5, 8193, Infinity, NaN])('rejects an invalid token budget: %s', (maxTokens) => {
  expect(() => makeModel(maxTokens)).toThrow('maxTokens')
})
it.each([
  'file:///tmp/model',
  'https://user:password@example.com/v1',
  'https://example.com/v1?key=value',
  'https://example.com/v1#fragment'
])('rejects an invalid base URL: %s', (endpoint) => {
  expect(() => new OpenAICompatibleEmbedding('text-embedding-3-small', endpoint, 8192)).toThrow(
    'URL'
  )
})
it('requires a configured API key', () => {
  delete process.env.OPEN_AI_API_KEY
  expect(makeModel).toThrow('API_KEY')
})
it.each([429, 503])('retries temporary status %s within the same operation', async (status) => {
  replies.push({
    status,
    body: {error: {message: 'synthetic provider response'}},
    headers: {'retry-after-ms': '1'}
  })
  expect(await makeModel().getEmbedding('A short note')).toEqual(vector)
  expect(requests).toHaveLength(2)
})
it('stops after three temporary failures without exposing response content', async () => {
  replies.push(
    ...Array.from({length: 3}, () => ({
      status: 503,
      body: {error: {message: 'synthetic private input'}},
      headers: {'retry-after-ms': '1'}
    }))
  )
  const result = await makeModel().getEmbedding('A short note')
  expect(result).toBeInstanceOf(Error)
  expect((result as Error).message).not.toContain('synthetic private input')
  expect(requests).toHaveLength(3)
})
it('does not retry a permanent failure', async () => {
  replies.push({status: 400, body: {error: {message: 'synthetic private input'}}})
  expect(await makeModel().getEmbedding('A short note')).toBeInstanceOf(Error)
  expect(requests).toHaveLength(1)
})
it('never follows a provider redirect', async () => {
  replies.push(
    ...Array.from({length: 3}, () => ({
      status: 307,
      body: {},
      headers: {location: `${url}/redirected`}
    }))
  )
  expect(await makeModel().getEmbedding('A short note')).toBeInstanceOf(Error)
  expect(requests.every((request) => request.path === '/v1/embeddings')).toBe(true)
})
it('uses one deadline for requests and retry waits', async () => {
  const controller = new AbortController()
  const timeout = jest.spyOn(AbortSignal, 'timeout').mockReturnValue(controller.signal)
  replies.push({status: 429, body: {}, headers: {'retry-after': '60'}})
  const pending = makeModel().getEmbedding('A short note')
  await once(server, 'request')
  setTimeout(() => controller.abort(), 10)
  expect(await pending).toBeInstanceOf(Error)
  expect(requests).toHaveLength(1)
  expect(timeout).toHaveBeenCalledWith(25000)
  timeout.mockRestore()
})
it('applies the operation deadline while reading the response body', async () => {
  const controller = new AbortController()
  const timeout = jest.spyOn(AbortSignal, 'timeout').mockReturnValue(controller.signal)
  replies.push({status: 200, body: success(), bodyDelayMs: 100})
  const pending = makeModel().getEmbedding('A short note')
  await once(server, 'request')
  setTimeout(() => controller.abort(), 10)
  expect(await pending).toBeInstanceOf(Error)
  expect(requests).toHaveLength(1)
  timeout.mockRestore()
})
it.each(
  [[], Array(1535).fill(1), Array(1536).fill(0), [...Array(1535).fill(1), null]].map(
    (embedding) => ({embedding})
  )
)('rejects an invalid vector', async ({embedding}) => {
  replies.push({status: 200, body: {data: [{index: 0, embedding}], usage: {prompt_tokens: 1}}})
  expect(await makeModel().getEmbedding('A short note')).toBeInstanceOf(Error)
})
