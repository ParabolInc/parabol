type Placement = {
  suggestedGroupKey: string
  finalGroupKey: string
}

/**
 * How many cards a team had to move to turn the suggested grouping into the one it kept.
 * Pairs each final group with at most one suggested group, largest overlaps first, and counts every
 * card outside its group's pair. Greedy pairing can overcount by a card in rare ties.
 */
const countMovedReflections = (placements: Placement[]) => {
  const overlaps = new Map<string, Placement & {count: number}>()
  for (const placement of placements) {
    const key = JSON.stringify([placement.suggestedGroupKey, placement.finalGroupKey])
    const overlap = overlaps.get(key)
    if (overlap) overlap.count++
    else overlaps.set(key, {...placement, count: 1})
  }
  const pairedSuggested = new Set<string>()
  const pairedFinal = new Set<string>()
  let keptCount = 0
  for (const {suggestedGroupKey, finalGroupKey, count} of [...overlaps.values()].sort(
    (a, b) => b.count - a.count
  )) {
    if (pairedSuggested.has(suggestedGroupKey) || pairedFinal.has(finalGroupKey)) continue
    pairedSuggested.add(suggestedGroupKey)
    pairedFinal.add(finalGroupKey)
    keptCount += count
  }
  return placements.length - keptCount
}

export default countMovedReflections
