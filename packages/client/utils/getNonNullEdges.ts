interface RelayEdge {
  node: Record<string, unknown> | null | undefined
}

const getNonNullEdges = <T extends RelayEdge | null | undefined>(edges: readonly T[]) => {
  const goodEdges = edges.filter((edge) => edge?.node)
  return goodEdges as (NonNullable<T> & {node: NonNullable<NonNullable<T>['node']>})[]
}

export default getNonNullEdges
