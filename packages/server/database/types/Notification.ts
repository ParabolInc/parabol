import {NotificationEnum} from '~/__generated__/ArchiveTeamMutation_team.graphql'
import generateUID from '../../generateUID'

export interface NotificationInput {
  type: NotificationEnum
  userId: string
}

export default abstract class Notification {
  id = generateUID()
  status = 'UNREAD'
  createdAt = new Date()
  type: NotificationEnum
  userId: string

  constructor({type, userId}: NotificationInput) {
    this.type = type
    this.userId = userId
  }
}
