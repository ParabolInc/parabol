import type {GraphQLResolveInfo} from 'graphql'
import type {SearchIssuesQuery} from '../../../../types/githubTypes'
import getGitHubRequest from '../../../../utils/getGitHubRequest'
import searchIssues from '../../../../utils/githubQueries/searchIssues.graphql'
import {Logger} from '../../../../utils/Logger'
import type {DataLoaderWorker, GQLContext} from '../../../graphql'
import {type InspirationIssue, MAX_ISSUE_COMMENTS, MAX_ISSUES} from './issuesForAI'

// Re-runs the GitHub search the user saw in the Your Work drawer, server-side, but fetches the
// full body + discussion thread for each item so the AI has enough context to draft a response.
// Returns the normalized issues, or [] if there's nothing to send.
const fetchGitHubIssues = async (
  teamId: string,
  userId: string,
  searchQuery: string,
  dataLoader: DataLoaderWorker,
  context: GQLContext,
  info: GraphQLResolveInfo
): Promise<InspirationIssue[]> => {
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

export default fetchGitHubIssues
