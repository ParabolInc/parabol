// Base interface for what we need to re-rank
export interface ReRankableCandidate {
  id: string
  title?: string
  score: {relevance: number} // RRF or other score
  updatedAt?: Date
  userId?: string | null
}

interface ReRankOptions {
  query: string
  currentUserId?: string
}

export function applyBusinessRules<T extends ReRankableCandidate>(
  candidates: T[],
  options: ReRankOptions
): T[] {
  const {query, currentUserId} = options
  const lowerQuery = query.toLowerCase().trim()

  return candidates
    .map((candidate) => {
      let boost = 1.0

      // Rule 1: Exact title match (huge boost)
      if (candidate.title?.toLowerCase().trim() === lowerQuery) {
        boost += 2.0
      } else if (candidate.title?.toLowerCase().includes(lowerQuery)) {
        // Partial title match
        boost += 0.5
      }

      // Rule 2: User's own content (slight boost)
      if (currentUserId && candidate.userId === currentUserId) {
        boost += 0.2
      }

      // Rule 3: Recency (doc updated in the last 30 days)
      if (candidate.updatedAt) {
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        if (candidate.updatedAt > thirtyDaysAgo) {
          boost += 0.1
        }
      }

      return {
        ...candidate,
        score: {
          ...candidate.score,
          relevance: Math.min(candidate.score.relevance * boost, 1.0)
        }
      }
    })
    .sort((a, b) => b.score.relevance - a.score.relevance)
}
