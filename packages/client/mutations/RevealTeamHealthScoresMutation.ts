import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import createProxyRecord from '../utils/relay/createProxyRecord'
import {RevealTeamHealthScoresMutation as TRevealTeamHealthScoresMutation} from '../__generated__/RevealTeamHealthScoresMutation.graphql'

graphql`
  fragment RevealTeamHealthScoresMutation_meeting on RevealTeamHealthScoresSuccess {
    phase {
      stages {
        ...TeamHealthLocalStage
      }
    }
  }
`

const mutation = graphql`
  mutation RevealTeamHealthScoresMutation($meetingId: ID!) {
    revealTeamHealthScores(meetingId: $meetingId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...RevealTeamHealthScoresMutation_meeting @relay(mask: false)
    }
  }
`

const RevealTeamHealthScoresMutation: StandardMutation<TRevealTeamHealthScoresMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TRevealTeamHealthScoresMutation>(atmosphere, {
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

export default RevealTeamHealthScoresMutation
