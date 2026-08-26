import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import type {AddTeamMemberIntegrationAuthMutation as TAddTeamMemberIntegrationAuthMutation} from '../__generated__/AddTeamMemberIntegrationAuthMutation.graphql'
import type {StandardMutation} from '../types/relayMutations'

graphql`
  fragment AddTeamMemberIntegrationAuthMutation_notification on AddTeamMemberIntegrationAuthSuccess {
    teamMember {
      integrations {
        ...useIsIntegrated_integrations
      }
      services {
        service
        isConnected
      }
    }
  }
`

const mutation = graphql`
  mutation AddTeamMemberIntegrationAuthMutation(
    $providerId: ID!
    $oauthCodeOrPat: ID
    $oauthVerifier: ID
    $teamId: ID!
    $includeAtlassian: Boolean = false
    $includeGitHub: Boolean = false
  ) {
    addTeamMemberIntegrationAuth(
      providerId: $providerId
      oauthCodeOrPat: $oauthCodeOrPat
      oauthVerifier: $oauthVerifier
      teamId: $teamId
    ) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ... on AddTeamMemberIntegrationAuthSuccess {
        teamMember {
          ...GitLabProviderRowTeamMember
          ...ScopePhaseAreaGitLab_teamMember
          ...JiraServerProviderRowTeamMember
          ...AzureDevOpsProviderRowTeamMember
          ...GcalProviderRowTeamMember
          ...LinearProviderRowTeamMember
          ...ScopePhaseAreaGitHub_teamMember
          integrations {
            ...MattermostProviderRowTeamMemberIntegrations
            ...MSTeamsProviderRowTeamMemberIntegrations
            gitlab {
              auth {
                isActive
              }
            }
            linear {
              auth {
                isActive
              }
            }
            gmeet {
              isActive
            }
            zoom {
              isActive
            }
            atlassian @include(if: $includeAtlassian) {
              ...AtlassianProviderRowAtlassianIntegration
              ...useIsIntegratedAtlassianIntegration
            }
            github @include(if: $includeGitHub) {
              ...useIsIntegratedGitHubIntegration
              ...GitHubProviderRowGitHubIntegration
              ...GitHubScopingSearchBarGitHubIntegration
            }
          }
        }
      }
    }
  }
`

const AddTeamMemberIntegrationAuthMutation: StandardMutation<
  TAddTeamMemberIntegrationAuthMutation
> = (atmosphere, variables, {onError, onCompleted}) => {
  return commitMutation<TAddTeamMemberIntegrationAuthMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default AddTeamMemberIntegrationAuthMutation
