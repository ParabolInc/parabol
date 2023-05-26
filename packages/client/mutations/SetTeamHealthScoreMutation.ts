import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {SetTeamHealthScoreMutation as TSetTeamHealthScoreMutation} from '../__generated__/SetTeamHealthScoreMutation.graphql'

graphql`
  fragment SetTeamHealthScoreMutation_meeting on SetTeamHealthScoreSuccess {
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
  mutation SetTeamHealthScoreMutation($meetingId: ID!, $stageId: ID!, $label: String!) {
    setTeamHealthScore(meetingId: $meetingId, stageId: $stageId, label: $label) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...SetTeamHealthScoreMutation_meeting @relay(mask: false)
    }
  }
`

type Stage = NonNullable<
  NonNullable<TSetTeamHealthScoreMutation['response']>['setTeamHealthScore']['stage']
>

const SetTeamHealthScoreMutation: StandardMutation<TSetTeamHealthScoreMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TSetTeamHealthScoreMutation>(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const {stageId, label} = variables
      const stage = store.get<Stage>(stageId)
      if (!stage) return
      const viewer = store.getRoot().getLinkedRecord('viewer')
      if (!stage || !viewer) return

      const labels = stage.getValue('labels')
      const votes = [...stage.getValue('votes')]
      const viewerVote = stage.getValue('viewerVote')

      if (viewerVote === label) return
      if (viewerVote) {
        const labelIdx = labels.findIndex((item) => item === viewerVote)
        votes[labelIdx] = votes[labelIdx]! - 1
      }
      // not updating the votedUsers here until it's official from the server

      const labelIdx = labels.findIndex((item) => item === label)
      votes[labelIdx] = votes[labelIdx]! - 1
      stage.setValue(votes, 'votes')
      stage.setValue(label, 'viewerVote')
    },
    onCompleted,
    onError
  })
}

export default SetTeamHealthScoreMutation
