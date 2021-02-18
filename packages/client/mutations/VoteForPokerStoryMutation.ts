import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import createProxyRecord from '../utils/relay/createProxyRecord'
import {
  VoteForPokerStoryMutation as TVoteForPokerStoryMutation,
  VoteForPokerStoryMutationResponse
} from '../__generated__/VoteForPokerStoryMutation.graphql'

graphql`
  fragment VoteForPokerStoryMutation_meeting on VoteForPokerStorySuccess {
    stage {
      scores {
        ...PokerVotingRow_scores
        userId
        label
      }
    }
  }
`

const mutation = graphql`
  mutation VoteForPokerStoryMutation($meetingId: ID!, $stageId: ID!, $score: String) {
    voteForPokerStory(meetingId: $meetingId, stageId: $stageId, score: $score) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...VoteForPokerStoryMutation_meeting @relay(mask: false)
    }
  }
`

type Stage = NonNullable<
  NonNullable<VoteForPokerStoryMutationResponse>['voteForPokerStory']['stage']
>

const VoteForPokerStoryMutation: StandardMutation<TVoteForPokerStoryMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TVoteForPokerStoryMutation>(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const {stageId, score} = variables
      const {viewerId} = atmosphere
      const stage = store.get<Stage>(stageId)
      if (!stage) return
      const scores = stage.getLinkedRecords('scores') || []
      const existingScoreIdx = scores.findIndex((item) => item.getValue('userId') === viewerId)
      if (score) {
        const dimensionId = stage.getValue('dimensionId') as string
        if (!dimensionId) return
        const dimension = store.get(dimensionId)
        if (!dimension) return
        const scaleId = dimension.getValue('scaleId')
        if (!scaleId) return
        const scale = store.get('scaleId')
        const scaleValues = scale?.getLinkedRecords('values')
        if (!scaleValues) return
        const scaleValue = scaleValues.find((value) => value.getValue('label') === score)
        if (!scaleValue) return
        const optimisticScore = createProxyRecord(store, 'EstimateUserScore', {
          userId: viewerId,
          score
        })
        const nextScores =
          existingScoreIdx === -1
            ? [...scores, optimisticScore]
            : [
                ...scores.slice(0, existingScoreIdx),
                optimisticScore,
                ...scores.slice(existingScoreIdx + 1)
              ]
        stage.setLinkedRecords(nextScores, 'scores')
      } else {
        if (existingScoreIdx === -1) return
        const nextScores = [
          ...scores.slice(0, existingScoreIdx),
          ...scores.slice(existingScoreIdx + 1)
        ]
        stage.setLinkedRecords(nextScores, 'scores')
      }
    },
    onCompleted,
    onError
  })
}

export default VoteForPokerStoryMutation
