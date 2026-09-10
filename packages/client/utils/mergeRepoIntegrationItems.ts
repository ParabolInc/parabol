import interleave from './interleave'

const mergeRepoIntegrationItems = <T extends {service: string; integrationRepoId: string}>(
  prevUsed: readonly T[],
  lists: (readonly T[])[]
) => {
  const seen = new Set<string>()
  return [...prevUsed, ...interleave(lists)].filter((item) => {
    const key = `${item.service}:${item.integrationRepoId}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export default mergeRepoIntegrationItems
