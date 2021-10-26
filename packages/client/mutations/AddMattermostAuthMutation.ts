import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {StandardMutation} from '../types/relayMutations'
import {AddMattermostAuthMutation as TAddMattermostAuthMutation} from '../__generated__/AddMattermostAuthMutation.graphql'

graphql`
  fragment AddMattermostAuthMutation_team on AddMattermostAuthSuccess {
    user {
      ...MattermostPanel_viewer
    }
  }
`

const mutation = graphql`
  mutation AddMattermostAuthMutation($webhookUrl: URL!, $teamId: ID!) {
    addMattermostAuth(webhookUrl: $webhookUrl, teamId: $teamId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...AddMattermostAuthMutation_team @relay(mask: false)
    }
  }
`

const AddMattermostAuthMutation: StandardMutation<TAddMattermostAuthMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TAddMattermostAuthMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default AddMattermostAuthMutation
