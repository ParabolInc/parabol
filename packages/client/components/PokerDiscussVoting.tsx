import graphql from 'babel-plugin-relay/macro'
import React, {useMemo} from 'react'
import {createFragmentContainer} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import PokerSetFinalScoreMutation from '../mutations/PokerSetFinalScoreMutation'
import {PokerCards} from '../types/constEnums'
import {PokerDiscussVoting_meeting} from '../__generated__/PokerDiscussVoting_meeting.graphql'
import {PokerDiscussVoting_stage} from '../__generated__/PokerDiscussVoting_stage.graphql'
import PokerDimensionValueControl from './PokerDimensionValueControl'
import PokerVotingRow from './PokerVotingRow'

interface Props {
  meeting: PokerDiscussVoting_meeting
  stage: PokerDiscussVoting_stage
}

const PokerDiscussVoting = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {submitting, submitMutation, onError, onCompleted} = useMutationProps()
  const {viewerId} = atmosphere
  const {meeting, stage} = props
  const {id: meetingId, facilitatorUserId} = meeting
  const {id: stageId, finalScore, dimension, scores} = stage
  const {selectedScale} = dimension
  const {values: scaleValues} = selectedScale
  const {rows, topLabel} = useMemo(() => {
    const scoreObj = {} as {[label: string]: PokerDiscussVoting_stage['scores'][0][]}
    let highScore = 0
    let topLabel = ''
    scores.forEach((score) => {
      const {label} = score
      scoreObj[label] = scoreObj[label] || []
      const len = scoreObj[label].push(score)
      if (len > highScore) {
        highScore = len
        topLabel = label
      }
    })
    const scoreLabels = Object.keys(scoreObj).sort((a, b) => {
      return a === PokerCards.QUESTION_CARD ? - 1 :
        a === PokerCards.PASS_CARD ? 1 :
          a > b ? -1 : 1
    })
    const rows = scoreLabels.map((label) => {
      return {
        key: label,
        scaleValue: scaleValues.find((scaleValue) => scaleValue.label === label) || null,
        scores: scoreObj[label]
      }
    })
    return {rows, topLabel}
  }, [scores])

  const isFacilitator = viewerId === facilitatorUserId
  return (
    <>
      <PokerDimensionValueControl placeholder={isFacilitator ? topLabel : '?'} stage={stage} isFacilitator={isFacilitator} />
      {rows.map(({scaleValue, scores, key}) => {
        const label = scores[0]?.label
        const isSpecial = [PokerCards.QUESTION_CARD, PokerCards.PASS_CARD].includes(label as any)
        const canClick = isFacilitator && !isSpecial
        const setFinalScore = canClick ? () => {

          if (submitting || !label || finalScore === label) return
          submitMutation()
          PokerSetFinalScoreMutation(atmosphere, {finalScore: label, meetingId, stageId}, {onError, onCompleted})
        } : undefined
        return (
          <PokerVotingRow key={key} scaleValue={scaleValue} scores={scores} setFinalScore={setFinalScore} />
        )
      })}
    </>
  )
}



export default createFragmentContainer(
  PokerDiscussVoting,
  {
    stage: graphql`
    fragment PokerDiscussVoting_stage on EstimateStage {
      ...PokerDimensionValueControl_stage
      id
      finalScore
      dimension {
        selectedScale {
          values {
            ...PokerVotingRow_scaleValue
            label
            color
          }
        }
      }
      scores {
        ...PokerVotingRow_scores
        label
      }
    }`,
    meeting: graphql`
    fragment PokerDiscussVoting_meeting on PokerMeeting {
      id
      facilitatorUserId
    }`
  }
)
