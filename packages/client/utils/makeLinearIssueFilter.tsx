import type {_xLinearIssueFilter} from '../__generated__/LinearScopingSearchResultsQuery.graphql'

const parseLinearIdentifier = (query: string): {teamKey?: string; issueNumber: number} | null => {
  const fullMatch = query.match(/^([A-Za-z]+)[\s-](\d+)$/)
  if (fullMatch) {
    const issueNumber = parseInt(fullMatch[2]!, 10)
    if (issueNumber > 0) {
      return {teamKey: fullMatch[1]!.toUpperCase(), issueNumber}
    }
    return null
  }
  if (/^\d+$/.test(query)) {
    const issueNumber = parseInt(query, 10)
    if (issueNumber > 0) {
      return {issueNumber}
    }
  }
  return null
}

export const makeLinearIssueFilter = (
  queryString: string,
  selectedProjectsIds: readonly string[] | null | undefined
): _xLinearIssueFilter | null => {
  const normalizedQueryString = queryString.trim()
  const finalFilters: _xLinearIssueFilter[] = []
  if (queryString.length) {
    const textFilters: _xLinearIssueFilter[] = [
      {description: {containsIgnoreCaseAndAccent: normalizedQueryString}},
      {title: {containsIgnoreCaseAndAccent: normalizedQueryString}}
    ]
    const parsed = parseLinearIdentifier(normalizedQueryString)
    if (parsed) {
      if (parsed.teamKey) {
        textFilters.push({
          and: [{team: {key: {eqIgnoreCase: parsed.teamKey}}}, {number: {eq: parsed.issueNumber}}]
        })
      } else {
        textFilters.push({number: {eq: parsed.issueNumber}})
      }
    }
    finalFilters.push({or: textFilters})
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
