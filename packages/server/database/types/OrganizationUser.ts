import generateUID from '../../generateUID'
import {TierEnum} from './Invoice'

export type OrgUserRole = 'BILLING_LEADER' | 'ORG_ADMIN'
interface Input {
  orgId: string
  userId: string
  id?: string
  inactive?: boolean
  joinedAt?: Date
  removedAt?: Date
  role?: OrgUserRole
  tier?: TierEnum
  suggestedTier?: TierEnum
}

export default class OrganizationUser {
  id: string
  suggestedTier: TierEnum | null
  inactive: boolean
  joinedAt: Date
  orgId: string
  removedAt: Date | null
  role: OrgUserRole | null
  userId: string
  tier: TierEnum
  trialStartDate?: Date | null

  constructor(input: Input) {
    const {suggestedTier, userId, id, removedAt, inactive, orgId, joinedAt, role, tier} = input
    this.id = id || generateUID()
    this.suggestedTier = suggestedTier || null
    this.inactive = inactive || false
    this.joinedAt = joinedAt || new Date()
    this.orgId = orgId
    this.removedAt = removedAt || null
    this.role = role || null
    this.userId = userId
    this.tier = tier || 'starter'
  }
}
