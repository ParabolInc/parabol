import graphql from 'babel-plugin-relay/macro'
import {commitLocalUpdate, useFragment} from 'react-relay'
import type {useGotoTeamHealthStageInRetro_meeting$key} from '~/__generated__/useGotoTeamHealthStageInRetro_meeting.graphql'
import FlagReadyToAdvanceMutation from '../mutations/FlagReadyToAdvanceMutation'
import {setLocalStageAndPhase} from '../utils/relay/updateLocalStage'
import useAtmosphere from './useAtmosphere'
import type useGotoStageId from './useGotoStageId'

// a check shown in a retro keeps its own local stage, beneath the retro's Team Health stage. Going to
// one of its stages brings the viewer to that retro stage too, and leaving the questions for the
// waiting room tells the facilitator the viewer is done
const useGotoTeamHealthStageInRetro = (
  meetingRef: useGotoTeamHealthStageInRetro_meeting$key,
  gotoStageId: ReturnType<typeof useGotoStageId>
) => {
  const atmosphere = useAtmosphere()
  const meeting = useFragment(
    graphql`
      fragment useGotoTeamHealthStageInRetro_meeting on RetrospectiveMeeting {
        id
        facilitatorUserId
        phases {
          phaseType
          stages {
            id
          }
        }
        teamHealthMeeting {
          id
          localPhase {
            phaseType
          }
          phases {
            phaseType
            stages {
              id
            }
          }
        }
      }
    `,
    meetingRef
  )
  const {id: meetingId, facilitatorUserId, phases, teamHealthMeeting} = meeting
  return (stageId: string) => {
    const retroStageId = phases.find(({phaseType}) => phaseType === 'TEAM_HEALTH')?.stages[0]?.id
    if (!teamHealthMeeting || !retroStageId) return Promise.resolve()
    const {id: teamHealthMeetingId, localPhase, phases: checkPhases} = teamHealthMeeting
    const nextPhaseType = checkPhases.find(({stages}) =>
      stages.some(({id}) => id === stageId)
    )?.phaseType
    commitLocalUpdate(atmosphere, (store) =>
      setLocalStageAndPhase(store, teamHealthMeetingId, stageId)
    )
    const isLeavingQuestions =
      localPhase?.phaseType === 'TEAM_HEALTH_RESPONSE' && nextPhaseType === 'TEAM_HEALTH_RESULT'
    if (isLeavingQuestions && atmosphere.viewerId !== facilitatorUserId) {
      FlagReadyToAdvanceMutation(atmosphere, {isReady: true, meetingId, stageId: retroStageId})
    }
    return gotoStageId(retroStageId)
  }
}

export default useGotoTeamHealthStageInRetro
