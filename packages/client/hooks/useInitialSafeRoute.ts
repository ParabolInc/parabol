import graphql from 'babel-plugin-relay/macro'
import {type Dispatch, type SetStateAction, useEffect, useRef} from 'react'
import {useLocation, useNavigate} from 'react-router'
import {readInlineData} from 'relay-runtime'
import type {
  useInitialSafeRoute_meeting$data,
  useInitialSafeRoute_meeting$key
} from '~/__generated__/useInitialSafeRoute_meeting.graphql'
import type {NewMeetingPhaseTypeEnum} from '../__generated__/ActionMeeting_meeting.graphql'
import {RetroDemo} from '../types/constEnums'
import findKeyByValue from '../utils/findKeyByValue'
import findStageById from '../utils/meetings/findStageById'
import fromStageIdToUrl from '../utils/meetings/fromStageIdToUrl'
import getMeetingPathParams from '../utils/meetings/getMeetingPathParams'
import {phaseTypeToSlug} from '../utils/meetings/lookups'
import updateLocalStage from '../utils/relay/updateLocalStage'
import useAtmosphere from './useAtmosphere'

// A reminder deep-links to /respond with no stage index, which means the viewer's first open
// question, or the first question once they have answered them all
const findOpenQuestionStage = (phases: useInitialSafeRoute_meeting$data['phases']) => {
  const responseStages = phases.find((phase) => phase.phaseType === 'TEAM_HEALTH_RESPONSE')?.stages
  return responseStages?.find((stage) => stage.viewerResponse?.score == null) ?? responseStages?.[0]
}

const isOpenQuestionRoute = () => {
  const {phaseSlug, stageIdxSlug} = getMeetingPathParams()
  return phaseSlug === phaseTypeToSlug.TEAM_HEALTH_RESPONSE && !stageIdxSlug
}

const useInitialSafeRoute = (
  setSafeRoute: Dispatch<SetStateAction<boolean>>,
  meetingRef: useInitialSafeRoute_meeting$key
) => {
  const atmosphere = useAtmosphere()
  const navigate = useNavigate()
  const {pathname} = useLocation()
  const meeting = readInlineData(
    graphql`
      fragment useInitialSafeRoute_meeting on NewMeeting @inline {
        ...fromStageIdToUrl_meeting
        ...updateLocalStage_meeting
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
            ... on TeamHealthResponseStage {
              viewerResponse {
                score
              }
            }
          }
        }
      }
    `,
    meetingRef
  )

  useEffect(() => {
    const meetingPath = getMeetingPathParams()
    const {phaseSlug, stageIdxSlug} = meetingPath
    if (!meeting) {
      // We should not reach this as we should filter out inaccessible meetings in MeetingSelector
      setSafeRoute(false)
      return
    }
    const {facilitatorStageId, facilitatorUserId, localStage, id: meetingId, phases} = meeting
    const {viewerId} = atmosphere

    // I’m headed to the lobby but the meeting is already going, send me there
    if (localStage && !phaseSlug) {
      const {id: localStageId} = localStage
      const nextUrl = fromStageIdToUrl(localStageId, meeting)
      navigate(nextUrl, {replace: true})
      updateLocalStage(atmosphere, meeting, facilitatorStageId)
      setSafeRoute(false)
      return
    }

    const localPhaseType = findKeyByValue(phaseTypeToSlug, phaseSlug as NewMeetingPhaseTypeEnum)
    const stageIdx = stageIdxSlug ? Number(stageIdxSlug) - 1 : 0
    const phase = phases.find((curPhase) => curPhase.phaseType === localPhaseType)

    // typo in url, send to the facilitator
    if (!phase) {
      const nextUrl = fromStageIdToUrl(facilitatorStageId, meeting)
      navigate(nextUrl, {replace: true})
      updateLocalStage(atmosphere, meeting, facilitatorStageId)
      setSafeRoute(false)
      return
    }

    const stage = isOpenQuestionRoute() ? findOpenQuestionStage(phases) : phase.stages[stageIdx]
    const stageId = stage?.id
    const isViewerFacilitator = viewerId === facilitatorUserId
    const itemStage = stageId && findStageById(phases, stageId)
    if (!itemStage) {
      // useful for e.g. /discuss/2, especially on the demo
      const nextUrl =
        meetingId === RetroDemo.MEETING_ID
          ? '/retrospective-demo/reflect'
          : fromStageIdToUrl(facilitatorStageId, meeting)
      updateLocalStage(atmosphere, meeting, facilitatorStageId)
      navigate(nextUrl, {replace: true})
      setSafeRoute(false)
      return
    }
    // const {stage} = itemStage
    const {isNavigable, isNavigableByFacilitator} = stage
    const canNavigate = isViewerFacilitator ? isNavigableByFacilitator : isNavigable
    if (!canNavigate) {
      // too early to visit meeting or typo, go to facilitator
      const nextUrl = fromStageIdToUrl(facilitatorStageId, meeting)
      navigate(nextUrl, {replace: true})
      updateLocalStage(atmosphere, meeting, facilitatorStageId)
      setSafeRoute(false)
      return
    }

    // legit URL!
    updateLocalStage(atmosphere, meeting, stage.id)
    setSafeRoute(true)
  }, [])

  // While the meeting is mounted the local stage drives the URL, not the reverse, so a reminder
  // that lands on /respond from inside the meeting moves the local stage & the URL follows
  const isMountedRef = useRef(false)
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true
      return
    }
    if (!isOpenQuestionRoute()) return
    const stage = findOpenQuestionStage(meeting.phases)
    if (stage) updateLocalStage(atmosphere, meeting, stage.id)
  }, [pathname])
}

export default useInitialSafeRoute
