export const getBlockSelectionAnnouncement = (prevCount: number, nextCount: number) => {
  if (nextCount === prevCount) return null
  if (nextCount === 0) return 'Selection cleared'
  return nextCount === 1 ? '1 block selected' : `${nextCount} blocks selected`
}
