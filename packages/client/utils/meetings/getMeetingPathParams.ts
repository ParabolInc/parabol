/*
 * Avoid this if you can! Everything should be stored under localStage and localPhase already.
 * Grabbing state from the url is non-deterministic depending on when a component updates!
 */
import {matchPath} from 'react-router-dom'
import {MeetingTypeEnum, NewMeetingPhaseTypeEnum} from '../../types/graphql'
import findKeyByValue from '../findKeyByValue'
import {meetingTypeToSlug, phaseTypeToSlug} from './lookups'

interface MeetingPathResults {
  meetingSlug?: 'meeting' | 'retro' | 'retrospective-demo'
  meetingType?: MeetingTypeEnum
  teamId?: string
  phaseSlug?: string
  phaseType?: NewMeetingPhaseTypeEnum
  stageIdx?: number
  stageIdxSlug?: string
}

interface MeetingParams {
  meetingSlug: 'meeting' | 'retro' | 'retrospective-demo'
  teamId: string
  phaseSlug?: string
  stageIdxSlug?: string
}

const getMeetingPathParams = (): MeetingPathResults => {
  const matchRes = matchPath<MeetingParams>(window.location.pathname, {
    path: '/:meetingSlug/:teamId/:phaseSlug?/:stageIdxSlug?'
  })
  if (!matchRes || matchRes.params.meetingSlug === 'retrospective-demo') {
    const demoMatchRes = matchPath<Pick<MeetingParams, 'phaseSlug' | 'stageIdxSlug'>>(
      window.location.pathname,
      {
        path: '/retrospective-demo/:phaseSlug?/:stageIdxSlug?'
      }
    )
    if (!demoMatchRes) return {}
    const {params} = demoMatchRes
    const {phaseSlug, stageIdxSlug} = params
    return {
      meetingSlug: 'retrospective-demo',
      meetingType: MeetingTypeEnum.retrospective,
      phaseSlug,
      phaseType: findKeyByValue(phaseTypeToSlug, phaseSlug) as NewMeetingPhaseTypeEnum,
      stageIdx: stageIdxSlug ? Number(stageIdxSlug) - 1 : undefined,
      stageIdxSlug,
      teamId: 'demo'
    }
  }
  const {
    params: {meetingSlug, teamId, phaseSlug, stageIdxSlug}
  } = matchRes
  return {
    meetingSlug,
    meetingType: findKeyByValue(meetingTypeToSlug, meetingSlug) as MeetingTypeEnum,
    phaseSlug: phaseSlug,
    phaseType: findKeyByValue(phaseTypeToSlug, phaseSlug) as NewMeetingPhaseTypeEnum,
    stageIdx: stageIdxSlug ? Number(stageIdxSlug) - 1 : undefined,
    stageIdxSlug,
    teamId
  }
}

export default getMeetingPathParams
