import {AGENDA_ITEMS, DISCUSS} from '../../client/utils/constants'
import AgendaItemsPhase from '../database/types/AgendaItemsPhase'
import DiscussPhase from '../database/types/DiscussPhase'
import EstimatePhase from '../database/types/EstimatePhase'
import EstimateStage from '../database/types/EstimateStage'
import GenericMeetingPhase from '../database/types/GenericMeetingPhase'
import GenericMeetingStage from '../database/types/GenericMeetingStage'
import MeetingAction from '../database/types/MeetingAction'
import MeetingPoker from '../database/types/MeetingPoker'
import MeetingRetrospective from '../database/types/MeetingRetrospective'
import TeamPromptResponsesPhase from '../database/types/TeamPromptResponsesPhase'
import {AnyMeeting} from '../postgres/types/Meeting'

export const isRetroMeeting = (meeting: AnyMeeting): meeting is MeetingRetrospective =>
  meeting.meetingType === 'retrospective'

export const isPokerMeeting = (meeting: AnyMeeting): meeting is MeetingPoker =>
  meeting.meetingType === 'poker'

export const isActionMeeting = (meeting: AnyMeeting): meeting is MeetingAction =>
  meeting.meetingType === 'action'

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
