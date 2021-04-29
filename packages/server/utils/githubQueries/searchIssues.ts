import {gql} from '../getGQLInputStr'

export const searchIssues = gql`
  query searchIssues($queryString: String!, $first: Int!, $after: String) {
    search(query: $queryString, type: ISSUE, first: $first, after: $after) {
      edges {
        cursor
        node {
          ...getIssuesNode
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

  fragment getIssuesNode on Issue {
    id
    title
    url
    repository {
      nameWithOwner
    }
  }
`
