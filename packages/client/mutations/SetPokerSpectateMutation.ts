import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {SetPokerSpectateMutation as TSetPokerSpectateMutation} from '../__generated__/SetPokerSpectateMutation.graphql'

graphql`
  fragment SetPokerSpectateMutation_team on SetPokerSpectateSuccess {
    meetingMember {
      isSpectating
    }
    updatedStages {
      scores {
        userId
      }
    }
  }
`

const mutation = graphql`
  mutation SetPokerSpectateMutation($meetingId: ID!, $isSpectating: Boolean!) {
    setPokerSpectate(meetingId: $meetingId, isSpectating: $isSpectating) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...SetPokerSpectateMutation_team @relay(mask: false)
    }
  }
`

const SetPokerSpectateMutation: StandardMutation<TSetPokerSpectateMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TSetPokerSpectateMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default SetPokerSpectateMutation
