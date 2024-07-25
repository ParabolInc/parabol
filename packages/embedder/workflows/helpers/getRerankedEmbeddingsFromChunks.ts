import ms from 'ms'
import getKysely from '../../../server/postgres/getKysely'
import {JobQueueError} from '../../JobQueueError'
import {AbstractEmbeddingsModel} from '../../ai_models/AbstractEmbeddingsModel'
import numberVectorToString from '../../indexing/numberVectorToString'

/*
 * Overview on how we find related discussions:
 *
 * A previous discussion could be fully related (similarity=1), not related
 * (similarity=0), opposite (similarity=-1), or any place between 1..0..-1.
 *
 * We create an embeddingVector for the current retro discussion topic, then
 * fetch up to MAX_CANDIDATES that are greater than or equal
 * to SIMILARITY_THRESHOLD.
 *
 * We create a new embeddingVector that emphasizes only the reflections from the
 * topic and use this to re-rank the initial results by:
 *
 * newSimilarity = initialSimilarity +
 *   (rerankSimilarity - RERANK_THRESHOLD) * RERANK_MULTIPLE
 *
 * This amplifies the role reflection content plays in matches, making similar
 * reflections boost matches and de-emphasize matches that otherwise might be
 * based on similar template prompts, authorship, etc.
 *
 */

export interface SimilarEmbedding {
  similarity: number
  embeddingId: number
  embeddingsMetadataId: number
}

export const getRerankedEmbeddingsFromChunks = async (
  embeddingsMetadataId: number,
  chunks: string[],
  similarEmbeddings: SimilarEmbedding[],
  embeddingModel: AbstractEmbeddingsModel
) => {
  const pg = getKysely()
  const RERANK_THRESHOLD = 0.7
  const RERANK_MULTIPLE = 3
  const similarEmbeddingIds = similarEmbeddings.map((e) => e.embeddingId)
  const similarityScores = {} as Record<number, number[]>
  const results = await Promise.all(
    chunks.map(async (chunk) => {
      const embeddingVector = await embeddingModel.getEmbedding(chunk)
      if (embeddingVector instanceof Error) {
        return new JobQueueError(
          `unable to get embeddings: ${embeddingVector.message}`,
          ms('1m'),
          10
        )
      }
      const embeddingVectorStr = numberVectorToString(embeddingVector)
      const embeddingsWithSimilarities = await pg
        .selectFrom(embeddingModel.tableName)
        .select(({eb, val, parens}) => [
          'id as embeddingId',
          eb(val(1), '-', parens('embedding' as any, '<=>' as any, embeddingVectorStr)).as(
            'rerankSimilarity'
          )
        ])
        .where('id', 'in', similarEmbeddingIds)
        .execute()
      embeddingsWithSimilarities.forEach((e) => {
        const {embeddingId, rerankSimilarity} = e
        const similarDiscussion = similarEmbeddings.find((se) => se.embeddingId === embeddingId)!
        const weightedSimilarity = Math.min(
          // Limit the upper bound to 0.999..
          0.999999999,
          // Limit the lower bound to -0.999..
          Math.max(
            -0.999999999,
            similarDiscussion.similarity + (rerankSimilarity - RERANK_THRESHOLD) * RERANK_MULTIPLE
          )
        )
        similarityScores[embeddingId] = similarityScores[embeddingId] || []
        similarityScores[embeddingId]!.push(weightedSimilarity)
      })
      return
    })
  )
  const firstError = results.find((r) => r instanceof JobQueueError)
  if (firstError) return firstError

  const weightedSimilarities = Object.entries(similarityScores).map((entry) => {
    const embeddingId = parseInt(entry[0], 10)
    const similarities = entry[1]
    const similarEmbedding = similarEmbeddings.find((se) => se.embeddingId === embeddingId)!
    return {
      embeddingsMetadataId: similarEmbedding.embeddingsMetadataId,
      similarity: similarities.reduce((a, b) => a + b, 0) / similarities.length
    }
  })

  if (weightedSimilarities.length === 0)
    return new JobQueueError(`no similar embeddings found: ${embeddingsMetadataId}`)

  const MAX_RESULTS = 3
  const SIMILARITY_THRESHOLD = 0.67
  const topResults = weightedSimilarities
    // SIMILARITY THRESHOLD will be too high if chunks.length > 1
    .filter((sd) => sd.similarity >= SIMILARITY_THRESHOLD)
    .sort((a, b) => (a.similarity > b.similarity ? -1 : 1))
    .slice(0, MAX_RESULTS)
  if (!topResults.length) {
    const similarities = weightedSimilarities.map((ws) => ws.similarity).join(',')
    return new JobQueueError(
      `no similar embeddings found. Decrease SIMILARITY_THRESHOLD: ${embeddingsMetadataId}, ${similarities}`
    )
  }
  return topResults
}
