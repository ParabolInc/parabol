import type {GraphQLResolveInfo} from 'graphql'
import type {SearchWorkItemsQuery} from '../../../../types/githubTypes'
import getGitHubRequest from '../../../../utils/getGitHubRequest'
import searchWorkItems from '../../../../utils/githubQueries/searchWorkItems.graphql'
import {Logger} from '../../../../utils/Logger'
import type {DataLoaderWorker, GQLContext} from '../../../graphql'

const MAX_ITEMS = 20
// Fetch the most recent comments rather than the first: on long threads the latest
// discussion carries the current state, which is what the AI needs to draft a response.
const MAX_COMMENTS = 10
const MAX_BODY_LEN = 1500
const MAX_COMMENT_LEN = 500

const truncate = (text: string, max: number) =>
  text.length > max ? `${text.slice(0, max)}…` : text

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
    first: MAX_ITEMS,
    commentLast: MAX_COMMENTS
  })
  if (error) {
    Logger.error(error.message)
    return ''
  }
  const nodes = data.search.nodes ?? []
  const blocks = nodes.flatMap((node) => {
    if (!node || (node.__typename !== '_xGitHubIssue' && node.__typename !== '_xGitHubPullRequest'))
      return []
    const kind = node.__typename === '_xGitHubIssue' ? 'Issue' : 'Pull Request'
    // OPEN -> ongoing, CLOSED/MERGED -> complete. The AI uses this to pick verb tense.
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
    const repo = node.repository.nameWithOwner
    const thread = (node.comments.nodes ?? [])
      .flatMap((comment) =>
        comment?.body?.trim()
          ? [
              `  - ${comment.author?.login ?? 'unknown'}: ${truncate(comment.body.trim(), MAX_COMMENT_LEN)}`
            ]
          : []
      )
      .join('\n')
    const body = node.body?.trim() ? truncate(node.body.trim(), MAX_BODY_LEN) : '(no description)'
    return [
      `### ${kind}: ${node.title} (${repo})\nStatus: ${status}\n${node.url}\n${body}${
        thread ? `\nThread:\n${thread}` : ''
      }`
    ]
  })
  return blocks.join('\n\n')
}

export default fetchGitHubWorkItems
