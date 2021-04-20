// import {GetIssuesNodeFragment} from '../../../types/typed-document-nodes'

// interface GitHubConnIssue extends GetIssuesNodeFragment {
//   updatedAt: Date
// }

const connectionFromGitHubIssues = <T extends {updatedAt: Date} = any>(
  issues: T[],
  first = 10,
  error?: {message: string}
) => {
  const nodes = issues.slice(0, first)
  const edges = nodes.map((node) => ({
    cursor: node.updatedAt,
    node
  }))
  const firstEdge = edges[0]
  return {
    error,
    edges,
    pageInfo: {
      startCursor: firstEdge && firstEdge.cursor,
      endCursor: firstEdge ? edges[edges.length - 1].cursor : new Date(),
      hasNextPage: issues.length > nodes.length
    }
  }
}

export default connectionFromGitHubIssues
