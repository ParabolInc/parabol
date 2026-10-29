export const getSelectedIndex = (
  nodeIds: readonly (string | null | undefined)[],
  selectedId: string | null
) => {
  if (selectedId === null || nodeIds.length === 0) return -1
  const index = nodeIds.indexOf(selectedId)
  return index === -1 ? 0 : index
}
