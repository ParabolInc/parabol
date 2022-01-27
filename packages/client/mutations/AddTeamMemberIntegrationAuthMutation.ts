import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {AddTeamMemberIntegrationAuthMutation as TAddTeamMemberIntegrationAuthMutation} from '../__generated__/AddTeamMemberIntegrationAuthMutation.graphql'

graphql`
  fragment AddTeamMemberIntegrationAuthMutation_teamMember on AddTeamMemberIntegrationAuthSuccess {
    teamMember {
      ...GitLabProviderRowTeamMember
      ...MattermostProviderRowTeamMember
    }
  }
`

const mutation = graphql`
  mutation AddTeamMemberIntegrationAuthMutation(
    $providerId: ID!
    $oauthCodeOrPat: ID
    $teamId: ID!
    $redirectUri: URL
  ) {
    addTeamMemberIntegrationAuth(
      providerId: $providerId
      oauthCodeOrPat: $oauthCodeOrPat
      teamId: $teamId
      redirectUri: $redirectUri
    ) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...AddTeamMemberIntegrationAuthMutation_teamMember @relay(mask: false)
    }
  }
`

const AddTeamMemberIntegrationAuthMutation: StandardMutation<TAddTeamMemberIntegrationAuthMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TAddTeamMemberIntegrationAuthMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default AddTeamMemberIntegrationAuthMutation
