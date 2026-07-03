import type {GraphQLResolveInfo} from 'graphql'
import type {SearchWorkItemsQuery} from '../../../../types/githubTypes'
import getGitHubRequest from '../../../../utils/getGitHubRequest'
import searchWorkItems from '../../../../utils/githubQueries/searchWorkItems.graphql'
import {Logger} from '../../../../utils/Logger'
import type {DataLoaderWorker, GQLContext} from '../../../graphql'
import {
  formatWorkItemsForAI,
  MAX_WORK_ITEM_COMMENTS,
  MAX_WORK_ITEMS,
  type WorkItem
} from './workItemsForAI'

// Re-runs the GitHub search the user saw in the Your Work drawer, server-side, but fetches the
// full body + discussion thread for each item so the AI has enough context to draft a response.
// Returns a compact text blob suitable for an LLM prompt, or '' if there's nothing to send.
const fetchGitHubWorkItems = async (
  teamId: string,
  userId: string,
  searchQuery: string,
  dataLoader: DataLoaderWorker,
  context: GQLContext,
  info: GraphQLResolveInfo
): Promise<string> => {
  const auth = await dataLoader.get('githubAuth').load({teamId, userId})
  if (!auth) return ''
  const {accessToken} = auth
  const githubRequest = getGitHubRequest(info, context, {accessToken})
  const [data, error] = await githubRequest<SearchWorkItemsQuery>(searchWorkItems, {
    searchQuery,
    first: MAX_WORK_ITEMS,
    commentLast: MAX_WORK_ITEM_COMMENTS
  })
  if (error) {
    Logger.error(error.message)
    return ''
  }
  const nodes = data.search.nodes ?? []
  const items = nodes.flatMap((node): WorkItem[] => {
    if (!node || (node.__typename !== '_xGitHubIssue' && node.__typename !== '_xGitHubPullRequest'))
      return []
    const kind = node.__typename === '_xGitHubIssue' ? 'Issue' : 'Pull Request'
    // OPEN -> ongoing, CLOSED/MERGED -> complete.
    const status =
      node.__typename === '_xGitHubIssue'
        ? node.issueState === 'OPEN'
          ? 'open (in progress)'
          : 'closed (complete)'
        : node.prState === 'OPEN'
          ? 'open (in progress)'
          : node.prState === 'MERGED'
            ? 'merged (complete)'
            : 'closed without merging (complete)'
    const comments = (node.comments.nodes ?? []).map((comment) => ({
      author: comment?.author?.login ?? 'unknown',
      body: comment?.body ?? ''
    }))
    return [
      {
        kind,
        title: node.title,
        reference: node.repository.nameWithOwner,
        status,
        url: node.url,
        description: node.body,
        comments
      }
    ]
  })
  return formatWorkItemsForAI(items)
}

export default fetchGitHubWorkItems
