import shortid from 'shortid'
import {OrgUserRole, TierEnum} from 'parabol-client/types/graphql'

interface Input {
  orgId: string
  userId: string
  newUserUntil?: Date
  id?: string
  inactive?: boolean
  joinedAt?: Date
  removedAt?: Date
  role?: OrgUserRole
  tier?: TierEnum
}

export default class OrganizationUser {
  id: string
  inactive: boolean
  joinedAt: Date
  newUserUntil: Date
  orgId: string
  removedAt: Date | null
  role: OrgUserRole | null
  userId: string
  tier: TierEnum | null

  constructor(input: Input) {
    const {userId, id, removedAt, inactive, orgId, joinedAt, newUserUntil, role, tier} = input
    this.id = id || shortid.generate()
    this.inactive = inactive || false
    this.joinedAt = joinedAt || new Date()
    this.newUserUntil = newUserUntil || new Date()
    this.orgId = orgId
    this.removedAt = removedAt || null
    this.role = role || null
    this.userId = userId
    this.tier = tier || null
  }
}
