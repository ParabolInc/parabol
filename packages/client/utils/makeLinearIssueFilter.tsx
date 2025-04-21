import {_xLinearIssueFilter} from '../__generated__/LinearScopingSearchResultsQuery.graphql'

export const makeLinearIssueFilter = (
  queryString: string,
  selectedProjectsIds: readonly string[] | null | undefined
): _xLinearIssueFilter | null => {
  const normalizedQueryString = queryString.trim()
  const finalFilters = []
  if (queryString.length) {
    finalFilters.push({
      or: [
        {description: {containsIgnoreCaseAndAccent: normalizedQueryString}},
        {title: {containsIgnoreCaseAndAccent: normalizedQueryString}}
      ]
    })
  }
  if (selectedProjectsIds?.length) {
    const teamAndProjectFilters: _xLinearIssueFilter[] = []
    selectedProjectsIds.map((selectedTypeAndId) => {
      const [typeName, id] = selectedTypeAndId.split(':') as [string?, string?]
      if (id && typeName === '_xLinearProject') {
        teamAndProjectFilters.push({project: {id: {eq: id}}})
      }
      if (id && typeName === '_xLinearTeam') {
        teamAndProjectFilters.push({team: {id: {eq: id}}})
      }
    })
    finalFilters.push({or: teamAndProjectFilters})
  }
  if (finalFilters.length) {
    return {and: finalFilters}
  }
  return null
}
