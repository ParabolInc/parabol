import type {Notification} from './pg'

interface BaseNotification {
  id: string
  status: 'CLICKED' | 'READ' | 'UNREAD'
  type: Notification['type']
  userId: string
}

export interface DiscussionMentionedNotification extends BaseNotification {
  type: 'DISCUSSION_MENTIONED'
  meetingId: string
  authorId: string
  commentId: string
  discussionId: string
}

export interface KickedOutNotification extends BaseNotification {
  type: 'KICKED_OUT'
  teamId: string
  evictorUserId: string
}

export interface MeetingStageTimeLimitEndNotification extends BaseNotification {
  type: 'MEETING_STAGE_TIME_LIMIT_END'
  meetingId: string
}

export interface MentionedNotification extends BaseNotification {
  type: 'MENTIONED'
  senderName: string | null
  senderPicture: string | null
  senderUserId: string
  meetingName: string
  meetingId: string
  retroReflectionId: string | null
  retroDiscussStageIdx: number | null
}

export interface PaymentRejectedNotification extends BaseNotification {
  type: 'PAYMENT_REJECTED'
  orgId: string
  last4: number
  brand: string
}

export interface PromoteToBillingLeaderNotification extends BaseNotification {
  type: 'PROMOTE_TO_BILLING_LEADER'
  orgId: string
}

export interface PromptToJoinOrgNotification extends BaseNotification {
  type: 'PROMPT_TO_JOIN_ORG'
  activeDomain: string
}

export interface RequestToJoinOrgNotification extends BaseNotification {
  type: 'REQUEST_TO_JOIN_ORG'
  domainJoinRequestId: number
  email: string
  name: string
  picture: string
  requestCreatedBy: string
}

export interface ResponseMentionedNotification extends BaseNotification {
  type: 'RESPONSE_MENTIONED'
  responseId: number
  meetingId: string
}

export interface ResponseRepliedNotification extends BaseNotification {
  type: 'RESPONSE_REPLIED'
  meetingId: string
  authorId: string
  commentId: string
}

export interface TaskInvolvesNotification extends BaseNotification {
  type: 'TASK_INVOLVES'
  changeAuthorId: string
  involvement: TaskInvolvement
  taskId: string
  teamId: string
}

export interface TeamArchivedNotification extends BaseNotification {
  type: 'TEAM_ARCHIVED'
  archivorUserId: string
  teamId: string
}

export interface TeamInvitationNotification extends BaseNotification {
  type: 'TEAM_INVITATION'
  invitationId: string
  teamId: string
}

export interface TeamsLimitExceededNotification extends BaseNotification {
  type: 'TEAMS_LIMIT_EXCEEDED'
  orgId: string
  orgName: string
  orgPicture: string | null
}

export interface TeamsLimitReminderNotification extends BaseNotification {
  type: 'TEAMS_LIMIT_REMINDER'
  orgId: string
  orgName: string
  orgPicture: string | null
  scheduledLockAt: Date
}

type AnyNotification =
  | DiscussionMentionedNotification
  | KickedOutNotification
  | MeetingStageTimeLimitEndNotification
  | MentionedNotification
  | PaymentRejectedNotification
  | PromoteToBillingLeaderNotification
  | PromptToJoinOrgNotification
  | RequestToJoinOrgNotification
  | ResponseMentionedNotification
  | ResponseRepliedNotification
  | TaskInvolvesNotification
  | TeamArchivedNotification
  | TeamInvitationNotification
  | TeamsLimitExceededNotification
  | TeamsLimitReminderNotification
