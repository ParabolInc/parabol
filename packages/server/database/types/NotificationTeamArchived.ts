import Notification from './Notification'
import {NotificationEnum} from 'parabol-client/types/graphql'

interface Input {
  teamId: string
  userId: string
}

export default class NotificationTeamArchived extends Notification {
  teamId: string

  constructor(input: Input) {
    const {teamId, userId} = input
    super({userId, type: NotificationEnum.TEAM_ARCHIVED})
    this.teamId = teamId
  }
}
