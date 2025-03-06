import generateUID from '../../generateUID'
import {TierEnum} from '../../graphql/public/resolverTypes'
import {TEAM_NAME_LIMIT} from '../../postgres/constants'
import {MeetingTypeEnum} from '../../postgres/types/Meeting'

interface Input {
  id?: string
  autoJoin?: boolean
  name: string
  createdAt?: Date
  createdBy: string
  lastMeetingType?: MeetingTypeEnum
  isArchived?: boolean
  isPaid?: boolean
  tier: TierEnum
  trialStartDate?: Date | null
  orgId: string
  qualAIMeetingsCount?: number
  isOnboardTeam?: boolean
  updatedAt?: Date
  isPublic?: boolean
}

export default class Team {
  id: string
  autoJoin: boolean
  name: string
  createdAt: Date
  createdBy: string
  isArchived: boolean
  isPaid: boolean
  lastMeetingType: MeetingTypeEnum
  lockMessageHTML?: string | null
  tier: TierEnum
  trialStartDate?: Date | null
  orgId: string
  isOnboardTeam: boolean
  qualAIMeetingsCount: number
  updatedAt: Date
  isPublic: boolean
  constructor(input: Input) {
    const {
      autoJoin,
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
      trialStartDate,
      qualAIMeetingsCount,
      updatedAt,
      isPublic
    } = input
    this.autoJoin = autoJoin ?? false
    this.name = name.trim().slice(0, TEAM_NAME_LIMIT)
    this.createdBy = createdBy
    this.orgId = orgId
    this.tier = tier
    this.trialStartDate = trialStartDate
    this.id = id ?? generateUID()
    this.createdAt = createdAt ?? new Date()
    this.updatedAt = updatedAt ?? new Date()
    this.lastMeetingType = lastMeetingType ?? 'retrospective'
    this.isArchived = isArchived ?? false
    this.isOnboardTeam = isOnboardTeam ?? false
    this.isPaid = isPaid ?? true
    this.qualAIMeetingsCount = qualAIMeetingsCount ?? 0
    this.isPublic = isPublic ?? false
  }
}
