import type {Notification} from '../pg.d'

interface BaseNotification {
  id: string
  status: Notification['status']
  type: Notification['type']
  userId: string
}

interface DiscussionMentionedNotification extends BaseNotification {
  type: 'DISCUSSION_MENTIONED'
  meetingId: string
  authorId: string
  commentId: string
  discussionId: string
}

interface KickedOutNotification extends BaseNotification {
  type: 'KICKED_OUT'
  teamId: string
  evictorUserId: string
}

interface MeetingStageTimeLimitEndNotification extends BaseNotification {
  type: 'MEETING_STAGE_TIME_LIMIT_END'
  meetingId: string
}

interface MentionedNotification extends BaseNotification {
  type: 'MENTIONED'
  senderName: string | null
  senderPicture: string | null
  senderUserId: string
  meetingName: string
  meetingId: string
  retroReflectionId?: string | null
  retroDiscussStageIdx?: number | null
}

interface PaymentRejectedNotification extends BaseNotification {
  type: 'PAYMENT_REJECTED'
  orgId: string
  last4: string
  brand: string
}

interface PromoteToBillingLeaderNotification extends BaseNotification {
  type: 'PROMOTE_TO_BILLING_LEADER'
  orgId: string
}

interface PromptToJoinOrgNotification extends BaseNotification {
  type: 'PROMPT_TO_JOIN_ORG'
  activeDomain: string
}

interface RequestToJoinOrgNotification extends BaseNotification {
  type: 'REQUEST_TO_JOIN_ORG'
  domainJoinRequestId: number
  email: string
  name: string
  picture: string
  requestCreatedBy: string
}

interface ResponseMentionedNotification extends BaseNotification {
  type: 'RESPONSE_MENTIONED'
  responseId: string
  meetingId: string
}

interface ResponseRepliedNotification extends BaseNotification {
  type: 'RESPONSE_REPLIED'
  meetingId: string
  authorId: string
  commentId: string
}

interface TaskInvolvesNotification extends BaseNotification {
  type: 'TASK_INVOLVES'
  changeAuthorId: string
  involvement: TaskInvolvement
  taskId: string
  teamId: string
}

interface TeamArchivedNotification extends BaseNotification {
  type: 'TEAM_ARCHIVED'
  archivorUserId: string
  teamId: string
}

interface TeamInvitationNotification extends BaseNotification {
  type: 'TEAM_INVITATION'
  invitationId: string
  teamId: string
}

interface TeamsLimitExceededNotification extends BaseNotification {
  type: 'TEAMS_LIMIT_EXCEEDED'
  orgId: string
  orgName: string
  orgPicture: string | null
}

interface TeamsLimitReminderNotification extends BaseNotification {
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
