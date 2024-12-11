import graphql from 'babel-plugin-relay/macro'
import {useCallback} from 'react'
import {readInlineData} from 'relay-runtime'
import {useGotoPrev_meeting$key} from '~/__generated__/useGotoPrev_meeting.graphql'
import findStageBeforeId from '../utils/meetings/findStageBeforeId'
import useGotoStageId from './useGotoStageId'

export const useGotoPrev = (
  meetingRef: useGotoPrev_meeting$key,
  gotoStageId: ReturnType<typeof useGotoStageId>
) => {
  const meeting = readInlineData(
    graphql`
      fragment useGotoPrev_meeting on NewMeeting @inline {
        localStage {
          id
        }
        phases {
          id
          stages {
            id
          }
        }
      }
    `,
    meetingRef
  )
  return useCallback(() => {
    const {localStage, phases} = meeting
    const {id: localStageId} = localStage
    const nextStageRes = findStageBeforeId(phases, localStageId)
    if (!nextStageRes) return
    const {
      stage: {id: nextStageId}
    } = nextStageRes
    gotoStageId(nextStageId).catch(() => {
      /*ignore*/
    })
  }, [gotoStageId, meeting])
}

export default useGotoPrev
