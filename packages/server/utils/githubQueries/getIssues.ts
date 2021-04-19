import gql from 'graphql-tag'
import {print} from 'graphql/language/printer'

export const getIssuesQuery = gql`
  query getIssues($first: Int) {
    viewer {
      issues(first: $first) {
        edges {
          node {
            ...getIssuesNode
          }
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

export const getIssues = print(getIssuesQuery)
