import graphql from 'babel-plugin-relay/macro'
import {useEffect, useRef} from 'react'
import {commitLocalUpdate, useFragment} from 'react-relay'
import type {useTeamHealthCheckInRetro_meeting$key} from '~/__generated__/useTeamHealthCheckInRetro_meeting.graphql'
import {setLocalStageAndPhase} from '../utils/relay/updateLocalStage'
import useAtmosphere from './useAtmosphere'
import useTeamHealthCheckConnection from './useTeamHealthCheckConnection'

// the retro follows its Team Health check for as long as the retro is open, wherever the viewer is in
// it. The viewer joins the check on reaching Team Health. The check's local stage starts on its intro,
// or its results once revealed, and a reveal moves it to the results, as it does in the check itself
const useTeamHealthCheckInRetro = (
  meetingRef: useTeamHealthCheckInRetro_meeting$key | null,
  isOnTeamHealth: boolean
) => {
  const atmosphere = useAtmosphere()
  const meeting = useFragment(
    graphql`
      fragment useTeamHealthCheckInRetro_meeting on TeamHealthMeeting {
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
    meetingRef
  )
  const meetingId = meeting?.id
  const isEnded = !!meeting?.endedAt
  const hasLocalStage = !!meeting?.localStage
  const isJoinable = !!meeting && !isEnded && !meeting.viewerMeetingMember
  useTeamHealthCheckConnection(meetingId, isOnTeamHealth && isJoinable)
  const setFirstStageOf = (phaseType: 'TEAM_HEALTH_INTRO' | 'TEAM_HEALTH_RESULT') => {
    const stageId = meeting?.phases.find((phase) => phase.phaseType === phaseType)?.stages[0]?.id
    if (!meetingId || !stageId) return
    commitLocalUpdate(atmosphere, (store) => setLocalStageAndPhase(store, meetingId, stageId))
  }
  useEffect(() => {
    if (!meetingId || hasLocalStage) return
    setFirstStageOf(isEnded ? 'TEAM_HEALTH_RESULT' : 'TEAM_HEALTH_INTRO')
  }, [meetingId, hasLocalStage])
  const lastSeenRef = useRef({meetingId, isEnded})
  useEffect(() => {
    const lastSeen = lastSeenRef.current
    lastSeenRef.current = {meetingId, isEnded}
    if (lastSeen.meetingId === meetingId && !lastSeen.isEnded && isEnded) {
      setFirstStageOf('TEAM_HEALTH_RESULT')
    }
  }, [meetingId, isEnded])
}

export default useTeamHealthCheckInRetro
