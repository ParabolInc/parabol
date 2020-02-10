import shortid from 'shortid'
import {NotificationStatusEnum, NotificationEnum} from 'parabol-client/types/graphql'

export interface NotificationInput {
  type: NotificationEnum
  userId: string
}

export default abstract class Notification {
  id = shortid.generate()
  status = NotificationStatusEnum.UNREAD
  createdAt = new Date()
  type: NotificationEnum
  userId: string

  constructor({type, userId}: NotificationInput) {
    this.type = type
    this.userId = userId
  }
}
