import {gql} from '../getGQLInputStr'

export const searchIssues = gql`
  query searchIssues($queryString: String!, $first: Int) {
    search(query: $queryString, type: ISSUE, first: $first) {
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
    __typename
    id
    title
    url
    repository {
      nameWithOwner
    }
  }
`
