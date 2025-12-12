export function calculateRRF(
  rankings: Array<Map<string, number>>, // Array of maps where key=docId, value=rank (1-based)
  k = 60,
  weights?: number[]
): Map<string, number> {
  const scores = new Map<string, number>()

  rankings.forEach((ranking, i) => {
    const weight = weights && weights[i] !== undefined ? weights[i] : 1.0

    for (const [docId, rank] of ranking) {
      if (!scores.has(docId)) {
        scores.set(docId, 0)
      }
      scores.set(docId, scores.get(docId)! + weight * (1 / (k + rank)))
    }
  })

  return scores
}
