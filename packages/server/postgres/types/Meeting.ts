import ActionMeetingMember from '../../database/types/ActionMeetingMember'
import {TierEnum} from '../../database/types/Invoice'
import MeetingAction from '../../database/types/MeetingAction'
import MeetingPoker from '../../database/types/MeetingPoker'
import MeetingRetrospective from '../../database/types/MeetingRetrospective'
import MeetingSettingsAction from '../../database/types/MeetingSettingsAction'
import MeetingSettingsPoker from '../../database/types/MeetingSettingsPoker'
import MeetingSettingsRetrospective from '../../database/types/MeetingSettingsRetrospective'
import MeetingSettingsTeamPrompt from '../../database/types/MeetingSettingsTeamPrompt'
import MeetingTeamPrompt from '../../database/types/MeetingTeamPrompt'
import PokerMeetingMember from '../../database/types/PokerMeetingMember'
import RetroMeetingMember from '../../database/types/RetroMeetingMember'
import TeamPromptMeetingMember from '../../database/types/TeamPromptMeetingMember'
import {MeetingTypeEnum} from '../queries/generated/insertTeamQuery'

export {MeetingTypeEnum, TierEnum}

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
