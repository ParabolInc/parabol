import {useCallback, useRef} from 'react'
import {readInlineData} from 'relay-runtime'
import findStageById from '../utils/meetings/findStageById'
import findStageAfterId from '../utils/meetings/findStageAfterId'
import graphql from 'babel-plugin-relay/macro'
import {useGotoNext_meeting} from '~/__generated__/useGotoNext_meeting.graphql'
import useGotoStageId from './useGotoStageId'

export const useGotoNext = (meetingRef: any, gotoStageId: ReturnType<typeof useGotoStageId>) => {
  const ref = useRef<HTMLButtonElement>(null)
  const meeting = readInlineData<useGotoNext_meeting>(
    graphql`
      fragment useGotoNext_meeting on NewMeeting @inline {
        localStage {
          id
        }
        phases {
          id
          stages {
            id
            isComplete
          }
        }
      }
    `,
    meetingRef
  )
  const gotoNext = useCallback(
    (options: {isHotkey?: boolean} = {}) => {
      const {localStage, phases} = meeting
      const {id: localStageId} = localStage
      const currentStageRes = findStageById(phases, localStageId)
      const nextStageRes = findStageAfterId(phases, localStageId)
      if (!nextStageRes || !currentStageRes) return
      const {stage} = nextStageRes
      const {id: nextStageId} = stage
      if (!options.isHotkey || currentStageRes.stage.isComplete) {
        gotoStageId(nextStageId).catch()
      } else if (options.isHotkey) {
        ref.current && ref.current.focus()
      }
    },
    [gotoStageId, meeting]
  )
  return {gotoNext, ref}
}

export default useGotoNext
