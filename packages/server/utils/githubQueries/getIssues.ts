import {gql} from '../getGQLInputStr'

export const getIssues = gql`
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
    __typename
    id
    title
    url
    repository {
      nameWithOwner
    }
  }
`
