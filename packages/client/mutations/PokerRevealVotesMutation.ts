import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {PokerRevealVotesMutation as TPokerRevealVotesMutation} from '../__generated__/PokerRevealVotesMutation.graphql'
import {StandardMutation} from '../types/relayMutations'

graphql`
  fragment PokerRevealVotesMutation_meeting on PokerRevealVotesSuccess {
    stage {
      isVoting
      scores {
        ...PokerVotingRow_scores
        label
      }
    }
  }
`

const mutation = graphql`
  mutation PokerRevealVotesMutation($meetingId: ID!, $stageId: ID!) {
    pokerRevealVotes(meetingId: $meetingId, stageId: $stageId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...PokerRevealVotesMutation_meeting @relay(mask: false)
    }
  }
`

const PokerRevealVotesMutation: StandardMutation<TPokerRevealVotesMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TPokerRevealVotesMutation>(atmosphere, {
    mutation,
    variables,
    // don't be optimistic, we don't know what the scores will be
    onCompleted,
    onError
  })
}

export default PokerRevealVotesMutation
