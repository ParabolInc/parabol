import gql from 'graphql-tag'
import {print} from 'graphql/language/printer'

export const getRepositoriesQuery = gql`
  query getRepositories {
    viewer {
      organizations() {
        nodes {
          repositories(isLocked: false, orderBy: {field: UPDATED_AT, direction: DESC}) {
            ...repoFrag
            nameWithOwner
            viewerCanAdminister
          }
        }
      }
      repositories(isLocked: false, orderBy: {field: UPDATED_AT, direction: DESC}) {
        ...repoFrag
      }
    }
  }

  fragment repoFrag on RepositoryConnection {
    nodes {
      nameWithOwner
      updatedAt
      viewerCanAdminister
    }
  }
`

export const getRepositories = print(getRepositoriesQuery)
