import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import {TeamDrawer} from './../../../client/__generated__/ToggleTeamDrawerMutation.graphql'

interface Input {
  isNotRemoved?: boolean
  isLead?: boolean
  isSpectatingPoker?: boolean
  email: string
  openDrawer?: TeamDrawer
  picture: string
  preferredName: string
  teamId: string
  userId: string
  updatedAt?: Date
}

export default class TeamMember {
  id: string
  isNotRemoved: boolean
  isLead: boolean
  isSpectatingPoker: boolean
  email: string
  openDrawer: TeamDrawer | null
  picture: string
  preferredName: string
  teamId: string
  userId: string
  createdAt: Date
  updatedAt: Date
  constructor(input: Input) {
    const {
      teamId,
      email,
      isLead,
      isNotRemoved,
      openDrawer,
      picture,
      preferredName,
      userId,
      isSpectatingPoker
    } = input
    this.id = toTeamMemberId(teamId, userId)
    this.teamId = teamId
    this.email = email
    this.openDrawer = openDrawer || null
    this.isLead = isLead || false
    this.isSpectatingPoker = isSpectatingPoker || false
    this.isNotRemoved = isNotRemoved === undefined ? true : isNotRemoved
    this.picture = picture
    this.preferredName = preferredName
    this.userId = userId
    this.createdAt = new Date()
    this.updatedAt = new Date()
  }
}
