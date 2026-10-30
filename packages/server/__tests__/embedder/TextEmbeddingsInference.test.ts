import TextEmbeddingsInference from '../../../embedder/ai_models/TextEmbeddingsInference'
import {embeddingUsage} from '../../../embedder/embeddingUsage'

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
