import {gql} from '../getGQLInputStr'

export const searchIssues = gql`
  query searchIssues($queryString: String!, $first: Int!, $after: String) {
    search(query: $queryString, type: ISSUE, first: $first, after: $after) {
      edges {
        cursor
        node {
          ...issue
          ...pullRequest
        }
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
      }
      issueCount
    }
  }

  fragment issue on Issue {
    id
    title
    url
    repository {
      nameWithOwner
    }
  }

  fragment pullRequest on PullRequest {
    id
    title
    url
    repository {
      nameWithOwner
    }
  }
`
