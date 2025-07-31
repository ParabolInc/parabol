import {AGENDA_ITEMS, DISCUSS} from '../../client/utils/constants'
import type AgendaItemsPhase from '../database/types/AgendaItemsPhase'
import type DiscussPhase from '../database/types/DiscussPhase'
import type EstimatePhase from '../database/types/EstimatePhase'
import type EstimateStage from '../database/types/EstimateStage'
import type GenericMeetingPhase from '../database/types/GenericMeetingPhase'
import type GenericMeetingStage from '../database/types/GenericMeetingStage'
import type TeamPromptResponsesPhase from '../database/types/TeamPromptResponsesPhase'

export const isEstimateStage = (stage: GenericMeetingStage): stage is EstimateStage =>
  stage.phaseType === 'ESTIMATE'

export const isAgendaItemsPhase = (phase: GenericMeetingPhase): phase is AgendaItemsPhase =>
  phase.phaseType === AGENDA_ITEMS

export const isTeamPromptResponsesPhase = (
  phase: GenericMeetingPhase
): phase is TeamPromptResponsesPhase => phase.phaseType === 'RESPONSES'

export const isDiscussPhase = (phase: GenericMeetingPhase): phase is DiscussPhase =>
  phase.phaseType === DISCUSS

export const isEstimatePhase = (phase: GenericMeetingPhase): phase is EstimatePhase =>
  phase.phaseType === 'ESTIMATE'
