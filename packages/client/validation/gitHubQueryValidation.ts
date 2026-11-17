export const GITHUB_MAX_SEARCH_QUERY_LENGTH = 256

export const gitHubQueryValidation = (query: string) => {
  const lowerCaseQuery = query.toLowerCase()
  if (lowerCaseQuery.includes('is:user'))
    return `You're searching for users in the issues filter! Try removing is:user.`
  if (lowerCaseQuery.includes('is:repository'))
    return `You're searching for repositories in the issues filter! Try removing is:repository.`
  if (query.length > GITHUB_MAX_SEARCH_QUERY_LENGTH)
    return `GitHub limits searches to ${GITHUB_MAX_SEARCH_QUERY_LENGTH} characters. Try a shorter query.`
  return null
}
