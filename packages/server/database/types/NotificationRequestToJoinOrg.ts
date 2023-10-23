import Notification from './Notification'

interface Input {
  domainJoinRequestId: number
  email: string
  name: string
  picture: string
  userId: string
  requestCreatedBy: string
}

export default class NotificationRequestToJoinOrg extends Notification {
  readonly type = 'REQUEST_TO_JOIN_ORG'
  domainJoinRequestId: number
  email: string
  name: string
  picture: string
  requestCreatedBy: string
  constructor(input: Input) {
    const {domainJoinRequestId, requestCreatedBy, email, name, picture, userId} = input
    super({userId, type: 'REQUEST_TO_JOIN_ORG'})
    this.domainJoinRequestId = domainJoinRequestId
    this.email = email
    this.name = name
    this.picture = picture
    this.requestCreatedBy = requestCreatedBy
  }
}
