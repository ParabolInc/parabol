import generateUID from '../../generateUID'
import {TEAM_NAME_LIMIT} from '../../postgres/constants'
import {MeetingTypeEnum} from '../../postgres/types/Meeting'
import {TierEnum} from './Invoice'

interface Input {
  id?: string
  name: string
  createdAt?: Date
  createdBy: string
  lastMeetingType?: MeetingTypeEnum
  isArchived?: boolean
  isPaid?: boolean
  tier: TierEnum
  orgId: string
  qualAIMeetingsCount?: number
  isOnboardTeam?: boolean
  updatedAt?: Date
}

export default class Team {
  id: string
  name: string
  createdAt: Date
  createdBy: string
  isArchived: boolean
  isPaid: boolean
  lastMeetingType: MeetingTypeEnum
  lockMessageHTML?: string | null
  tier: TierEnum
  orgId: string
  isOnboardTeam: boolean
  qualAIMeetingsCount: number
  updatedAt: Date
  constructor(input: Input) {
    const {
      createdAt,
      createdBy,
      id,
      isArchived,
      isOnboardTeam,
      lastMeetingType,
      isPaid,
      name,
      orgId,
      tier,
      qualAIMeetingsCount,
      updatedAt
    } = input
    this.name = name.trim().slice(0, TEAM_NAME_LIMIT)
    this.createdBy = createdBy
    this.orgId = orgId
    this.tier = tier
    this.id = id ?? generateUID()
    this.createdAt = createdAt ?? new Date()
    this.updatedAt = updatedAt ?? new Date()
    this.lastMeetingType = lastMeetingType ?? 'retrospective'
    this.isArchived = isArchived ?? false
    this.isOnboardTeam = isOnboardTeam ?? false
    this.isPaid = isPaid ?? true
    this.qualAIMeetingsCount = qualAIMeetingsCount ?? 0
  }
}
