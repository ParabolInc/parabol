import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import type {AddTeamMemberIntegrationAuthMutation as TAddTeamMemberIntegrationAuthMutation} from '../__generated__/AddTeamMemberIntegrationAuthMutation.graphql'
import type {StandardMutation} from '../types/relayMutations'

const mutation = graphql`
  mutation AddTeamMemberIntegrationAuthMutation(
    $providerId: ID
    $service: IntegrationProviderServiceEnum
    $oauthCodeOrPat: ID
    $oauthVerifier: ID
    $teamId: ID!
    $redirectUri: URL
    $includeAtlassian: Boolean = false
    $includeGitHub: Boolean = false
  ) {
    addTeamMemberIntegrationAuth(
      providerId: $providerId
      service: $service
      oauthCodeOrPat: $oauthCodeOrPat
      oauthVerifier: $oauthVerifier
      teamId: $teamId
      redirectUri: $redirectUri
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
            gdrive {
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
