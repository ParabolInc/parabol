import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {SetTeamHealthVoteMutation as TSetTeamHealthVoteMutation} from '../__generated__/SetTeamHealthVoteMutation.graphql'
import {StandardMutation} from '../types/relayMutations'

graphql`
  fragment SetTeamHealthVoteMutation_meeting on SetTeamHealthVoteSuccess {
    stage {
      id
      labels
      viewerVote
      votes
      ...TeamHealthLocalStage
    }
  }
`

const mutation = graphql`
  mutation SetTeamHealthVoteMutation($meetingId: ID!, $stageId: ID!, $label: String!) {
    setTeamHealthVote(meetingId: $meetingId, stageId: $stageId, label: $label) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...SetTeamHealthVoteMutation_meeting @relay(mask: false)
    }
  }
`

type Stage = NonNullable<
  NonNullable<TSetTeamHealthVoteMutation['response']>['setTeamHealthVote']['stage']
>

const SetTeamHealthVoteMutation: StandardMutation<TSetTeamHealthVoteMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TSetTeamHealthVoteMutation>(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const {stageId, label} = variables
      const stage = store.get<Stage>(stageId)
      if (!stage) return
      const viewer = store.getRoot().getLinkedRecord('viewer')
      if (!stage || !viewer) return

      // not updating the votedUsers here until it's official from the server
      stage.setValue(label, 'viewerVote')
    },
    onCompleted,
    onError
  })
}

export default SetTeamHealthVoteMutation
