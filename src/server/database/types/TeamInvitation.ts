import shortid from 'shortid'

interface Input {
  id?: string
  acceptedAt?: Date
  expiresAt: Date
  email: string
  invitedBy: string
  teamId: string
  token: string
}
export default class TeamInvitation {
  id: string
  acceptedAt: Date | null
  createdAt: Date
  expiresAt: Date
  email: string
  invitedBy: string
  isMassInvite: boolean
  teamId: string
  token: string
  constructor (input: Input) {
    const {teamId, acceptedAt, email, expiresAt, id, invitedBy, token} = input
    this.id = id || shortid.generate()
    this.acceptedAt = acceptedAt || null
    this.createdAt = new Date()
    this.expiresAt = expiresAt
    this.email = email
    this.invitedBy = invitedBy
    this.isMassInvite = token.indexOf('.') !== -1
    this.teamId = teamId
    this.token = token
  }
}
