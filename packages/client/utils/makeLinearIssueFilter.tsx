import type {_xLinearIssueFilter} from '../__generated__/LinearScopingResultsAdapterQuery.graphql'
import {
  type IntegrationSearchFilter,
  searchFiltersByKey
} from '../integrations/platform/IntegrationSearchFilter'

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
  filters: readonly IntegrationSearchFilter[]
): _xLinearIssueFilter | null => {
  const normalizedQueryString = queryString.trim()
  const finalFilters: _xLinearIssueFilter[] = []
  if (normalizedQueryString.length) {
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
  const projectIds = searchFiltersByKey(filters, 'project')
  const teamIds = searchFiltersByKey(filters, 'team')
  if (projectIds.length || teamIds.length) {
    finalFilters.push({
      or: [
        ...projectIds.map((id) => ({project: {id: {eq: id}}})),
        ...teamIds.map((id) => ({team: {id: {eq: id}}}))
      ]
    })
  }
  if (finalFilters.length) {
    return {and: finalFilters}
  }
  return null
}
