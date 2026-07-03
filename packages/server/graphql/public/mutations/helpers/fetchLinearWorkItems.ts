import type {GraphQLResolveInfo} from 'graphql'
import LinearServerManager from '../../../../integrations/linear/LinearServerManager'
import {Logger} from '../../../../utils/Logger'
import type {GQLContext} from '../../../graphql'
import {
  formatWorkItemsForAI,
  MAX_WORK_ITEM_COMMENTS,
  MAX_WORK_ITEMS,
  type WorkItem
} from './workItemsForAI'

// Re-runs the Linear search the user saw in the Your Work drawer, server-side, fetching the full
// description + recent comments for each issue so the AI has enough context to draft a response.
// The client serializes its IssueFilter as JSON into searchQuery; we parse it back and re-run the
// same query. Returns a compact text blob suitable for an LLM prompt, or '' if there's nothing.
const fetchLinearWorkItems = async (
  teamId: string,
  userId: string,
  searchQuery: string,
  context: GQLContext,
  info: GraphQLResolveInfo
): Promise<string> => {
  const {dataLoader} = context
  const auth = await dataLoader.get('freshLinearAuth').load({teamId, userId})
  if (!auth?.accessToken) return ''

  let filter: Record<string, unknown> | undefined
  try {
    filter = searchQuery ? JSON.parse(searchQuery) : undefined
  } catch {
    Logger.error('fetchLinearWorkItems: could not parse searchQuery as a Linear filter')
    return ''
  }

  const manager = new LinearServerManager(auth, context, info)
  const [data, error] = await manager.getWorkItems({
    filter,
    first: MAX_WORK_ITEMS,
    commentLast: MAX_WORK_ITEM_COMMENTS
  })
  if (error) {
    Logger.error(error.message)
    return ''
  }

  const nodes = data?.issues.nodes ?? []
  const items = nodes.map((issue): WorkItem => {
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
      description: issue.description,
      comments
    }
  })

  return formatWorkItemsForAI(items)
}

export default fetchLinearWorkItems
