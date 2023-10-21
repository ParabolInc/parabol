/**
 * @typedef {Array<number>} EmbeddingVector
 * @param {EmbeddingVector} embedding
 * @returns {number}
 */
export function calculateCosineSimilarity<T extends Float32Array>(embedding: T, embedding2: T) {
  let dotProduct = 0
  let queryMagnitude = 0
  let embeddingMagnitude = 0
  const embedding2Length = embedding2.length
  for (let i = 0; i < embedding2Length; i++) {
    dotProduct += embedding2[i] * embedding[i]
    queryMagnitude += embedding2[i] ** 2
    embeddingMagnitude += embedding[i] ** 2
  }
  return dotProduct / (Math.sqrt(queryMagnitude) * Math.sqrt(embeddingMagnitude))
}
