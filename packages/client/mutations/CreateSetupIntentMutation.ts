import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {CreateSetupIntentMutation as TCreateSetupIntentMutation} from '../__generated__/CreateSetupIntentMutation.graphql'

const mutation = graphql`
  mutation CreateSetupIntentMutation {
    createSetupIntent {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ... on CreateSetupIntentSuccess {
        clientSecret
      }
    }
  }
`

const CreateSetupIntentMutation: StandardMutation<TCreateSetupIntentMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TCreateSetupIntentMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default CreateSetupIntentMutation
