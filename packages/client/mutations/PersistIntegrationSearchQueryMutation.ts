import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import type {PersistIntegrationSearchQueryMutation as TPersistIntegrationSearchQueryMutation} from '../__generated__/PersistIntegrationSearchQueryMutation.graphql'
import type {SimpleMutation} from '../types/relayMutations'

graphql`
  fragment PersistIntegrationSearchQueryMutation_jiraServer on JiraServerIntegration {
    searchQueries {
      id
      queryString
      isJQL
      projectKeyFilters
    }
  }
`

graphql`
  fragment PersistIntegrationSearchQueryMutation_atlassian on AtlassianIntegration {
    jiraSearchQueries {
      id
      queryString
      isJQL
      projectKeyFilters
      lastUsedAt
    }
  }
`

graphql`
  fragment PersistIntegrationSearchQueryMutation_github on GitHubIntegration {
    githubSearchQueries {
      id
      queryString
      lastUsedAt
    }
  }
`

graphql`
  fragment PersistIntegrationSearchQueryMutation_notification on PersistIntegrationSearchQuerySuccess {
    teamMember {
      integrations {
        jiraServer {
          ...PersistIntegrationSearchQueryMutation_jiraServer @relay(mask: false)
        }
        atlassian {
          ...PersistIntegrationSearchQueryMutation_atlassian @relay(mask: false)
        }
        github {
          ...PersistIntegrationSearchQueryMutation_github @relay(mask: false)
        }
      }
    }
  }
`

const mutation = graphql`
  mutation PersistIntegrationSearchQueryMutation(
    $teamId: ID!
    $providerId: ID!
    $queryString: String!
    $meta: String
    $includeJiraServer: Boolean = false
    $includeAtlassian: Boolean = false
    $includeGitHub: Boolean = false
  ) {
    persistIntegrationSearchQuery(
      teamId: $teamId
      providerId: $providerId
      queryString: $queryString
      meta: $meta
    ) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ... on PersistIntegrationSearchQuerySuccess {
        teamMember {
          integrations {
            jiraServer @include(if: $includeJiraServer) {
              ...PersistIntegrationSearchQueryMutation_jiraServer @relay(mask: false)
            }
            atlassian @include(if: $includeAtlassian) {
              ...PersistIntegrationSearchQueryMutation_atlassian @relay(mask: false)
            }
            github @include(if: $includeGitHub) {
              ...PersistIntegrationSearchQueryMutation_github @relay(mask: false)
            }
          }
        }
      }
    }
  }
`

const PersistIntegrationSearchQueryMutation: SimpleMutation<
  TPersistIntegrationSearchQueryMutation
> = (atmosphere, variables) => {
  return commitMutation<TPersistIntegrationSearchQueryMutation>(atmosphere, {mutation, variables})
}

export default PersistIntegrationSearchQueryMutation
