import {ConnectionHandler, type ReadOnlyRecordProxy} from 'relay-runtime'
import type {_xLinearIssueFilter} from '../../__generated__/LinearScopingSearchResultsQuery.graphql'

const getLinearProjectsIssuesConn = (
  queryRecord: ReadOnlyRecordProxy | null | undefined,
  projectsIssuesArgs: {filter: _xLinearIssueFilter | null}
) => {
  if (!queryRecord) return null
  return ConnectionHandler.getConnection(
    queryRecord,
    'LinearScopingSearchResults_issues',
    projectsIssuesArgs
  )
}

export default getLinearProjectsIssuesConn
