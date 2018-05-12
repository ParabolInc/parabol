import {phaseIsMultiStage, phaseTypeToSlug} from 'universal/utils/meetings/lookups'
import findStageById from 'universal/utils/meetings/findStageById'
import getMeetingPathParams from 'universal/utils/meetings/getMeetingPathParams'

const fromStageIdToUrl = (stageId: string, phases: $ReadOnlyArray<Object>) => {
  const stageRes = findStageById(phases, stageId)
  if (!stageRes) return undefined
  const {phase, stageIdx} = stageRes
  const {phaseType} = phase
  const phaseSlug = phaseTypeToSlug[phaseType]
  const {teamId, meetingSlug} = getMeetingPathParams()
  if (!meetingSlug || !teamId) return '/'
  const isPhaseMultiStage = phaseIsMultiStage[phaseType]
  const maybeStage = isPhaseMultiStage ? `/${stageIdx + 1}` : ''
  return `/${meetingSlug}/${teamId}/${phaseSlug}${maybeStage}`
}

export default fromStageIdToUrl
