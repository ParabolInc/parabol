import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useEffect, useMemo, useRef, useState} from 'react'
import {createFragmentContainer} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import useForceUpdate from '../hooks/useForceUpdate'
import {PokerCards} from '../types/constEnums'
import isSpecialPokerLabel from '../utils/isSpecialPokerLabel'
import {PokerDiscussVoting_meeting} from '../__generated__/PokerDiscussVoting_meeting.graphql'
import {PokerDiscussVoting_stage} from '../__generated__/PokerDiscussVoting_stage.graphql'
import PokerDimensionValueControl from './PokerDimensionValueControl'
import PokerVotingRow from './PokerVotingRow'
import useSetTaskEstimate from './useSetTaskEstimate'

const GroupedVotes = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  overflowY: 'auto'
})

interface Props {
  meeting: PokerDiscussVoting_meeting
  stage: PokerDiscussVoting_stage
  isInitialStageRender: boolean
}

const PokerDiscussVoting = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {setTaskEstimate, error, submitting, onCompleted, onError} = useSetTaskEstimate()
  const forceUpdate = useForceUpdate()
  const {viewerId} = atmosphere
  const {meeting, stage, isInitialStageRender} = props
  const {id: meetingId, facilitatorUserId} = meeting
  const {id: stageId, dimensionRef, scores, taskId, serviceField} = stage
  const finalScore = stage.finalScore || ''
  const {name: serviceFieldName} = serviceField
  const {name: dimensionName, scale} = dimensionRef
  const {values: scaleValues} = scale
  const lastSubmittedFieldRef = useRef(serviceFieldName)
  const isLocallyValidatedRef = useRef(true)
  const [cardScore, setCardScore] = useState(finalScore)

  const isStale = (score: string) => {
    return score !== finalScore || lastSubmittedFieldRef.current !== serviceFieldName
  }

  const {rows, topLabel} = useMemo(() => {
    const scoreObj = {} as {[label: string]: PokerDiscussVoting_stage['scores'][0][]}
    let highScore = 0
    let topLabel = ''
    scores.forEach((score) => {
      const {label} = score
      scoreObj[label] = scoreObj[label] || []
      const len = scoreObj[label]!.push(score)
      if (len > highScore) {
        highScore = len
        topLabel = label
      }
    })
    const scoreLabels = Object.keys(scoreObj)
    const rows = scaleValues
      .filter((scaleValue) => scoreLabels.find((label) => label === scaleValue.label))
      .map((scaleValue) => {
        return {
          key: scaleValue.label,
          scaleValue,
          scores: scoreObj[scaleValue.label]!
        }
      })
    const questionIdx = rows.findIndex((row) => row.key === PokerCards.QUESTION_CARD)
    if (questionIdx !== -1) {
      const questionRow = rows.splice(questionIdx, 1)[0]!
      rows.unshift(questionRow)
    }
    const safeTopLabel = isSpecialPokerLabel(topLabel) ? PokerCards.QUESTION_CARD : topLabel
    return {rows, topLabel: safeTopLabel}
  }, [scores])

  const isFacilitator = viewerId === facilitatorUserId

  useEffect(() => {
    // if the final score changes, change what the card says & recalculate is stale
    setCardScore(finalScore)
    lastSubmittedFieldRef.current = serviceFieldName
    isLocallyValidatedRef.current = true
  }, [finalScore])

  const submitScore = (value?: string) => {
    const score = value ?? cardScore
    if (submitting || !isStale(score) || !isLocallyValidatedRef.current) {
      return
    }
    // submitScore might be called when changing the integration field to push to
    const noScoreYet = score === '' && finalScore === ''
    if (noScoreYet) return

    const onSuccess = () => {
      // set field A to 1, change fields to B, then submit again. it should not say update
      lastSubmittedFieldRef.current = serviceFieldName
      forceUpdate()
    }

    setTaskEstimate({taskId, dimensionName, meetingId, value: score}, stageId, onSuccess)
  }

  return (
    <>
      <PokerDimensionValueControl
        placeholder={isFacilitator ? topLabel : '?'}
        stage={stage}
        isFacilitator={isFacilitator}
        error={error}
        onCompleted={onCompleted}
        onError={onError}
        onSubmitScore={() => {
          submitScore()
        }}
        isStale={isStale(cardScore)}
        isLocallyValidatedRef={isLocallyValidatedRef}
        setCardScore={setCardScore}
        cardScore={cardScore}
      />
      <GroupedVotes>
        {rows.map(({scaleValue, scores, key}) => {
          const {label} = scaleValue
          const canClick = isFacilitator && !isSpecialPokerLabel(label)

          const setFinalScore = () => {
            // finalScore === label isn't 100% accurate because they could change the dimensionField & could still submit new info
            if (submitting || !label || finalScore === label) return
            setCardScore(label)
            isLocallyValidatedRef.current = true
            onCompleted()
            submitScore(label)
          }

          return (
            <React.Fragment key={key}>
              <PokerVotingRow
                scaleValue={scaleValue}
                scores={scores}
                setFinalScore={canClick ? setFinalScore : undefined}
                isInitialStageRender={isInitialStageRender}
              />
            </React.Fragment>
          )
        })}
      </GroupedVotes>
    </>
  )
}

export default createFragmentContainer(PokerDiscussVoting, {
  stage: graphql`
    fragment PokerDiscussVoting_stage on EstimateStage {
      ...PokerDimensionValueControl_stage
      id
      finalScore
      serviceField {
        name
        type
      }
      taskId
      dimensionRef {
        name
        scale {
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
    }
  `,
  meeting: graphql`
    fragment PokerDiscussVoting_meeting on PokerMeeting {
      id
      facilitatorUserId
    }
  `
})
