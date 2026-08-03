import {cosineSimilarity} from './cosineSimilarity'

/** Cards answering the same reflect prompt are held to a slightly lower bar than cross-column ones */
export const SAME_COLUMN_BONUS = 0.03
export const SIMILARITY_THRESHOLD = 0.78 + SAME_COLUMN_BONUS
export const MAX_SIMILAR_GROUPS = 2
export const MARGINAL_CARD_PENALTY = 0.05

/**
 * The minimal structure needed to compare reflection groups.
 * Deliberately structural so this module stays free of Relay & server types.
 */
export type SimilarityGroup = {
  readonly id: string
  readonly promptId: string
  readonly reflections: readonly {
    readonly id: string
    readonly embeddingVector?: readonly number[] | null
  }[]
}

export type SimilarityOptions = {
  /** Never compare groups that answer different reflect prompts */
  readonly sameColumnOnly?: boolean
}

/** The bigger the resulting group, the more similar its members must be to justify the merge */
export const sizeAdjustedThreshold = (resultingSize: number) =>
  SIMILARITY_THRESHOLD + Math.max(0, resultingSize - 3) * MARGINAL_CARD_PENALTY

/** Mean of the vectors, renormalized to unit length. Null when there is nothing to average */
export const centroid = (vectors: readonly (readonly number[])[]): readonly number[] | null => {
  const first = vectors[0]
  if (!first) return null
  if (vectors.length === 1) return first
  const dim = first.length
  const sum = new Array<number>(dim).fill(0)
  for (const vector of vectors) {
    for (let i = 0; i < dim; i++) {
      sum[i] = sum[i]! + (vector[i] ?? 0)
    }
  }
  const mag = Math.sqrt(sum.reduce((total, x) => total + x * x, 0))
  return mag > 0 ? sum.map((x) => x / mag) : sum
}

export const getGroupVectors = (group: SimilarityGroup) =>
  group.reflections
    .map(({embeddingVector}) => embeddingVector)
    .filter((vector): vector is readonly number[] => !!vector && vector.length > 0)

/** A single vector representing the whole group. Null when no reflection has been embedded yet */
export const getGroupVector = (group: SimilarityGroup) => centroid(getGroupVectors(group))

export const isSameColumn = (a: string | null, b: string | null) => a !== null && a === b

/** Similarity of 2 group-level vectors, nudged up when both groups live in the same column */
export const scoreGroupPair = (
  aVector: readonly number[],
  aPromptId: string | null,
  bVector: readonly number[],
  bPromptId: string | null
) =>
  cosineSimilarity(aVector, bVector) + (isSameColumn(aPromptId, bPromptId) ? SAME_COLUMN_BONUS : 0)
