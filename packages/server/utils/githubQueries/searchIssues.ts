import gql from 'graphql-tag'
import {print} from 'graphql/language/printer'

export const searchIssuesQuery = gql`
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
    id
    title
    url
    repository {
      nameWithOwner
    }
  }
`

export const searchIssues = print(searchIssuesQuery)
