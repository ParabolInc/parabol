import Notification from './Notification'
import {NotificationEnum} from 'parabol-client/types/graphql'

interface Input {
  archivorUserId: string
  teamId: string
  userId: string
}

export default class NotificationTeamArchived extends Notification {
  archivorUserId: string
  teamId: string
  constructor(input: Input) {
    const {archivorUserId, teamId, userId} = input
    super({userId, type: NotificationEnum.TEAM_ARCHIVED})
    this.archivorUserId = archivorUserId
    this.teamId = teamId
  }
}
