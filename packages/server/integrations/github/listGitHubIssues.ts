import type {SearchIssuesQuery} from '../../types/githubTypes'
import getGitHubRequest from '../../utils/getGitHubRequest'
import searchIssues from '../../utils/githubQueries/searchIssues.graphql'
import {Logger} from '../../utils/Logger'
import {type InspirationIssue, MAX_ISSUE_COMMENTS, MAX_ISSUES} from '../platform/InspirationIssue'
import type {GqlIntegrationCtx} from '../platform/ServerIntegrationDefinition'

// Re-runs the GitHub search the user saw in the Your Work drawer, server-side, but fetches the
// full body + discussion thread for each item so the AI has enough context to draft a response.
// Returns the normalized issues, or [] if there's nothing to send.
const listGitHubIssues = async (
  ctx: GqlIntegrationCtx,
  searchQuery: string
): Promise<InspirationIssue[]> => {
  const {dataLoader, context, info, teamId, userId} = ctx
  const auth = await dataLoader.get('githubAuth').load({teamId, userId})
  if (!auth) return []
  const {accessToken} = auth
  const githubRequest = getGitHubRequest(info, context, {accessToken})
  const [data, error] = await githubRequest<SearchIssuesQuery>(searchIssues, {
    searchQuery,
    first: MAX_ISSUES,
    commentLast: MAX_ISSUE_COMMENTS
  })
  if (error) {
    Logger.error(error.message)
    return []
  }
  const nodes = data.search.nodes ?? []
  const items = nodes.flatMap((node): InspirationIssue[] => {
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
        updatedAt: new Date(node.updatedAt),
        description: node.body,
        comments
      }
    ]
  })
  return items
}

export default listGitHubIssues
