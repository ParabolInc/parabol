import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {RevealTeamHealthVotesMutation as TRevealTeamHealthVotesMutation} from '../__generated__/RevealTeamHealthVotesMutation.graphql'
import {StandardMutation} from '../types/relayMutations'

graphql`
  fragment RevealTeamHealthVotesMutation_meeting on RevealTeamHealthVotesSuccess {
    stage {
      ...TeamHealthLocalStage
    }
  }
`

const mutation = graphql`
  mutation RevealTeamHealthVotesMutation($meetingId: ID!, $stageId: ID!) {
    revealTeamHealthVotes(meetingId: $meetingId, stageId: $stageId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...RevealTeamHealthVotesMutation_meeting @relay(mask: false)
    }
  }
`

const RevealTeamHealthVotesMutation: StandardMutation<TRevealTeamHealthVotesMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  // there is no point in optimistic updating because we don't have the votes available
  return commitMutation<TRevealTeamHealthVotesMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default RevealTeamHealthVotesMutation
