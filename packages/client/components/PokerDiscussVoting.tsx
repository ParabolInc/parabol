import graphql from 'babel-plugin-relay/macro'
import React, {useMemo} from 'react'
import {createFragmentContainer} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import {PokerCards} from '../types/constEnums'
import {PokerDiscussVoting_meeting} from '../__generated__/PokerDiscussVoting_meeting.graphql'
import {PokerDiscussVoting_stage} from '../__generated__/PokerDiscussVoting_stage.graphql'
import {SetVotedUserEl} from './EstimatePhaseArea'
import PokerDimensionValueControl from './PokerDimensionValueControl'
import PokerDimensionValueStatic from './PokerDimensionValueStatic'
import PokerVotingRow from './PokerVotingRow'

interface Props {
  meeting: PokerDiscussVoting_meeting
  stage: PokerDiscussVoting_stage
  setVotedUserEl: SetVotedUserEl
}

const PokerDiscussVoting = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const {meeting, setVotedUserEl, stage} = props
  const {facilitatorUserId} = meeting
  const {finalScore, dimension, scores} = stage
  const {selectedScale} = dimension
  const {values: scaleValues} = selectedScale
  const finalScaleValue = scaleValues.find((scaleValue) => scaleValue.label === finalScore) || null
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
      {!isFacilitator
        ? <PokerDimensionValueControl hasFocus={false} placeholder={topLabel} scaleValue={null} />
        : <PokerDimensionValueStatic scaleValue={finalScaleValue} />
      }
      {rows.map(({scaleValue, scores, key}) => (
        <PokerVotingRow key={key} setVotedUserEl={setVotedUserEl} scaleValue={scaleValue} scores={scores} />
      ))}
    </>
  )
}



export default createFragmentContainer(
  PokerDiscussVoting,
  {
    stage: graphql`
    fragment PokerDiscussVoting_stage on EstimateStage {
      finalScore
      dimension {
        selectedScale {
          values {
            ...PokerVotingRow_scaleValue
            ...PokerDimensionValueStatic_scaleValue
            label
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
      facilitatorUserId
    }`
  }
)
