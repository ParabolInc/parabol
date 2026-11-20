import type {SearchIssuesQuery} from '../../types/githubTypes'
import searchIssues from '../../utils/githubQueries/searchIssues.graphql'
import {Logger} from '../../utils/Logger'
import {
  type InspirationIssue,
  type IssuePage,
  MAX_ISSUE_COMMENTS
} from '../platform/InspirationIssue'
import type {GqlIntegrationCtx} from '../platform/ServerIntegrationDefinition'
import getGitHubRequest from './getGitHubRequest'

const UPDATED_RANGE = /\bupdated:(\S+?)\.\.\S+/

// GitHub searches dates to the second, so the bound rounds up; the newer page already showed what is dated `before`
const narrowToBefore = (searchQuery: string, before: Date | null) => {
  if (!before) return searchQuery
  const end = new Date(Math.ceil(before.getTime() / 1000) * 1000)
    .toISOString()
    .replace('.000Z', '+00:00')
  return UPDATED_RANGE.test(searchQuery)
    ? searchQuery.replace(UPDATED_RANGE, (_match, from: string) => `updated:${from}..${end}`)
    : `${searchQuery} updated:<=${end}`
}

// Re-runs the GitHub search the user saw in the Your Work drawer, server-side, but fetches the
// full body + discussion thread for each item so the AI has enough context to draft a response.
// Returns the normalized issues, or [] if there's nothing to send.
const listGitHubIssues = async (
  ctx: GqlIntegrationCtx,
  searchQuery: string,
  {before, first}: IssuePage
): Promise<InspirationIssue[]> => {
  const {dataLoader, context, info, teamId, userId} = ctx
  const auth = await dataLoader.get('githubAuth').load({teamId, userId})
  if (!auth) return []
  const {accessToken} = auth
  const githubRequest = getGitHubRequest(info, context, {accessToken})
  const [data, error] = await githubRequest<SearchIssuesQuery>(searchIssues, {
    searchQuery: narrowToBefore(searchQuery, before),
    first,
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
    const facts =
      node.__typename === '_xGitHubPullRequest'
        ? {
            isClosed: node.prState !== 'OPEN',
            commentCount: node.comments.totalCount + (node.reviews?.totalCount ?? 0),
            changeSize: node.additions + node.deletions
          }
        : {isClosed: node.issueState !== 'OPEN', commentCount: node.comments.totalCount}
    return [
      {
        kind,
        title: node.title,
        reference: `${node.repository.nameWithOwner}#${node.number}`,
        status,
        url: node.url,
        updatedAt: new Date(node.updatedAt),
        description: node.body,
        comments,
        isOwnWork: node.viewerDidAuthor,
        ...facts
      }
    ]
  })
  return items
}

export default listGitHubIssues
