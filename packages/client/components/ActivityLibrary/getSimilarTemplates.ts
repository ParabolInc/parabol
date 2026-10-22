export const getSimilarTemplates = <T extends {id: string}>(
  searchResults: readonly T[],
  keywordMatches: readonly T[]
) => {
  const keywordMatchIds = new Set(keywordMatches.map(({id}) => id))
  return searchResults.filter(({id}) => !keywordMatchIds.has(id))
}
