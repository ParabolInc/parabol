/*
 * Avoid this if you can! Everything should be stored under localStage and localPhase already.
 * Grabbing state from the url is non-deterministic depending on when a component updates!
 */
import {matchPath} from 'react-router'
import type {NewMeetingPhaseTypeEnum} from '~/__generated__/ActionMeeting_meeting.graphql'
import {RetroDemo} from '../../types/constEnums'
import findKeyByValue from '../findKeyByValue'
import {phaseTypeToSlug} from './lookups'

interface MeetingPathResults {
  meetingId?: string
  phaseSlug?: string
  phaseType?: NewMeetingPhaseTypeEnum
  stageIdx?: number
  stageIdxSlug?: string
}

const getMeetingPathParams = (): MeetingPathResults => {
  const {location} = window
  const {pathname} = location
  const matchRes = matchPath({path: '/meet/:meetingId', end: false}, pathname)
  if (!matchRes) {
    const demoMatchRes = matchPath({path: '/retrospective-demo', end: false}, pathname)
    if (!demoMatchRes) return {}
    const remaining = pathname.slice(demoMatchRes.pathname.length).split('/').filter(Boolean)
    return {
      meetingId: RetroDemo.MEETING_ID,
      phaseSlug: remaining[0],
      phaseType: remaining[0]
        ? (findKeyByValue(
            phaseTypeToSlug,
            remaining[0] as NewMeetingPhaseTypeEnum
          ) as NewMeetingPhaseTypeEnum)
        : undefined,
      stageIdx: remaining[1] ? Number(remaining[1]) - 1 : undefined,
      stageIdxSlug: remaining[1]
    }
  }
  const remaining = pathname.slice(matchRes.pathname.length).split('/').filter(Boolean)
  return {
    meetingId: matchRes.params.meetingId!,
    phaseSlug: remaining[0],
    phaseType: remaining[0]
      ? (findKeyByValue(
          phaseTypeToSlug,
          remaining[0] as NewMeetingPhaseTypeEnum
        ) as NewMeetingPhaseTypeEnum)
      : undefined,
    stageIdx: remaining[1] ? Number(remaining[1]) - 1 : undefined,
    stageIdxSlug: remaining[1]
  }
}

export default getMeetingPathParams
