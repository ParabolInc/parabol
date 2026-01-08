import {AGENDA_ITEMS, DISCUSS} from '../../client/utils/constants'
import type {
  AgendaItemPhase,
  DiscussPhase,
  EstimatePhase,
  EstimateStage,
  NewMeetingPhase,
  NewMeetingStage,
  TeamPromptResponsesPhase
} from '../postgres/types/NewMeetingPhase'

export const isEstimateStage = (stage: NewMeetingStage): stage is EstimateStage =>
  stage.phaseType === 'ESTIMATE'

export const isAgendaItemsPhase = (phase: NewMeetingPhase): phase is AgendaItemPhase =>
  phase.phaseType === AGENDA_ITEMS

export const isTeamPromptResponsesPhase = (
  phase: NewMeetingPhase
): phase is TeamPromptResponsesPhase => phase.phaseType === 'RESPONSES'

export const isDiscussPhase = (phase: NewMeetingPhase): phase is DiscussPhase =>
  phase.phaseType === DISCUSS

export const isEstimatePhase = (phase: NewMeetingPhase): phase is EstimatePhase =>
  phase.phaseType === 'ESTIMATE'
