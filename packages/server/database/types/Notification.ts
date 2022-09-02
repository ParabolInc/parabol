import generateUID from '../../generateUID'
import {NotificationStatusEnumType} from '../../graphql/types/NotificationStatusEnum'

export type NotificationEnum =
  | 'KICKED_OUT'
  | 'MEETING_STAGE_TIME_LIMIT_END'
  | 'PAYMENT_REJECTED'
  | 'PROMOTE_TO_BILLING_LEADER'
  | 'RESPONSE_MENTIONED'
  | 'TASK_INVOLVES'
  | 'TEAM_ARCHIVED'
  | 'TEAM_INVITATION'
export interface NotificationInput {
  type: NotificationEnum
  userId: string
}

export default abstract class Notification {
  id = generateUID()
  status: NotificationStatusEnumType = 'UNREAD'
  createdAt = new Date()
  type: NotificationEnum
  userId: string

  constructor({type, userId}: NotificationInput) {
    this.type = type
    this.userId = userId
  }
}
