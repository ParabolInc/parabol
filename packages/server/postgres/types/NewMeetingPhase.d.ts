interface GenericMeetingStage {
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

interface AgendaItemStage extends GenericMeetingStage {
  phaseType: 'agendaitems'
  agendaItemId: string
  discussionId: string
}

interface CheckInStage extends GenericMeetingStage {
  phaseType: 'checkin'
  teamMemberId: string
  durations?: number[]
}

interface DiscussStage extends GenericMeetingStage {
  phaseType: 'discuss'
  reflectionGroupId: string
  discussionId: string
  sortOrder: number
}

interface EstimateStage extends GenericMeetingStage {
  phaseType: 'ESTIMATE'
  creatorUserId: string
  serviceTaskId: string
  taskId: string
  sortOrder: number
  dimensionRefIdx: number
  finalScore?: number
  scores: {
    userId: string
    label: string
  }[]
  isVoting: boolean
  discussionId: string
}

interface ReflectStage extends GenericMeetingStage {
  phaseType: 'reflect'
}

interface TeamHealthStage extends GenericMeetingStage {
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

interface TeamPromptResponseStage extends GenericMeetingStage {
  phaseType: 'RESPONSES'
  teamMemberId: string
  discussionId: string
}

interface UpdatesStage extends GenericMeetingStage {
  phaseType: 'updates'
  teamMemberId: string
  durations?: number[]
}

interface FirstCallStage extends GenericMeetingStage {
  phaseType: 'firstcall'
}

interface LastCallStage extends GenericMeetingStage {
  phaseType: 'lastcall'
}

interface GroupStage extends GenericMeetingStage {
  phaseType: 'group'
}

interface VoteStage extends GenericMeetingStage {
  phaseType: 'vote'
}

interface ScopeStage extends GenericMeetingStage {
  phaseType: 'SCOPE'
}

interface GenericMeetingPhase {
  id: string
}

interface FirstCallPhase extends GenericMeetingPhase {
  phaseType: 'firstcall'
  stages: [FirstCallStage]
}

interface LastCallPhase extends GenericMeetingPhase {
  phaseType: 'lastcall'
  stages: [LastCallStage]
}

interface GroupPhase extends GenericMeetingPhase {
  phaseType: 'group'
  stages: [GroupStage]
}

interface VotePhase extends GenericMeetingPhase {
  phaseType: 'vote'
  stages: [VoteStage]
}

interface ScopePhase extends GenericMeetingPhase {
  phaseType: 'SCOPE'
  stages: [ScopeStage]
}

interface AgendaItemPhase extends GenericMeetingPhase {
  phaseType: 'agendaitems'
  stages: AgendaItemStage[]
}

const a: AgendaItemPhase

interface CheckInPhase extends GenericMeetingPhase {
  phaseType: 'checkin'
  stages: [CheckInStage, ...CheckInStage[]]
  checkInGreeting: {content: string; language: string}
  checkInQuestion: string
}

interface DiscussPhase extends GenericMeetingPhase {
  phaseType: 'discuss'
  stages: [DiscussStage, ...DiscussStage[]]
}

interface EstimatePhase extends GenericMeetingPhase {
  phaseType: 'ESTIMATE'
  stages: EstimateStage[]
}

interface ReflectPhase extends GenericMeetingPhase {
  phaseType: 'reflect'
  stages: [ReflectStage]
  teamId: string
  focusedPromptId?: string
}

interface TeamHealthPhase extends GenericMeetingPhase {
  phaseType: 'TEAM_HEALTH'
  isRevealed: boolean
  stages: [TeamHealthStage]
}

interface TeamPromptResponsesPhase extends GenericMeetingPhase {
  phaseType: 'RESPONSES'
  stages: [TeamPromptResponseStage, ...TeamPromptResponseStage[]]
}

interface UpdatesPhase extends GenericMeetingPhase {
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

export type PokerMeetingPhase = CheckInPhase | TeamHealthPhase | ScopePhase | EstimatePhase

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
export type NewMeetingStages = TupleToArray<NewMeetingPhase['stages']>
