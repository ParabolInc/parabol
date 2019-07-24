import {graphql} from 'react-relay'
import {NewMeetingPhaseTypeEnum} from '../../types/graphql'
import findStageById from './findStageById'
import getMeetingPathParams from './getMeetingPathParams'
import {phaseTypeToSlug} from './lookups'

const phaseIsMultiStage = {
  [NewMeetingPhaseTypeEnum.checkin]: true,
  [NewMeetingPhaseTypeEnum.reflect]: false,
  [NewMeetingPhaseTypeEnum.group]: false,
  [NewMeetingPhaseTypeEnum.vote]: false,
  [NewMeetingPhaseTypeEnum.discuss]: true,
  [NewMeetingPhaseTypeEnum.updates]: true,
  [NewMeetingPhaseTypeEnum.firstcall]: false,
  [NewMeetingPhaseTypeEnum.agendaitems]: true,
  [NewMeetingPhaseTypeEnum.lastcall]: false
}

graphql`
  fragment fromStageIdToUrlPhases on NewMeetingPhase @relay(plural: true) {
    phaseType
    stages {
      id
    }
  }
`

// I think there's a TS bug where when i make a readonly array of an omit it returns the vals

const fromStageIdToUrl = (stageId: string, phases: readonly any[], fallbackStageId: string) => {
  const stageRes = findStageById(phases, stageId) || findStageById(phases, fallbackStageId)
  if (!stageRes) return '/'
  const {phase, stageIdx} = stageRes
  const {phaseType} = phase
  const phaseSlug = phaseTypeToSlug[phaseType]
  const {teamId, meetingSlug} = getMeetingPathParams()
  if (!meetingSlug || !teamId) return '/'
  const isPhaseMultiStage = phaseIsMultiStage[phaseType]
  const maybeStage = isPhaseMultiStage ? `/${stageIdx + 1}` : ''
  if (teamId === 'demo') {
    return `/retrospective-demo/${phaseSlug}${maybeStage}`
  }
  return `/${meetingSlug}/${teamId}/${phaseSlug}${maybeStage}`
}

export default fromStageIdToUrl
