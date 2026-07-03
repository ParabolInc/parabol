import type {_xLinearIssueFilter} from '../__generated__/LinearScopingSearchResultsQuery.graphql'
import type {WorkDrawerDateRange} from '../components/TeamPrompt/WorkDrawer/WorkDrawerDateFilter'
import {makeLinearIssueFilter} from './makeLinearIssueFilter'

// Builds the Linear issue filter for the Your Work drawer: issues the viewer is involved in,
// optionally narrowed to selected teams/projects and a date range. The same filter is serialized
// (JSON) and sent to the server so it can re-run the exact search when drafting an AI response.
export const makeLinearWorkFilter = (
  linearViewerId: string,
  selectedLinearIds: string[],
  dateRange: WorkDrawerDateRange | undefined
): _xLinearIssueFilter => {
  const involvesLinearViewerConds: _xLinearIssueFilter[] = [
    {assignee: {id: {eq: linearViewerId}}},
    {
      comments: {
        some: {
          user: {id: {eq: linearViewerId}},
          reactions: {some: {id: {eq: linearViewerId}}}
        }
      }
    },
    {creator: {id: {eq: linearViewerId}}},
    {reactions: {some: {id: {eq: linearViewerId}}}},
    {subscribers: {id: {eq: linearViewerId}}}
  ]
  const and: _xLinearIssueFilter[] = [{or: involvesLinearViewerConds}]
  const projectsAndTeamsFilter = makeLinearIssueFilter('', selectedLinearIds)
  if (projectsAndTeamsFilter) {
    and.push(projectsAndTeamsFilter)
  }
  if (dateRange) {
    and.push({updatedAt: {gte: dateRange.startAt, lte: dateRange.endAt}})
  }
  return {and}
}
