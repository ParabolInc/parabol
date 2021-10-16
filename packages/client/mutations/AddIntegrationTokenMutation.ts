import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {AddIntegrationTokenMutation as TAddIntegrationTokenMutation} from '../__generated__/AddIntegrationTokenMutation.graphql'

graphql`
  fragment AddIntegrationTokenMutation_part on AddIntegrationTokenSuccess {
    teamMember {
      integrations {
        gitlab {
          ...GitLabProviderRowGitLabIntegration
        }
      }
    }
  }
`

const mutation = graphql`
  mutation AddIntegrationTokenMutation(
    $providerId: ID!
    $oauthCodeOrPat: ID!
    $teamId: ID!
    $redirectUri: URL!
  ) {
    addIntegrationToken(
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
      ...AddIntegrationTokenMutation_part @relay(mask: false)
    }
  }
`

const AddIntegrationTokenMutation: StandardMutation<TAddIntegrationTokenMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TAddIntegrationTokenMutation>(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: () => {
      const {} = variables
    },
    onCompleted,
    onError
  })
}

export default AddIntegrationTokenMutation
