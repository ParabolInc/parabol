import type {GraphQLResolveInfo} from 'graphql'
import LinearServerManager from '../../../../integrations/linear/LinearServerManager'
import {Logger} from '../../../../utils/Logger'
import type {GQLContext} from '../../../graphql'
import {type InspirationIssue, MAX_ISSUE_COMMENTS, MAX_ISSUES} from './issuesForAI'

// Re-runs the Linear search the user saw in the Your Work drawer, server-side, fetching the full
// description + recent comments for each issue so the AI has enough context to draft a response.
// The client serializes its IssueFilter as JSON into searchQuery; we parse it back and re-run the
// same query. Returns the normalized issues, or [] if there's nothing.
const fetchLinearIssues = async (
  teamId: string,
  userId: string,
  searchQuery: string,
  context: GQLContext,
  info: GraphQLResolveInfo
): Promise<InspirationIssue[]> => {
  const {dataLoader} = context
  const auth = await dataLoader.get('freshAuth').load({service: 'linear', teamId, userId})
  if (!auth?.accessToken) return []

  let filter: Record<string, unknown> | undefined
  try {
    filter = searchQuery ? JSON.parse(searchQuery) : undefined
  } catch {
    Logger.error('fetchLinearIssues: could not parse searchQuery as a Linear filter')
    return []
  }

  const manager = new LinearServerManager(auth, context, info)
  const [data, error] = await manager.getIssues({
    filter,
    first: MAX_ISSUES,
    commentLast: MAX_ISSUE_COMMENTS
  })
  if (error) {
    Logger.error(error.message)
    return []
  }

  const nodes = data?.issues.nodes ?? []
  const items = nodes.map((issue): InspirationIssue => {
    // completed / canceled workflow states are terminal; everything else is still in progress.
    const stateType = issue.state?.type
    const status =
      stateType === 'completed' ? 'complete' : stateType === 'canceled' ? 'canceled' : 'in progress'
    const subtitle =
      [issue.team?.displayName, issue.project?.name].filter(Boolean).join(' / ') || undefined
    const comments = (issue.comments.nodes ?? []).map((comment) => ({
      author: comment.user?.displayName ?? 'unknown',
      body: comment.body ?? ''
    }))
    return {
      kind: 'Issue',
      title: issue.title,
      reference: issue.identifier,
      subtitle,
      status,
      url: issue.url,
      updatedAt: new Date(issue.updatedAt),
      description: issue.description,
      comments
    }
  })

  return items
}

export default fetchLinearIssues
