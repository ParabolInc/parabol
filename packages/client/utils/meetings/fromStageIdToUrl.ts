import graphql from 'babel-plugin-relay/macro'
import {readInlineData} from 'relay-runtime'
import type {
  fromStageIdToUrl_meeting$key,
  NewMeetingPhaseTypeEnum
} from '~/__generated__/fromStageIdToUrl_meeting.graphql'
import findBestNavigableStage from './findBestNavigableStage'
import findStageById from './findStageById'
import getMeetingPathRoot from './getMeetingPathRoot'
import {phaseTypeToSlug} from './lookups'

const phaseIsMultiStage = {
  checkin: true,
  TEAM_HEALTH: false,
  reflect: false,
  group: false,
  vote: false,
  discuss: true,
  updates: true,
  firstcall: false,
  agendaitems: true,
  lastcall: false,
  SCOPE: false,
  ESTIMATE: true,
  TEAM_HEALTH_INTRO: false,
  TEAM_HEALTH_RESPONSE: true,
  TEAM_HEALTH_SUBMITTED: false,
  TEAM_HEALTH_RESULT: true
} as Record<NewMeetingPhaseTypeEnum, boolean>

// a retro shows its Team Health check inside its own Team Health phase, at the check's stage URLs
interface TeamHealthCheck {
  readonly localStage?: {readonly id: string} | null
  readonly phases: ReadonlyArray<{
    readonly phaseType: NewMeetingPhaseTypeEnum
    readonly stages: ReadonlyArray<{readonly id: string}>
  }>
}

// I think there's a TS bug where when i make a readonly array of an omit it returns the vals
const fromStageIdToUrl = (
  stageId: string,
  meetingRef: fromStageIdToUrl_meeting$key,
  teamHealthCheck?: TeamHealthCheck | null
) => {
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
  const checkStageRes =
    stageRes.phase.phaseType === 'TEAM_HEALTH'
      ? findStageById(teamHealthCheck?.phases, teamHealthCheck?.localStage?.id)
      : undefined
  const {phase, stageIdx} = checkStageRes ?? stageRes
  const {phaseType} = phase
  const phaseSlug = phaseTypeToSlug[phaseType]
  const isPhaseMultiStage = phaseIsMultiStage[phaseType]
  const maybeStage = isPhaseMultiStage ? `/${stageIdx + 1}` : ''
  return `${getMeetingPathRoot(meetingId)}/${phaseSlug}${maybeStage}`
}

export default fromStageIdToUrl
