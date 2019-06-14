import shortid from 'shortid'

export type NotificationType =
  | 'KICKED_OUT'
  | 'PAYMENT_REJECTED'
  | 'PROMOTE_TO_BILLING_LEADER'
  | 'TEAM_INVITATION'
  | 'TEAM_ARCHIVED'
  | 'TASK_INVOLVES'
  | 'VERSION_INFO'
  | 'MEETING_STAGE_TIME_LIMIT'

export interface NotificationInput {
  type: NotificationType
  userIds: string[]
}

export default abstract class Notification {
  id = shortid.generate()
  isArchived = false
  orgId?: string
  startAt = new Date()
  type: NotificationType
  userIds: string[]

  constructor ({type, userIds}: NotificationInput) {
    this.type = type
    this.userIds = userIds
  }
}
