import TextEmbeddingsInference from '../../../embedder/ai_models/TextEmbeddingsInference'

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
