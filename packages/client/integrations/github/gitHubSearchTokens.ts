import {searchFiltersByKey} from '../../shared/integrations/IntegrationSearchFilter'
import getReposFromQueryStr from '../../utils/getReposFromQueryStr'
import type {ScopingSearchState} from '../platform/ScopingSearchState'

/** GitHub takes no filter arguments: a repo filter is a `repo:owner/name` token in the query the
 * vendor receives. Searches saved before repo filters carry those tokens inline, so a token already
 * in the query string is never appended twice. */
const toGitHubQueryString = (state: ScopingSearchState) => {
  const queryString = state.queryString.trim()
  const present = new Set(getReposFromQueryStr(queryString))
  const tokens: string[] = []
  searchFiltersByKey(state.filters, 'repo').forEach((repo) => {
    if (present.has(repo)) return
    present.add(repo)
    tokens.push(`repo:${repo}`)
  })
  return [queryString, ...tokens].filter(Boolean).join(' ')
}

export default toGitHubQueryString
