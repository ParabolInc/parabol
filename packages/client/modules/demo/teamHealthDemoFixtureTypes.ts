import type {CreateTaskMutation$rawResponse} from '~/__generated__/CreateTaskMutation.graphql'
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
export type DemoThreadable = DemoDiscussion['thread']['edges'][number]['node']
export type DemoComment = OfType<DemoThreadable, 'Comment'>
export type DemoReply = OfType<DemoComment['replies'][number], 'Comment'>
export type DemoReactji = DemoComment['reactjis'][number]

// a task has to satisfy both the thread query and the createTask payload, which select slightly
// different fields, so the demo's task type is the intersection of the two
type CreateTaskResponse = Complete<CreateTaskMutation$rawResponse>
type CreatedTaskUnion = NonNullable<NonNullable<CreateTaskResponse['createTask']>['task']>
type ThreadTask = OfType<DemoThreadable, 'Task'>
type CreatedTask = Extract<OfType<CreatedTaskUnion, 'Task'>, {readonly integrationHash: unknown}>
export type DemoTask = ThreadTask & CreatedTask
export type DemoJiraIssue = OfType<NonNullable<ThreadTask['integration']>, 'JiraIssue'> &
  OfType<NonNullable<CreatedTask['integration']>, 'JiraIssue'>

// the unions end in a `{__typename: string}` member, so a plain __typename check cannot narrow them
export const isDemoMeeting = (meeting: DemoMeetingUnion): meeting is DemoMeeting =>
  meeting.__typename === 'TeamHealthMeeting'
export const isDemoResultStage = (stage: DemoPhase['stages'][number]): stage is DemoResultStage =>
  stage.__typename === 'TeamHealthResultStage'
export const isDemoComment = (node: DemoThreadable): node is DemoComment =>
  node.__typename === 'Comment'
export const isDemoTask = (node: DemoThreadable): node is DemoTask => node.__typename === 'Task'
export const isDemoReply = (reply: DemoComment['replies'][number]): reply is DemoReply =>
  reply.__typename === 'Comment'
