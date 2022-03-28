import MeetingAction from '../../database/types/MeetingAction'
import MeetingPoker from '../../database/types/MeetingPoker'
import MeetingTeamPrompt from '../../database/types/MeetingTeamPrompt'
import MeetingRetrospective from '../../database/types/MeetingRetrospective'
import {MeetingTypeEnum} from '../queries/generated/insertTeamQuery'
import PokerMeetingMember from '../../database/types/PokerMeetingMember'
import RetroMeetingMember from '../../database/types/RetroMeetingMember'
import ActionMeetingMember from '../../database/types/ActionMeetingMember'
import TeamPromptMeetingMember from '../../database/types/TeamPromptMeetingMember'
import MeetingSettingsAction from '../../database/types/MeetingSettingsAction'
import MeetingSettingsPoker from '../../database/types/MeetingSettingsPoker'
import MeetingSettingsRetrospective from '../../database/types/MeetingSettingsRetrospective'
import MeetingSettingsTeamPrompt from '../../database/types/MeetingSettingsTeamPrompt'

export {MeetingTypeEnum}

export type AnyMeeting = MeetingRetrospective | MeetingPoker | MeetingAction | MeetingTeamPrompt

export type AnyMeetingTeamMember =
  | PokerMeetingMember
  | RetroMeetingMember
  | ActionMeetingMember
  | TeamPromptMeetingMember

export type AnyMeetingSettings =
  | MeetingSettingsRetrospective
  | MeetingSettingsAction
  | MeetingSettingsPoker
  | MeetingSettingsTeamPrompt
