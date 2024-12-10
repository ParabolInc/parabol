import graphql from 'babel-plugin-relay/macro'
import {useCallback} from 'react'
import {readInlineData} from 'relay-runtime'
import {NavigateMeetingMutation as TNavigateMeetingMutation} from '~/__generated__/NavigateMeetingMutation.graphql'
import {useGotoStageId_meeting$key} from '~/__generated__/useGotoStageId_meeting.graphql'
import LocalAtmosphere from '../modules/demo/LocalAtmosphere'
import {demoTeamId} from '../modules/demo/initDB'
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
        localStage {
          id
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
        phases,
        localStage
      } = meeting
      const {viewerId} = atmosphere
      if (localStage?.id === stageId) return
      const isViewerFacilitator = viewerId === facilitatorUserId
      const res = findStageById(phases, stageId)
      if (!res) return
      const {stage: newStage} = res
      const {isNavigable, isNavigableByFacilitator} = newStage

      const canNavigate = isViewerFacilitator ? isNavigableByFacilitator : isNavigable
      if (!canNavigate) return
      if (teamId === demoTeamId) {
        await (atmosphere as any as LocalAtmosphere).clientGraphQLServer.finishBotActions()
      }
      updateLocalStage(atmosphere, meeting, stageId)
      if (isViewerFacilitator && isNavigableByFacilitator && !endedAt) {
        const res = findStageById(phases, facilitatorStageId)
        if (!res) return
        const {stage: oldStage} = res
        const {isComplete} = oldStage
        const variables = {
          meetingId,
          facilitatorStageId: stageId
        } as TNavigateMeetingMutation['variables']
        if (isForwardProgress(phases, facilitatorStageId, stageId)) {
          if (!isComplete) {
            variables.completedStageId = facilitatorStageId
          } else {
            // Check if we're skipping a phase, and mark it as completed if we are.
            // Note: Only one uncompleted phase should be skippable at a time (the one right before
            // the unlocked stage).
            const oldStagePhaseIndex = phases.findIndex((phase) =>
              phase.stages.find((stage) => stage.id === facilitatorStageId)
            )
            const newStagePhaseIndex = phases.findIndex((phase) =>
              phase.stages.find((stage) => stage.id === stageId)
            )
            if (newStagePhaseIndex - oldStagePhaseIndex > 1) {
              const maybeCompletedStage = phases[newStagePhaseIndex - 1]!.stages[0]
              if (!maybeCompletedStage!.isComplete) {
                variables.completedStageId = maybeCompletedStage!.id
              }
            }
          }
        }
        NavigateMeetingMutation(atmosphere, variables)
      }
    },
    [meeting, atmosphere]
  )
}

export default useGotoStageId
