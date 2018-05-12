/*
 * Updates the location of the reflection based on its new group
 * NOTE: this could be problematic if a heavy amount of sorting was done prior to calling this function
 */
const sortGroupedReflections = (groupedReflections, retroPhaseItemIdMode, reflectionGroupId) => {
  // for every group, grab the card with the minimum sortOrder that belongs to the same phaseItemId as the group
  const firstReflection = groupedReflections
    .slice()
    .filter((reflection) => reflection.retroPhaseItemId === retroPhaseItemIdMode)
    .sort((a, b) => (a.sortOrder < b.sortOrder ? -1 : 1))[0]

  // increment all other cards by 0.01 (with a 5 card max, we won't bump against the next card unless they have sorted in that spot 5 times)
  return groupedReflections.map((reflection, idx) => ({
    ...reflection,
    sortOrder: firstReflection.sortOrder + idx * 0.01,
    reflectionGroupId
  }))
}

export default sortGroupedReflections
