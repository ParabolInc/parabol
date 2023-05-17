import Notification from './Notification'

interface Input {
  domainJoinRequestId: string
  email: string
  name: string
  picture: string
  userId: string
}

export default class NotificationRequestToJoinOrg extends Notification {
  domainJoinRequestId: string
  email: string
  name: string
  picture: string
  constructor(input: Input) {
    const {domainJoinRequestId, email, name, picture, userId} = input
    super({userId, type: 'REQUEST_TO_JOIN_ORG'})
    this.domainJoinRequestId = domainJoinRequestId
    this.email = email
    this.name = name
    this.picture = picture
  }
}
