import type {DiscussionThreadQuery$rawResponse} from '~/__generated__/DiscussionThreadQuery.graphql'
import type {TeamHealthDemoRootQuery$rawResponse} from '~/__generated__/TeamHealthDemoRootQuery.graphql'

type ViewerLocalField =
  | 'localPhase'
  | 'localStage'
  | 'showSidebar'
  | 'rightDrawerOpen'
  | 'isAnonymousComment'
  | 'replyingTo'
  | 'editingTaskId'

// relay marks every field under an abstract type condition as optional, which would let a newly
// selected field go missing from the fixture unnoticed. Requiring them all turns that into a tsc error
type Complete<T> = T extends ReadonlyArray<infer Item>
  ? ReadonlyArray<Complete<Item>>
  : T extends object
    ? {readonly [K in Exclude<keyof T, ViewerLocalField>]-?: Complete<T[K]>}
    : T

type OfType<T, TName extends string> = Extract<T, {readonly __typename: TName}>

export type TeamHealthDemoMeetingResponse = Complete<TeamHealthDemoRootQuery$rawResponse>
type DemoMeetingUnion = NonNullable<TeamHealthDemoMeetingResponse['viewer']['meeting']>
export type DemoMeeting = OfType<DemoMeetingUnion, 'TeamHealthMeeting'>
export type DemoPhase = DemoMeeting['phases'][number]
export type DemoResponseStage = OfType<DemoPhase['stages'][number], 'TeamHealthResponseStage'>
export type DemoResultStage = OfType<DemoPhase['stages'][number], 'TeamHealthResultStage'>
export type DemoMeetingMember = OfType<
  DemoMeeting['meetingMembers'][number],
  'TeamHealthMeetingMember'
>
export type DemoViewerMeetingMember = OfType<
  NonNullable<DemoMeeting['viewerMeetingMember']>,
  'TeamHealthMeetingMember'
>
export type DemoTeamMember = DemoMeeting['team']['teamMembers'][number]

export type TeamHealthDemoThreadResponse = Complete<DiscussionThreadQuery$rawResponse>
export type DemoDiscussion = NonNullable<TeamHealthDemoThreadResponse['viewer']['discussion']>
export type DemoComment = OfType<DemoDiscussion['thread']['edges'][number]['node'], 'Comment'>
export type DemoReply = OfType<DemoComment['replies'][number], 'Comment'>
export type DemoReactji = DemoComment['reactjis'][number]
