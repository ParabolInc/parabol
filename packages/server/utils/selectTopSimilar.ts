export const selectTopSimilar = <T extends {similarity: number}>(
  rows: readonly T[],
  {limit, maxGapFromBest}: {limit: number; maxGapFromBest: number}
) => {
  const best = rows[0]
  if (!best) return []
  const floor = best.similarity - maxGapFromBest
  return rows.filter(({similarity}) => similarity >= floor).slice(0, limit)
}
