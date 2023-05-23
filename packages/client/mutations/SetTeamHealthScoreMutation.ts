import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import createProxyRecord from '../utils/relay/createProxyRecord'
import {SetTeamHealthScoreMutation as TSetTeamHealthScoreMutation} from '../__generated__/SetTeamHealthScoreMutation.graphql'

graphql`
  fragment SetTeamHealthScoreMutation_meeting on SetTeamHealthScoreSuccess {
    stage {
      ...TeamHealthLocalStage
      scores {
        userId
        label
      }
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
      const {viewerId} = atmosphere
      const stage = store.get<Stage>(stageId)
      if (!stage) return
      const viewer = store.getRoot().getLinkedRecord('viewer')
      if (!stage || !viewer) return
      const scores = stage.getLinkedRecords('scores') || []
      const existingScoreIdx = scores.findIndex((item) => item.getValue('userId') === viewerId)

      const optimisticScore = createProxyRecord(store, 'TeamHealthUserScore', {
        userId: viewerId,
        stageId,
        label
      })
      optimisticScore.setLinkedRecord(viewer, 'user')
      const nextScores =
        existingScoreIdx === -1
          ? [...scores, optimisticScore]
          : [
              ...scores.slice(0, existingScoreIdx),
              optimisticScore,
              ...scores.slice(existingScoreIdx + 1)
            ]
      stage.setLinkedRecords(nextScores, 'scores')
    },
    onCompleted,
    onError
  })
}

export default SetTeamHealthScoreMutation
