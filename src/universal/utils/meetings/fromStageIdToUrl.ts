import {graphql} from 'react-relay'
import findStageById from 'universal/utils/meetings/findStageById'
import getMeetingPathParams from 'universal/utils/meetings/getMeetingPathParams'
import {phaseIsMultiStage, phaseTypeToSlug} from 'universal/utils/meetings/lookups'

graphql`
  fragment fromStageIdToUrlPhases on NewMeetingPhase @relay(plural: true) {
    phaseType
    stages {
      id
    }
  }
`

// I think there's a TS bug where when i make a readonly array of an omit it returns the vals

const fromStageIdToUrl = (stageId: string, phases: ReadonlyArray<any>) => {
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
