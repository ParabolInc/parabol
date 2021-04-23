import {gql} from '../getGQLInputStr'

export const searchIssues = gql`
  query searchIssues($queryString: String!, $first: Int) {
    search(query: $queryString, type: ISSUE, first: $first) {
      edges {
        node {
          ...getIssuesNode
        }
      }
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
