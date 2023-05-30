import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {RevealTeamHealthVotesMutation as TRevealTeamHealthVotesMutation} from '../__generated__/RevealTeamHealthVotesMutation.graphql'

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

type Stage = NonNullable<
  NonNullable<TRevealTeamHealthVotesMutation['response']>['revealTeamHealthVotes']['stage']
>

const RevealTeamHealthVotesMutation: StandardMutation<TRevealTeamHealthVotesMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TRevealTeamHealthVotesMutation>(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const {stageId} = variables
      const stage = store.get<Stage>(stageId)
      if (!stage) return
      stage.setValue(true, 'isRevealed')
    },
    onCompleted,
    onError
  })
}

export default RevealTeamHealthVotesMutation
