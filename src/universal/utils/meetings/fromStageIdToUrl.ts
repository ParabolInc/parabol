import findStageById, {FindStageByIdPhase} from 'universal/utils/meetings/findStageById'
import getMeetingPathParams from 'universal/utils/meetings/getMeetingPathParams'
import {phaseIsMultiStage, phaseTypeToSlug} from 'universal/utils/meetings/lookups'

export interface FromStageIdToUrlPhase extends FindStageByIdPhase {
  phaseType: string
}

const fromStageIdToUrl = (stageId: string, phases: ReadonlyArray<FromStageIdToUrlPhase>) => {
  const stageRes = findStageById(phases, stageId)
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
