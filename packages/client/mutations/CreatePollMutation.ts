import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {CreatePollMutation as TCreatePollMutation} from '../__generated__/CreatePollMutation.graphql'

graphql`
  fragment CreatePollMutation_poll on CreatePollSuccess {
    poll {
      id
      title
    }
  }
`

const mutation = graphql`
  mutation CreatePollMutation($newPoll: CreatePollInput!) {
    createPoll(newPoll: $newPoll) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...CreatePollMutation_poll @relay(mask: false)
    }
  }
`

const CreatePollMutation: StandardMutation<TCreatePollMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TCreatePollMutation>(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const {} = variables
    },
    onCompleted,
    onError
  })
}

export default CreatePollMutation
