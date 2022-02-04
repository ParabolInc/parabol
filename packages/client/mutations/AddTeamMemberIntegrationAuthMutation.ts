import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {AddTeamMemberIntegrationAuthMutation as TAddTeamMemberIntegrationAuthMutation} from '../__generated__/AddTeamMemberIntegrationAuthMutation.graphql'

graphql`
  fragment AddTeamMemberIntegrationAuthMutation_part on AddTeamMemberIntegrationAuthSuccess {
    teamMember {
      ...GitLabProviderRowTeamMember
      ...MattermostProviderRowTeamMember
      ...JiraServerProviderRowTeamMember
    }
  }
`

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
      ...AddTeamMemberIntegrationAuthMutation_part @relay(mask: false)
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
