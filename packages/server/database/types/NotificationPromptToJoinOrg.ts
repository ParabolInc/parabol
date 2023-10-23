import Notification from './Notification'

interface Input {
  activeDomain: string
  userId: string
}

export default class NotificationPromptToJoinOrg extends Notification {
  readonly type = 'PROMPT_TO_JOIN_ORG'
  activeDomain: string
  constructor(input: Input) {
    const {userId, activeDomain} = input
    super({userId, type: 'PROMPT_TO_JOIN_ORG'})
    this.activeDomain = activeDomain
  }
}
