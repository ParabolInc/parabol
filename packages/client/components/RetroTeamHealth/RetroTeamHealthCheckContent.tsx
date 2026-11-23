import graphql from 'babel-plugin-relay/macro'
import {useEffect, useState} from 'react'
import {useFragment} from 'react-relay'
import type {RetroTeamHealthCheckContent_meeting$key} from '~/__generated__/RetroTeamHealthCheckContent_meeting.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'
import type useGotoStageId from '../../hooks/useGotoStageId'
import RetroTeamHealthCheck from './RetroTeamHealthCheck'
import RetroTeamHealthClosedCheck from './RetroTeamHealthClosedCheck'
import RetroTeamHealthNoCheck from './RetroTeamHealthNoCheck'
import RetroTeamHealthStartCheckRoot from './RetroTeamHealthStartCheckRoot'

interface Props {
  meeting: RetroTeamHealthCheckContent_meeting$key
  gotoStageId: ReturnType<typeof useGotoStageId>
}

const RetroTeamHealthCheckContent = (props: Props) => {
  const {meeting: meetingRef, gotoStageId} = props
  const meeting = useFragment(
    graphql`
      fragment RetroTeamHealthCheckContent_meeting on RetrospectiveMeeting {
        id
        teamId
        facilitatorUserId
        facilitator {
          user {
            preferredName
          }
        }
        openTeamHealthMeeting {
          id
          ...RetroTeamHealthCheck_teamHealthMeeting
          ...RetroTeamHealthClosedCheck_teamHealthMeeting
        }
        startedTeamHealthMeeting {
          id
        }
        phases {
          phaseType
          stages {
            id
            isNavigable
            isNavigableByFacilitator
            ... on RetroTeamHealthResultStage {
              teamHealthMeeting {
                id
              }
            }
          }
        }
      }
    `,
    meetingRef
  )
  const {
    id: meetingId,
    teamId,
    facilitatorUserId,
    facilitator,
    phases,
    openTeamHealthMeeting: teamHealthMeeting,
    startedTeamHealthMeeting
  } = meeting
  const atmosphere = useAtmosphere()
  const isFacilitator = atmosphere.viewerId === facilitatorUserId
  const checkStage = phases.find(({phaseType}) => phaseType === 'TEAM_HEALTH_CHECK')?.stages[0]
  const firstResultStage = phases.find(({phaseType}) => phaseType === 'TEAM_HEALTH_CHECK_RESULT')
    ?.stages[0]
  const firstResultStageId = firstResultStage?.id
  const resultsCheckId = firstResultStage?.teamHealthMeeting?.id
  const isStartedHere = !!teamHealthMeeting && teamHealthMeeting.id === startedTeamHealthMeeting?.id
  // the check the viewer is partway through. If the retro stops showing it, it closed under them
  const [answeringCheckId, setAnsweringCheckId] = useState<string | null>(null)
  const [revealedCheckId, setRevealedCheckId] = useState<string | null>(null)
  const gotoResults = () => {
    if (firstResultStageId) gotoStageId(firstResultStageId).catch(() => {})
  }
  // revealing ends the check, then the server swaps its results in for the retro to walk through
  useEffect(() => {
    if (!revealedCheckId || resultsCheckId !== revealedCheckId) return
    setRevealedCheckId(null)
    gotoResults()
  }, [revealedCheckId, resultsCheckId])

  if (!checkStage) return null
  if (answeringCheckId && answeringCheckId !== teamHealthMeeting?.id) {
    const hasClosedCheckResults = resultsCheckId === answeringCheckId
    const canGotoResults = isFacilitator
      ? !!firstResultStage?.isNavigableByFacilitator
      : !!firstResultStage?.isNavigable
    return (
      <RetroTeamHealthClosedCheck
        nextTeamHealthMeeting={teamHealthMeeting ?? null}
        hasResults={hasClosedCheckResults}
        onGotoResults={hasClosedCheckResults && canGotoResults ? gotoResults : undefined}
        onDismiss={() => setAnsweringCheckId(null)}
      />
    )
  }
  if (!teamHealthMeeting) {
    return isFacilitator ? (
      <RetroTeamHealthStartCheckRoot retroMeetingId={meetingId} teamId={teamId} />
    ) : (
      <RetroTeamHealthNoCheck facilitatorName={facilitator.user.preferredName} />
    )
  }
  return (
    <RetroTeamHealthCheck
      key={teamHealthMeeting.id}
      teamHealthMeeting={teamHealthMeeting}
      retroMeetingId={meetingId}
      retroStageId={checkStage.id}
      isFacilitator={isFacilitator}
      isStartedHere={isStartedHere}
      onAnsweringChange={(isAnswering) =>
        setAnsweringCheckId(isAnswering ? teamHealthMeeting.id : null)
      }
      onRevealed={() => setRevealedCheckId(teamHealthMeeting.id)}
    />
  )
}

export default RetroTeamHealthCheckContent
