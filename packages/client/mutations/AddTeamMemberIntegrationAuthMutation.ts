import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {AddTeamMemberIntegrationAuthMutation as TAddTeamMemberIntegrationAuthMutation} from '../__generated__/AddTeamMemberIntegrationAuthMutation.graphql'
import {StandardMutation} from '../types/relayMutations'

const mutation = graphql`
  mutation AddTeamMemberIntegrationAuthMutation(
    $providerId: ID!
    $oauthCodeOrPat: ID
    $oauthVerifier: ID
    $teamId: ID!
    $redirectUri: URL
  ) {
    addTeamMemberIntegrationAuth(
      providerId: $providerId
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
          integrations {
            ...MattermostProviderRowTeamMemberIntegrations
            ...MSTeamsProviderRowTeamMemberIntegrations
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
