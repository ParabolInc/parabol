import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import type {AddTeamMemberIntegrationAuthMutation as TAddTeamMemberIntegrationAuthMutation} from '../__generated__/AddTeamMemberIntegrationAuthMutation.graphql'
import type {StandardMutation} from '../types/relayMutations'

graphql`
  fragment AddTeamMemberIntegrationAuthMutation_notification on AddTeamMemberIntegrationAuthSuccess {
    teamMember {
      ...useIsIntegrated_teamMember
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
        atlassian {
          isActive
          ...AtlassianProviderRowAtlassianIntegration
        }
        github {
          ...GitHubProviderRowGitHubIntegration
          ...GitHubScopingSearchBarGitHubIntegration
        }
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
        ...AddTeamMemberIntegrationAuthMutation_notification @relay(mask: false)
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
