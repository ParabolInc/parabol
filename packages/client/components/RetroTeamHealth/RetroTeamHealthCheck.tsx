import graphql from 'babel-plugin-relay/macro'
import {useEffect, useState} from 'react'
import {commitLocalUpdate, useFragment} from 'react-relay'
import type {RetroTeamHealthCheck_teamHealthMeeting$key} from '~/__generated__/RetroTeamHealthCheck_teamHealthMeeting.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'
import useTeamHealthCheckConnection from '../../hooks/useTeamHealthCheckConnection'
import FlagReadyToAdvanceMutation from '../../mutations/FlagReadyToAdvanceMutation'
import {setLocalStageAndPhase} from '../../utils/relay/updateLocalStage'
import RetroTeamHealthQuestions from './RetroTeamHealthQuestions'
import RetroTeamHealthStatus from './RetroTeamHealthStatus'

interface Props {
  teamHealthMeeting: RetroTeamHealthCheck_teamHealthMeeting$key
  retroMeetingId: string
  retroStageId: string
  isFacilitator: boolean
  isStartedHere: boolean
  onAnsweringChange: (isAnswering: boolean) => void
  onRevealed: () => void
}

const RetroTeamHealthCheck = (props: Props) => {
  const {teamHealthMeeting: teamHealthMeetingRef, retroMeetingId, retroStageId} = props
  const {isFacilitator, isStartedHere, onAnsweringChange, onRevealed} = props
  const teamHealthMeeting = useFragment(
    graphql`
      fragment RetroTeamHealthCheck_teamHealthMeeting on TeamHealthMeeting {
        ...RetroTeamHealthQuestions_teamHealthMeeting
        ...RetroTeamHealthStatus_teamHealthMeeting
        id
        endedAt
        localStage {
          id
          phaseType
        }
        viewerMeetingMember {
          id
          ... on TeamHealthMeetingMember {
            isSpectating
          }
        }
        phases {
          phaseType
          stages {
            id
            phaseType
            ... on TeamHealthResponseStage {
              viewerResponse {
                score
              }
            }
          }
        }
      }
    `,
    teamHealthMeetingRef
  )
  const {
    id: teamHealthMeetingId,
    endedAt,
    localStage,
    viewerMeetingMember,
    phases
  } = teamHealthMeeting
  useTeamHealthCheckConnection(teamHealthMeetingId, !viewerMeetingMember && !endedAt)
  const atmosphere = useAtmosphere()
  const introStageId = phases.find(({phaseType}) => phaseType === 'TEAM_HEALTH_INTRO')?.stages[0]
    ?.id
  const responseStages =
    phases.find(({phaseType}) => phaseType === 'TEAM_HEALTH_RESPONSE')?.stages ?? []
  const firstUnansweredStageId = responseStages.find(
    (stage) => stage.viewerResponse?.score == null
  )?.id
  const isSpectating = !!viewerMeetingMember?.isSpectating
  const isAnswering = localStage?.phaseType === 'TEAM_HEALTH_RESPONSE'

  // the viewer left the questions on purpose, so they are not pulled back to them
  const [isDone, setIsDone] = useState(false)
  const setCheckStage = (stageId: string) => {
    commitLocalUpdate(atmosphere, (store) =>
      setLocalStageAndPhase(store, teamHealthMeetingId, stageId)
    )
  }
  // the check's own cards navigate by stage. Here a question is the check's local stage, and leaving
  // the last question means the viewer is done, which marks them ready in the retro
  const gotoQuestion = (stageId: string) => {
    const isQuestion = responseStages.some(({id}) => id === stageId)
    const nextStageId = isQuestion ? stageId : introStageId
    if (!nextStageId) return
    setCheckStage(nextStageId)
    if (isQuestion) return
    setIsDone(true)
    if (!isFacilitator) {
      FlagReadyToAdvanceMutation(atmosphere, {
        isReady: true,
        meetingId: retroMeetingId,
        stageId: retroStageId
      })
    }
  }

  useEffect(() => {
    if (!viewerMeetingMember || isSpectating || endedAt || isDone || isAnswering) return
    if (firstUnansweredStageId) setCheckStage(firstUnansweredStageId)
  }, [viewerMeetingMember, isSpectating, isDone, isAnswering])
  // the sidebar marks the check's local question, which means nothing once the retro moves on
  useEffect(() => {
    return () => {
      if (introStageId) setCheckStage(introStageId)
    }
  }, [])
  useEffect(() => {
    onAnsweringChange(isAnswering)
  }, [isAnswering])

  // answers need membership, so the questions wait for the join to land
  if (!viewerMeetingMember) return null
  return isAnswering ? (
    <RetroTeamHealthQuestions
      teamHealthMeeting={teamHealthMeeting}
      isStartedHere={isStartedHere}
      gotoStageId={gotoQuestion}
    />
  ) : (
    <RetroTeamHealthStatus
      teamHealthMeeting={teamHealthMeeting}
      isStartedHere={isStartedHere}
      gotoStageId={gotoQuestion}
      onRevealed={onRevealed}
    />
  )
}

export default RetroTeamHealthCheck
