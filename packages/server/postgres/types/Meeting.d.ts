import {Selectable} from 'kysely'
import {NonNullableProps} from '../../../client/types/generics'
import {AutogroupReflectionGroupType, UsedReactjis} from './index.d'
import {
  CheckInMeetingPhase,
  NewMeetingPhase,
  PokerMeetingPhase,
  RetroMeetingPhase,
  TeamPromptPhase
} from './NewMeetingPhase'
import {NewMeeting as NewMeetingPG} from './pg'

type NewMeeting = Selectable<NewMeetingPG>
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
  | 'meetingSeriesId'
  | 'scheduledEndTime'
  | 'summary'
  | 'sentimentScore'
  | 'slackTs'
  | 'engagement'
> & {phases: NewMeetingPhase[]; usedReactjis: UsedReactjis | null}

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
    | 'recallBotId'
    | 'videoMeetingURL'
  > & {
    meetingType: 'retrospective'
    phases: RetroMeetingPhase[]
    autogroupReflectionGroups: AutogroupReflectionGroupType[] | null
    resetReflectionGroups: AutogroupReflectionGroupType[] | null
    transcription: TranscriptBlock[] | null
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

export interface MeetingMember {
  id: string
  meetingType: MeetingTypeEnum
  meetingId: string
  teamId: string
  updatedAt: Date
  userId: string
}

export interface ActionMeetingMember extends MeetingMember {
  meetingType: 'action'
}

export interface TeamPromptMeetingMember extends MeetingMember {
  meetingType: 'teamPrompt'
}
export interface RetroMeetingMember extends MeetingMember {
  meetingType: 'retrospective'
  votesRemaining: number
}

export type PokerMeetingMember = MeetingMember & {
  meetingType: 'poker'
  isSpectating: boolean
}
export type AnyMeetingMember =
  | PokerMeetingMember
  | RetroMeetingMember
  | ActionMeetingMember
  | TeamPromptMeetingMember
