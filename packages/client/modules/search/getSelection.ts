export const getSelection = (
  nodeIds: readonly (string | null | undefined)[],
  selectedId: string | null
) => {
  if (selectedId === null || nodeIds.length === 0) return {index: -1, id: selectedId}
  const index = nodeIds.indexOf(selectedId)
  if (index !== -1) return {index, id: selectedId}
  return {index: 0, id: nodeIds[0] ?? null}
}
