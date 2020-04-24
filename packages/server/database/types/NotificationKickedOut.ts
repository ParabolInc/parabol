import Notification from './Notification'
import {NotificationEnum} from 'parabol-client/types/graphql'

interface Input {
  teamId: string
  userId: string
  evictorUserId: string
}

export default class NotificationKickedOut extends Notification {
  teamId: string
  evictorUserId: string
  constructor(input: Input) {
    const {evictorUserId, teamId, userId} = input
    super({userId, type: NotificationEnum.KICKED_OUT})
    this.teamId = teamId
    this.evictorUserId = evictorUserId
  }
}
