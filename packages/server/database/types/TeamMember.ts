import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'

interface Input {
  isNotRemoved?: boolean
  isLead?: boolean
  hideAgenda?: boolean
  email: string
  picture: string
  preferredName: string
  checkInOrder: number
  teamId: string
  userId: string
  updatedAt?: Date
}

export default class TeamMember {
  id: string
  isNotRemoved: boolean
  isLead: boolean
  hideAgenda: boolean
  email: string
  picture: string
  preferredName: string
  checkInOrder: number
  teamId: string
  userId: string
  createdAt: Date
  updatedAt: Date
  constructor(input: Input) {
    const {
      checkInOrder,
      teamId,
      email,
      hideAgenda,
      isLead,
      isNotRemoved,
      picture,
      preferredName,
      userId
    } = input
    this.id = toTeamMemberId(teamId, userId)
    this.checkInOrder = checkInOrder
    this.teamId = teamId
    this.email = email
    this.hideAgenda = hideAgenda || false
    this.isLead = isLead || false
    this.isNotRemoved = isNotRemoved === undefined ? true : isNotRemoved
    this.picture = picture
    this.preferredName = preferredName
    this.userId = userId
    this.createdAt = new Date()
    this.updatedAt = new Date()
  }
}
