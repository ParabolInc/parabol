import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import type {RemoveIntegrationSearchQueryMutation as TRemoveIntegrationSearchQueryMutation} from '../__generated__/RemoveIntegrationSearchQueryMutation.graphql'
import type {SimpleMutation} from '../types/relayMutations'

graphql`
  fragment RemoveIntegrationSearchQueryMutation_notification on RemoveIntegrationSearchQuerySuccess {
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
  mutation RemoveIntegrationSearchQueryMutation(
    $id: ID!
    $teamId: ID!
    $includeJiraServer: Boolean = false
    $includeAtlassian: Boolean = false
    $includeGitHub: Boolean = false
  ) {
    removeIntegrationSearchQuery(id: $id, teamId: $teamId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ... on RemoveIntegrationSearchQuerySuccess {
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

const RemoveIntegrationSearchQueryMutation: SimpleMutation<
  TRemoveIntegrationSearchQueryMutation
> = (atmosphere, variables) => {
  return commitMutation<TRemoveIntegrationSearchQueryMutation>(atmosphere, {mutation, variables})
}

export default RemoveIntegrationSearchQueryMutation
