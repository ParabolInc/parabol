import {AGENDA_ITEMS, DISCUSS} from '../../client/utils/constants'
import AgendaItemsPhase from '../database/types/AgendaItemsPhase'
import DiscussPhase from '../database/types/DiscussPhase'
import EstimatePhase from '../database/types/EstimatePhase'
import EstimateStage from '../database/types/EstimateStage'
import GenericMeetingPhase from '../database/types/GenericMeetingPhase'
import GenericMeetingStage from '../database/types/GenericMeetingStage'
import TeamPromptResponsesPhase from '../database/types/TeamPromptResponsesPhase'

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
