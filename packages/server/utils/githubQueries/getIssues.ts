import gql from 'graphql-tag'
import {print} from 'graphql/language/printer'

export const getIssuesQuery = gql`
  query getIssues {
    viewer {
      issues(first: 10) {
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
