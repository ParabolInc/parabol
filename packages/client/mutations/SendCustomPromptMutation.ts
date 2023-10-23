import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {SendCustomPromptMutation as TSendCustomPromptMutation} from '../__generated__/SendCustomPromptMutation.graphql'

graphql`
  fragment SendCustomPromptMutation_viewer on SendCustomPromptSuccess {
    response
  }
`

const mutation = graphql`
  mutation SendCustomPromptMutation($prompt: String!) {
    sendCustomPrompt(prompt: $prompt) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...SendCustomPromptMutation_viewer @relay(mask: false)
    }
  }
`

const SendCustomPromptMutation: StandardMutation<TSendCustomPromptMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TSendCustomPromptMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default SendCustomPromptMutation
