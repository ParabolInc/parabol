export const gitHubQueryValidation = (query: string) => {
  const lowerCaseQuery = query.toLowerCase()
  if (lowerCaseQuery.includes('is:user'))
    return `You're searching for users in the issues filter! Try removing is:user.`
  if (lowerCaseQuery.includes('is:repository'))
    return `You're searching for repositories in the issues filter! Try removing is:repository.`
  return null
}
