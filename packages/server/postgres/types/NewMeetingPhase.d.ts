export interface GenericMeetingStage {
  id: string
  isAsync?: boolean | null
  isComplete: boolean
  isNavigable: boolean
  isNavigableByFacilitator: boolean
  startAt?: Date
  endAt?: Date
  scheduledEndTime?: Date | null
  suggestedEndTime?: Date
  suggestedTimeLimit?: number
  viewCount: number
  readyToAdvance?: string[]
  phaseType: string
}

export interface AgendaItemStage extends GenericMeetingStage {
  phaseType: 'agendaitems'
  agendaItemId: string
  discussionId: string
}

export interface CheckInStage extends GenericMeetingStage {
  phaseType: 'checkin'
  teamMemberId: string
  durations?: number[]
}

export interface DiscussStage extends GenericMeetingStage {
  phaseType: 'discuss'
  reflectionGroupId: string
  discussionId: string
  sortOrder: number
}

export interface EstimateStage extends GenericMeetingStage {
  phaseType: 'ESTIMATE'
  creatorUserId: string
  serviceTaskId: string
  taskId: string
  sortOrder: number
  dimensionRefIdx: number
  scores: {
    userId: string
    label: string
  }[]
  isVoting: boolean
  discussionId: string
}

export interface ReflectStage extends GenericMeetingStage {
  phaseType: 'reflect'
}

export interface TeamHealthStage extends GenericMeetingStage {
  phaseType: 'TEAM_HEALTH'
  votes: {
    userId: string
    vote: number
  }[]
  isRevealed: boolean
  question: string
  labels: string[]
  durations?: number[]
}

export interface TeamPromptResponseStage extends GenericMeetingStage {
  phaseType: 'RESPONSES'
  teamMemberId: string
  discussionId: string
}

export interface UpdatesStage extends GenericMeetingStage {
  phaseType: 'updates'
  teamMemberId: string
  durations?: number[]
}

export interface FirstCallStage extends GenericMeetingStage {
  phaseType: 'firstcall'
}

export interface LastCallStage extends GenericMeetingStage {
  phaseType: 'lastcall'
}

export interface GroupStage extends GenericMeetingStage {
  phaseType: 'group'
}

export interface VoteStage extends GenericMeetingStage {
  phaseType: 'vote'
}

export interface ScopeStage extends GenericMeetingStage {
  phaseType: 'SCOPE'
}

export interface GenericMeetingPhase {
  id: string
}

export interface FirstCallPhase extends GenericMeetingPhase {
  phaseType: 'firstcall'
  stages: [FirstCallStage]
}

export interface LastCallPhase extends GenericMeetingPhase {
  phaseType: 'lastcall'
  stages: [LastCallStage]
}

export interface GroupPhase extends GenericMeetingPhase {
  phaseType: 'group'
  stages: [GroupStage]
}

export interface VotePhase extends GenericMeetingPhase {
  phaseType: 'vote'
  stages: [VoteStage]
}

export interface ScopePhase extends GenericMeetingPhase {
  phaseType: 'SCOPE'
  stages: [ScopeStage]
}

export interface AgendaItemPhase extends GenericMeetingPhase {
  phaseType: 'agendaitems'
  stages: AgendaItemStage[]
}

export interface CheckInPhase extends GenericMeetingPhase {
  phaseType: 'checkin'
  stages: [CheckInStage, ...CheckInStage[]]
  checkInGreeting: {content: string; language: string}
  checkInQuestion: string
}

export interface DiscussPhase extends GenericMeetingPhase {
  phaseType: 'discuss'
  stages: [DiscussStage, ...DiscussStage[]]
}

export interface EstimatePhase extends GenericMeetingPhase {
  phaseType: 'ESTIMATE'
  stages: EstimateStage[]
}

export interface ReflectPhase extends GenericMeetingPhase {
  phaseType: 'reflect'
  stages: [ReflectStage]
  teamId: string
  focusedPromptId?: string
}

export interface TeamHealthPhase extends GenericMeetingPhase {
  phaseType: 'TEAM_HEALTH'
  isRevealed: boolean
  stages: [TeamHealthStage]
}

export interface TeamPromptResponsesPhase extends GenericMeetingPhase {
  phaseType: 'RESPONSES'
  stages: [TeamPromptResponseStage, ...TeamPromptResponseStage[]]
}

export interface UpdatesPhase extends GenericMeetingPhase {
  phaseType: 'updates'

  stages: [UpdatesStage, ...UpdatesStage[]]
}

export type RetroMeetingPhase =
  | CheckInPhase
  | TeamHealthPhase
  | ReflectPhase
  | GroupPhase
  | VotePhase
  | DiscussPhase

export type PokerMeetingPhase = CheckInPhase | ScopePhase | EstimatePhase

export type CheckInMeetingPhase =
  | CheckInPhase
  | TeamHealthPhase
  | UpdatesPhase
  | FirstCallPhase
  | LastCallPhase
  | AgendaItemPhase

export type TeamPromptPhase = TeamPromptResponsesPhase

export type NewMeetingPhase =
  | RetroMeetingPhase
  | PokerMeetingPhase
  | CheckInMeetingPhase
  | TeamPromptPhase

type TupleToArray<T> = T extends (infer U)[] ? U : never
export type NewMeetingStage = TupleToArray<NewMeetingPhase['stages']>
