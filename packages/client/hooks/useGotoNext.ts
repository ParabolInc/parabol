import graphql from 'babel-plugin-relay/macro'
import {useCallback, useRef} from 'react'
import {readInlineData} from 'relay-runtime'
import {useGotoNext_meeting$key} from '~/__generated__/useGotoNext_meeting.graphql'
import findStageAfterId from '../utils/meetings/findStageAfterId'
import findStageById from '../utils/meetings/findStageById'
import useGotoStageId from './useGotoStageId'

export const useGotoNext = (
  meetingRef: useGotoNext_meeting$key,
  gotoStageId: ReturnType<typeof useGotoStageId>
) => {
  const ref = useRef<HTMLButtonElement>(null)
  const meeting = readInlineData(
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
        gotoStageId(nextStageId).catch(() => {
          /*ignore*/
        })
      } else if (options.isHotkey) {
        ref.current && ref.current.focus()
      }
    },
    [gotoStageId, meeting]
  )
  return {gotoNext, ref}
}

export default useGotoNext
