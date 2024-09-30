import {NonNullableProps} from '../../../client/types/generics'
import ActionMeetingMember from '../../database/types/ActionMeetingMember'
import PokerMeetingMember from '../../database/types/PokerMeetingMember'
import RetroMeetingMember from '../../database/types/RetroMeetingMember'
import TeamPromptMeetingMember from '../../database/types/TeamPromptMeetingMember'
import {NewMeeting as NewMeetingDB} from '../pg'
import {NewMeeting} from './index.d'

import {Insertable} from 'kysely'
import {
  CheckInMeetingPhase,
  NewMeetingPhase,
  PokerMeetingPhase,
  RetroMeetingPhase,
  TeamPromptPhase
} from './NewMeetingPhase'

export type MeetingTypeEnum = NewMeeting['meetingType']

type BaseNewMeeting = Pick<
  NewMeeting,
  | 'id'
  | 'isLegacy'
  | 'createdAt'
  | 'updatedAt'
  | 'createdBy'
  | 'endedAt'
  | 'facilitatorStageId'
  | 'facilitatorUserId'
  | 'meetingCount'
  | 'meetingNumber'
  | 'name'
  | 'summarySentAt'
  | 'teamId'
  | 'meetingType'
  | 'showConversionModal'
  | 'meetingSeriesId'
  | 'scheduledEndTime'
  | 'summary'
  | 'sentimentScore'
  | 'usedReactjis'
  | 'slackTs'
  | 'engagement'
> & {phases: NewMeetingPhase[]}

type InsertableRetrospectiveMeeting = Insertable<NewMeetingDB> & {
  meetingType: 'retrospective'
  phases: RetroMeetingPhase[]
  totalVotes: number
  maxVotesPerGroup: number
  disableAnonymity: boolean
  templateId: string
}

export type RetrospectiveMeeting = BaseNewMeeting &
  NonNullableProps<
    Pick<NewMeeting, 'totalVotes' | 'maxVotesPerGroup' | 'disableAnonymity' | 'templateId'>
  > &
  Pick<
    NewMeeting,
    | 'commentCount'
    | 'taskCount'
    | 'topicCount'
    | 'reflectionCount'
    | 'transcription'
    | 'recallBotId'
    | 'videoMeetingURL'
    | 'autogroupReflectionGroups'
    | 'resetReflectionGroups'
  > & {
    meetingType: 'retrospective'
    phases: RetroMeetingPhase[]
  }

export type PokerMeeting = BaseNewMeeting &
  NonNullableProps<Pick<NewMeeting, 'templateRefId' | 'templateId'>> &
  Pick<NewMeeting, 'storyCount' | 'commentCount'> & {
    meetingType: 'poker'
    phases: PokerMeetingPhase[]
  }

export type CheckInMeeting = BaseNewMeeting &
  Pick<NewMeeting, 'taskCount' | 'agendaItemCount' | 'commentCount'> & {
    meetingType: 'action'
    phases: CheckInMeetingPhase[]
  }

export type TeamPromptMeeting = BaseNewMeeting &
  NonNullableProps<Pick<NewMeeting, 'meetingPrompt'>> & {
    meetingType: 'teamPrompt'
    phases: TeamPromptPhase[]
  }

export type AnyMeeting = RetrospectiveMeeting | PokerMeeting | CheckInMeeting | TeamPromptMeeting

export type AnyMeetingTeamMember =
  | PokerMeetingMember
  | RetroMeetingMember
  | ActionMeetingMember
  | TeamPromptMeetingMember
