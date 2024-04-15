import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {UpdateRetroMaxVotesMutation as TUpdateRetroMaxVotesMutation} from '../__generated__/UpdateRetroMaxVotesMutation.graphql'
import {StandardMutation} from '../types/relayMutations'

graphql`
  fragment UpdateRetroMaxVotesMutation_meeting on UpdateRetroMaxVotesSuccess {
    meeting {
      totalVotes
      maxVotesPerGroup
      votesRemaining
      viewerMeetingMember {
        votesRemaining
      }
    }
  }
`

const mutation = graphql`
  mutation UpdateRetroMaxVotesMutation(
    $meetingId: ID!
    $totalVotes: Int!
    $maxVotesPerGroup: Int!
  ) {
    updateRetroMaxVotes(
      meetingId: $meetingId
      totalVotes: $totalVotes
      maxVotesPerGroup: $maxVotesPerGroup
    ) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...UpdateRetroMaxVotesMutation_meeting @relay(mask: false)
    }
  }
`

const UpdateRetroMaxVotesMutation: StandardMutation<TUpdateRetroMaxVotesMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TUpdateRetroMaxVotesMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError,
    optimisticUpdater: (store) => {
      const {totalVotes, maxVotesPerGroup, meetingId} = variables
      const meeting = store.get(meetingId)
      if (!meeting) return
      meeting.setValue(totalVotes, 'totalVotes')
      meeting.setValue(maxVotesPerGroup, 'maxVotesPerGroup')
    }
  })
}

export default UpdateRetroMaxVotesMutation
