import graphql from 'babel-plugin-relay/macro'
import {Dispatch, SetStateAction, useEffect} from 'react'
import {readInlineData} from 'relay-runtime'
import {useInitialSafeRoute_meeting$key} from '~/__generated__/useInitialSafeRoute_meeting.graphql'
import {RetroDemo} from '../types/constEnums'
import findKeyByValue from '../utils/findKeyByValue'
import findStageById from '../utils/meetings/findStageById'
import fromStageIdToUrl from '../utils/meetings/fromStageIdToUrl'
import getMeetingPathParams from '../utils/meetings/getMeetingPathParams'
import {phaseTypeToSlug} from '../utils/meetings/lookups'
import updateLocalStage from '../utils/relay/updateLocalStage'
import {NewMeetingPhaseTypeEnum} from '../__generated__/ActionMeeting_meeting.graphql'
import useAtmosphere from './useAtmosphere'
import useRouter from './useRouter'

const useInitialSafeRoute = (
  setSafeRoute: Dispatch<SetStateAction<boolean>>,
  meetingRef: useInitialSafeRoute_meeting$key
) => {
  const atmosphere = useAtmosphere()
  const {history} = useRouter()
  const meeting = readInlineData(
    graphql`
      fragment useInitialSafeRoute_meeting on NewMeeting @inline {
        ...fromStageIdToUrl_meeting
        id
        meetingType
        facilitatorStageId
        facilitatorUserId
        localStage {
          id
        }
        localPhase {
          id
          stages {
            id
          }
        }
        phases {
          id
          phaseType
          stages {
            id
            isNavigable
            isNavigableByFacilitator
          }
        }
      }
    `,
    meetingRef
  )

  useEffect(
    () => {
      const meetingPath = getMeetingPathParams()
      const {phaseSlug, stageIdxSlug, meetingId: pathMeetingId} = meetingPath
      if (!meeting) {
        history.replace({
          pathname: `/invitation-required`,
          search: `?redirectTo=${encodeURIComponent(
            window.location.pathname
          )}&meetingId=${pathMeetingId}`
        })
        setSafeRoute(false)
        return
      }
      const {facilitatorStageId, facilitatorUserId, localStage, id: meetingId, phases} = meeting
      const {viewerId} = atmosphere

      // I’m headed to the lobby but the meeting is already going, send me there
      if (localStage && !phaseSlug) {
        const {id: localStageId} = localStage
        const nextUrl = fromStageIdToUrl(localStageId, meeting, facilitatorStageId)
        history.replace(nextUrl)
        updateLocalStage(atmosphere, meetingId, facilitatorStageId)
        setSafeRoute(false)
        return
      }

      const localPhaseType = findKeyByValue(phaseTypeToSlug, phaseSlug as NewMeetingPhaseTypeEnum)
      const stageIdx = stageIdxSlug ? Number(stageIdxSlug) - 1 : 0
      const phase = phases.find((curPhase) => curPhase.phaseType === localPhaseType)

      // typo in url, send to the facilitator
      if (!phase) {
        const nextUrl = fromStageIdToUrl(facilitatorStageId, meeting, facilitatorStageId)
        history.replace(nextUrl)
        updateLocalStage(atmosphere, meetingId, facilitatorStageId)
        setSafeRoute(false)
        return
      }

      const stage = phase.stages[stageIdx]
      const stageId = stage?.id
      const isViewerFacilitator = viewerId === facilitatorUserId
      const itemStage = stageId && findStageById(phases, stageId)
      if (!itemStage) {
        // useful for e.g. /discuss/2, especially on the demo
        const nextUrl =
          meetingId === RetroDemo.MEETING_ID
            ? '/retrospective-demo/reflect'
            : fromStageIdToUrl(facilitatorStageId, meeting, facilitatorStageId)
        updateLocalStage(atmosphere, meetingId, facilitatorStageId)
        history.replace(nextUrl)
        setSafeRoute(false)
        return
      }
      // const {stage} = itemStage
      const {isNavigable, isNavigableByFacilitator} = stage
      const canNavigate = isViewerFacilitator ? isNavigableByFacilitator : isNavigable
      if (!canNavigate) {
        // too early to visit meeting or typo, go to facilitator
        const nextUrl = fromStageIdToUrl(facilitatorStageId, meeting, facilitatorStageId)
        history.replace(nextUrl)
        updateLocalStage(atmosphere, meetingId, facilitatorStageId)
        setSafeRoute(false)
        return
      }

      // legit URL!
      updateLocalStage(atmosphere, meetingId, stage.id)
      setSafeRoute(true)
    },
    [
      /* eslint-disable-line react-hooks/exhaustive-deps */
    ]
  )
}

export default useInitialSafeRoute
