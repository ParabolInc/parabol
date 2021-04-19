import gql from 'graphql-tag'
import {print} from 'graphql/language/printer'

export const searchIssuesQuery = gql`
  query searchIssues($queryString: String!) {
    search(query: $queryString, type: ISSUE, first: 10) {
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
