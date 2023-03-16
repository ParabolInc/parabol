import graphql from 'babel-plugin-relay/macro'
import {useCallback} from 'react'
import {readInlineData} from 'relay-runtime'
import {NavigateMeetingMutation as TNavigateMeetingMutation} from '~/__generated__/NavigateMeetingMutation.graphql'
import {useGotoStageId_meeting$key} from '~/__generated__/useGotoStageId_meeting.graphql'
import {demoTeamId} from '../modules/demo/initDB'
import LocalAtmosphere from '../modules/demo/LocalAtmosphere'
import NavigateMeetingMutation from '../mutations/NavigateMeetingMutation'
import findStageById from '../utils/meetings/findStageById'
import isForwardProgress from '../utils/meetings/isForwardProgress'
import updateLocalStage from '../utils/relay/updateLocalStage'
import useAtmosphere from './useAtmosphere'

const useGotoStageId = (meetingRef: useGotoStageId_meeting$key) => {
  const atmosphere = useAtmosphere()
  const meeting = readInlineData(
    graphql`
      fragment useGotoStageId_meeting on NewMeeting @inline {
        ...updateLocalStage_meeting
        endedAt
        teamId
        facilitatorStageId
        facilitatorUserId
        id
        phases {
          id
          stages {
            id
            isComplete
            isNavigable
            isNavigableByFacilitator
          }
        }
      }
    `,
    meetingRef
  )
  return useCallback(
    async (stageId: string) => {
      const {
        endedAt,
        teamId,
        facilitatorStageId,
        facilitatorUserId,
        id: meetingId,
        phases
      } = meeting
      const {viewerId} = atmosphere
      const isViewerFacilitator = viewerId === facilitatorUserId
      const res = findStageById(phases, stageId)
      if (!res) return
      const {stage} = res
      const {isNavigable, isNavigableByFacilitator} = stage

      const canNavigate = isViewerFacilitator ? isNavigableByFacilitator : isNavigable
      if (!canNavigate) return
      if (teamId === demoTeamId) {
        await (atmosphere as any as LocalAtmosphere).clientGraphQLServer.finishBotActions()
      }
      updateLocalStage(atmosphere, meeting, stageId)
      if (isViewerFacilitator && isNavigableByFacilitator && !endedAt) {
        const res = findStageById(phases, facilitatorStageId)
        if (!res) return
        const {stage} = res
        const {isComplete} = stage
        const variables = {
          meetingId,
          facilitatorStageId: stageId
        } as TNavigateMeetingMutation['variables']
        if (!isComplete && isForwardProgress(phases, facilitatorStageId, stageId)) {
          variables.completedStageId = facilitatorStageId
        }
        NavigateMeetingMutation(atmosphere, variables)
      }
    },
    [meeting, atmosphere]
  )
}

export default useGotoStageId
