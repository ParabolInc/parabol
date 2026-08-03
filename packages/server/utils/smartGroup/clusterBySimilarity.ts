import {
  centroid,
  getGroupVectors,
  type SimilarityGroup,
  type SimilarityOptions,
  scoreGroupPair,
  sizeAdjustedThreshold
} from './similarityMath'

export type SimilarityCluster = {
  /** The source groups that merged, lexicographically by id. Always 2 or more */
  readonly groupIds: readonly string[]
  /** Every reflection in the merged groups, including any that were never embedded */
  readonly reflectionIds: readonly string[]
}

type Cluster = {
  groupIds: string[]
  reflectionIds: string[]
  vectors: (readonly number[])[]
  vector: readonly number[]
  /** The shared reflect prompt, or null once the cluster spans columns */
  promptId: string | null
  size: number
  isActive: boolean
}

/**
 * Partitions groups into clusters of cards that say nearly the same thing.
 * Repeatedly merges the single closest mergeable pair, recomputing the merged centroid each time,
 * until no pair clears its size-adjusted threshold. Singletons are omitted — they need no move.
 *
 * Deterministic: clusters are seeded in lexicographic id order and ties resolve to the
 * lowest-ordered pair, so every caller derives the same result from the same board.
 */
const clusterBySimilarity = (
  groups: readonly SimilarityGroup[],
  options: SimilarityOptions = {}
): SimilarityCluster[] => {
  const {sameColumnOnly} = options
  const clusters = [...groups]
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
    .flatMap<Cluster>((group) => {
      const vectors = getGroupVectors(group)
      const vector = centroid(vectors)
      if (!vector) return []
      return [
        {
          groupIds: [group.id],
          reflectionIds: group.reflections.map(({id}) => id),
          vectors,
          vector,
          promptId: group.promptId,
          size: group.reflections.length,
          isActive: true
        }
      ]
    })

  const n = clusters.length
  const canMerge = (a: Cluster, b: Cluster) =>
    !sameColumnOnly || (a.promptId !== null && a.promptId === b.promptId)
  const pairScore = (a: Cluster, b: Cluster) =>
    canMerge(a, b)
      ? scoreGroupPair(a.vector, a.promptId, b.vector, b.promptId)
      : Number.NEGATIVE_INFINITY

  // Upper-triangular score cache, so each merge only re-scores the row it touched
  const scores = Array.from({length: n}, () => new Array<number>(n).fill(Number.NEGATIVE_INFINITY))
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      scores[i]![j] = pairScore(clusters[i]!, clusters[j]!)
    }
  }

  while (true) {
    let bestI = -1
    let bestJ = -1
    let bestScore = Number.NEGATIVE_INFINITY
    for (let i = 0; i < n; i++) {
      const a = clusters[i]!
      if (!a.isActive) continue
      for (let j = i + 1; j < n; j++) {
        const b = clusters[j]!
        if (!b.isActive) continue
        const score = scores[i]![j]!
        // Strict > keeps the lowest-ordered pair on a tie, which is what makes this deterministic
        if (score <= bestScore) continue
        if (score < sizeAdjustedThreshold(a.size + b.size)) continue
        bestScore = score
        bestI = i
        bestJ = j
      }
    }
    if (bestI === -1) break

    const target = clusters[bestI]!
    const merged = clusters[bestJ]!
    target.groupIds = [...target.groupIds, ...merged.groupIds]
    target.reflectionIds = [...target.reflectionIds, ...merged.reflectionIds]
    target.vectors = [...target.vectors, ...merged.vectors]
    // Both clusters had at least one vector, so the merged centroid is never null
    target.vector = centroid(target.vectors)!
    target.promptId = target.promptId === merged.promptId ? target.promptId : null
    target.size += merged.size
    merged.isActive = false

    for (let j = 0; j < n; j++) {
      if (j === bestI || !clusters[j]!.isActive) continue
      const lo = Math.min(bestI, j)
      const hi = Math.max(bestI, j)
      scores[lo]![hi] = pairScore(clusters[lo]!, clusters[hi]!)
    }
  }

  return clusters
    .filter((cluster) => cluster.isActive && cluster.groupIds.length > 1)
    .map(({groupIds, reflectionIds}) => ({groupIds, reflectionIds}))
}

export default clusterBySimilarity
