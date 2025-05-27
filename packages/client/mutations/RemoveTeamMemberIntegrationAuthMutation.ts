import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {RemoveTeamMemberIntegrationAuthMutation as TRemoveTeamMemberIntegrationAuthMutation} from '../__generated__/RemoveTeamMemberIntegrationAuthMutation.graphql'
import {StandardMutation} from '../types/relayMutations'

graphql`
  fragment RemoveTeamMemberIntegrationAuthMutation_team on RemoveTeamMemberIntegrationAuthSuccess {
    teamMember {
      ...GitLabProviderRowTeamMember
      ...JiraServerProviderRowTeamMember
      ...AzureDevOpsProviderRowTeamMember
      ...GcalProviderRowTeamMember
      integrations {
        ...MattermostProviderRowTeamMemberIntegrations
        ...MSTeamsProviderRowTeamMemberIntegrations
        ...LinearProviderRowTeamMemberIntegrations
      }
    }
  }
`

const mutation = graphql`
  mutation RemoveTeamMemberIntegrationAuthMutation(
    $service: IntegrationProviderServiceEnum!
    $teamId: ID!
  ) {
    removeTeamMemberIntegrationAuth(service: $service, teamId: $teamId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...RemoveTeamMemberIntegrationAuthMutation_team @relay(mask: false)
    }
  }
`

const RemoveTeamMemberIntegrationAuthMutation: StandardMutation<
  TRemoveTeamMemberIntegrationAuthMutation
> = (atmosphere, variables, {onError, onCompleted}) => {
  return commitMutation<TRemoveTeamMemberIntegrationAuthMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default RemoveTeamMemberIntegrationAuthMutation
