interface RelayEdge {
  readonly node: Record<string, unknown> | null | undefined
}

const getUniqueEdges = <T extends RelayEdge, U>(
  edges: readonly T[],
  getValue: (edge: T) => U
): T[] => {
  const uniqueEdges: T[] = []
  const seenValues = new Set<U>()

  for (const edge of edges) {
    const value = getValue(edge)
    if (!seenValues.has(value)) {
      seenValues.add(value)
      uniqueEdges.push(edge)
    }
  }

  return uniqueEdges
}

export default getUniqueEdges
