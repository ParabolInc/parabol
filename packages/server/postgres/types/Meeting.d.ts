import ActionMeetingMember from '../../database/types/ActionMeetingMember'
import MeetingAction from '../../database/types/MeetingAction'
import MeetingPoker from '../../database/types/MeetingPoker'
import MeetingRetrospective from '../../database/types/MeetingRetrospective'
import MeetingTeamPrompt from '../../database/types/MeetingTeamPrompt'
import PokerMeetingMember from '../../database/types/PokerMeetingMember'
import RetroMeetingMember from '../../database/types/RetroMeetingMember'
import TeamPromptMeetingMember from '../../database/types/TeamPromptMeetingMember'
import {MeetingTypeEnum} from '../queries/generated/insertTeamQuery'

export {MeetingTypeEnum}

export type AnyMeeting = MeetingRetrospective | MeetingPoker | MeetingAction | MeetingTeamPrompt

export type AnyMeetingTeamMember =
  | PokerMeetingMember
  | RetroMeetingMember
  | ActionMeetingMember
  | TeamPromptMeetingMember
