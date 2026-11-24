import graphql from 'babel-plugin-relay/macro'
import {useEffect, useRef} from 'react'
import {commitLocalUpdate, useFragment} from 'react-relay'
import type {RetroTeamHealthCheck_meeting$key} from '~/__generated__/RetroTeamHealthCheck_meeting.graphql'
import type {RetroTeamHealthCheck_teamHealthMeeting$key} from '~/__generated__/RetroTeamHealthCheck_teamHealthMeeting.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'
import type useGotoStageId from '../../hooks/useGotoStageId'
import useGotoTeamHealthStageInRetro from '../../hooks/useGotoTeamHealthStageInRetro'
import useTeamHealthCheckConnection from '../../hooks/useTeamHealthCheckConnection'
import {setLocalStageAndPhase} from '../../utils/relay/updateLocalStage'
import TeamHealthPhaseContent from '../TeamHealth/TeamHealthPhaseContent'

interface Props {
  meeting: RetroTeamHealthCheck_meeting$key
  teamHealthMeeting: RetroTeamHealthCheck_teamHealthMeeting$key
  gotoStageId: ReturnType<typeof useGotoStageId>
}

// the check's own phases, inside the retro. The check's local stage starts on its intro, or on its
// results once revealed, and a reveal moves it to the results, as it does in the check itself
const RetroTeamHealthCheck = (props: Props) => {
  const {meeting: meetingRef, teamHealthMeeting: teamHealthMeetingRef, gotoStageId} = props
  const meeting = useFragment(
    graphql`
      fragment RetroTeamHealthCheck_meeting on RetrospectiveMeeting {
        ...useGotoTeamHealthStageInRetro_meeting
        ...TeamHealthIntroPhase_retroMeeting
      }
    `,
    meetingRef
  )
  const teamHealthMeeting = useFragment(
    graphql`
      fragment RetroTeamHealthCheck_teamHealthMeeting on TeamHealthMeeting {
        ...TeamHealthPhaseContent_meeting
        id
        endedAt
        localStage {
          id
        }
        viewerMeetingMember {
          id
        }
        phases {
          phaseType
          stages {
            id
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
  const isOpen = !endedAt
  useTeamHealthCheckConnection(teamHealthMeetingId, isOpen && !viewerMeetingMember)
  const gotoCheckStage = useGotoTeamHealthStageInRetro(meeting, gotoStageId)
  const atmosphere = useAtmosphere()
  const setFirstStageOf = (phaseType: 'TEAM_HEALTH_INTRO' | 'TEAM_HEALTH_RESULT') => {
    const stageId = phases.find((phase) => phase.phaseType === phaseType)?.stages[0]?.id
    if (!stageId) return
    commitLocalUpdate(atmosphere, (store) =>
      setLocalStageAndPhase(store, teamHealthMeetingId, stageId)
    )
  }
  useEffect(() => {
    if (localStage) return
    setFirstStageOf(isOpen ? 'TEAM_HEALTH_INTRO' : 'TEAM_HEALTH_RESULT')
  }, [])
  const wasOpenRef = useRef(isOpen)
  useEffect(() => {
    if (isOpen || !wasOpenRef.current) return
    wasOpenRef.current = false
    setFirstStageOf('TEAM_HEALTH_RESULT')
  }, [isOpen])

  // answers need membership, so an open check waits for the join to land
  if (isOpen && !viewerMeetingMember) return null
  return (
    <TeamHealthPhaseContent
      meeting={teamHealthMeeting}
      gotoStageId={gotoCheckStage}
      retroMeeting={meeting}
    />
  )
}

export default RetroTeamHealthCheck
