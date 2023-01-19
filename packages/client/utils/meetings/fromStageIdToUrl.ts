import graphql from 'babel-plugin-relay/macro'
import {readInlineData} from 'relay-runtime'
import {
  fromStageIdToUrl_meeting$key,
  NewMeetingPhaseTypeEnum
} from '~/__generated__/fromStageIdToUrl_meeting.graphql'
import {RetroDemo} from '../../types/constEnums'
import findBestNavigableStage from './findBestNavigableStage'
import findStageById from './findStageById'
import {phaseTypeToSlug} from './lookups'

const phaseIsMultiStage = {
  checkin: true,
  reflect: false,
  group: false,
  vote: false,
  discuss: true,
  updates: true,
  firstcall: false,
  agendaitems: true,
  lastcall: false,
  SCOPE: false,
  ESTIMATE: true
} as Record<NewMeetingPhaseTypeEnum, boolean>

// I think there's a TS bug where when i make a readonly array of an omit it returns the vals
const fromStageIdToUrl = (stageId: string, meetingRef: fromStageIdToUrl_meeting$key) => {
  const meeting = readInlineData(
    graphql`
      fragment fromStageIdToUrl_meeting on NewMeeting @inline {
        id
        facilitatorStageId
        phases {
          phaseType
          stages {
            id
            isComplete
            isNavigable
          }
        }
      }
    `,
    meetingRef
  )
  const {phases, id: meetingId, facilitatorStageId} = meeting
  const stageRes =
    findStageById(phases, stageId) ??
    findStageById(phases, facilitatorStageId) ??
    findBestNavigableStage(phases)
  if (!stageRes) return '/'
  const {phase, stageIdx} = stageRes
  const {phaseType} = phase
  const phaseSlug = phaseTypeToSlug[phaseType]
  const isPhaseMultiStage = phaseIsMultiStage[phaseType]
  const maybeStage = isPhaseMultiStage ? `/${stageIdx + 1}` : ''
  if (meetingId === RetroDemo.MEETING_ID) {
    return `/retrospective-demo/${phaseSlug}${maybeStage}`
  }
  return `/meet/${meetingId}/${phaseSlug}${maybeStage}`
}

export default fromStageIdToUrl
