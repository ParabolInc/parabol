import TextEmbeddingsInference from '../../../embedder/ai_models/TextEmbeddingsInference'
import {embeddingUsage} from '../../../embedder/embeddingUsage'

jest.mock('parabol-client/utils/sleep', () => ({__esModule: true, default: async () => {}}))

const makeTei = () =>
  new TextEmbeddingsInference(
    'Svenni551/Qwen3-Embedding-0.6B-ONNX-INT8',
    'http://localhost:1/',
    512
  )

const respondWith = (tei: TextEmbeddingsInference, headers: Record<string, string>) =>
  jest.spyOn(tei.client, 'POST').mockResolvedValue({
    data: [[0.6, 0.8]],
    error: undefined,
    response: new Response(null, {headers})
  })

it('refuses blank text without calling TEI', async () => {
  const tei = new TextEmbeddingsInference(
    'Svenni551/Qwen3-Embedding-0.6B-ONNX-INT8',
    'http://localhost:1/',
    512
  )
  const post = jest.spyOn(tei.client, 'POST')
  expect(await tei.getEmbedding(' \n\t')).toBeInstanceOf(Error)
  expect(post).not.toHaveBeenCalled()
})

it('reports the tokens TEI counted', async () => {
  const tei = makeTei()
  respondWith(tei, {'x-compute-tokens': '12'})
  const before = embeddingUsage.tokens
  expect(await tei.getEmbeddingWithTokens('rate limiter rollout')).toEqual({
    embedding: [0.6, 0.8],
    tokens: 12
  })
  expect(embeddingUsage.tokens - before).toBe(12)
})

it('counts 0 tokens when TEI sends no count', async () => {
  const tei = makeTei()
  respondWith(tei, {})
  expect(await tei.getEmbeddingWithTokens('rate limiter rollout')).toEqual({
    embedding: [0.6, 0.8],
    tokens: 0
  })
})

it("prefixes a search with the model's prompt", async () => {
  const tei = new TextEmbeddingsInference(
    'microsoft/harrier-oss-v1-270m',
    'http://localhost:1/',
    512
  )
  const post = respondWith(tei, {})
  await tei.getSearchEmbedding('retro')
  expect(post).toHaveBeenCalledWith('/embed', {
    body: {
      inputs:
        'Instruct: Given a web search query, retrieve relevant passages that answer the query\nQuery: retro'
    }
  })
})

it('sends a search as is when the model has no prompt', async () => {
  const tei = makeTei()
  const post = respondWith(tei, {})
  await tei.getSearchEmbedding('retro')
  expect(post).toHaveBeenCalledWith('/embed', {body: {inputs: 'retro'}})
})

it('sends a document as is, whatever the model', async () => {
  const tei = new TextEmbeddingsInference(
    'microsoft/harrier-oss-v1-270m',
    'http://localhost:1/',
    512
  )
  const post = respondWith(tei, {})
  await tei.getEmbedding('A page about retros')
  expect(post).toHaveBeenCalledWith('/embed', {body: {inputs: 'A page about retros'}})
})

describe('when TEI is unreachable', () => {
  const unreachable = {error: {error: 'fetch failed'}} as never
  const answering = {data: [[1]], response: new Response()} as never

  it('waits for it to come back instead of failing the embed', async () => {
    const tei = makeTei()
    jest
      .spyOn(tei.client, 'POST')
      .mockResolvedValueOnce(unreachable)
      .mockResolvedValueOnce(unreachable)
      .mockResolvedValueOnce(answering)
      .mockResolvedValue({data: [[0.6, 0.8]], response: new Response()} as never)
    expect(await tei.getEmbeddingWithTokens('rate limiter rollout')).toEqual({
      embedding: [0.6, 0.8],
      tokens: 0
    })
  })

  it('waits for it to come back instead of failing the token count', async () => {
    const tei = makeTei()
    jest
      .spyOn(tei.client, 'POST')
      .mockResolvedValueOnce(unreachable)
      .mockResolvedValueOnce(answering)
      .mockResolvedValue({data: [[{id: 7}]], response: new Response()} as never)
    expect(await tei.getTokens('rate limiter rollout')).toEqual([7])
  })
})

it('returns an error TEI answers with, without waiting', async () => {
  const tei = makeTei()
  const post = jest.spyOn(tei.client, 'POST').mockResolvedValue({
    error: {error: 'too long'},
    response: new Response(null, {status: 413})
  } as never)
  expect(await tei.getEmbeddingWithTokens('rate limiter rollout')).toEqual(new Error('too long'))
  expect(post).toHaveBeenCalledTimes(1)
})
