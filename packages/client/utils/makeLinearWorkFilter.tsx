import type {_xLinearIssueFilter} from '../__generated__/LinearScopingSearchResultsQuery.graphql'
import type {WorkDrawerDateRange} from '../components/TeamPrompt/WorkDrawer/WorkDrawerDateFilter'
import {makeLinearIssueFilter} from './makeLinearIssueFilter'

// Builds the Linear issue filter for the Your Work drawer: issues the viewer is involved in,
// optionally narrowed to selected teams/projects and a date range. The same filter is serialized
// (JSON) and sent to the server so it can re-run the exact search when drafting an AI response.
// `isMe` resolves to the authenticated Linear user server-side, so no viewer id is needed.
export const makeLinearWorkFilter = (
  selectedLinearIds: string[],
  dateRange: WorkDrawerDateRange | undefined
): _xLinearIssueFilter => {
  const involvesLinearViewerConds: _xLinearIssueFilter[] = [
    {assignee: {isMe: {eq: true}}},
    {comments: {some: {user: {isMe: {eq: true}}}}},
    {creator: {isMe: {eq: true}}},
    {subscribers: {isMe: {eq: true}}}
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
