import {TierEnum, MeetingTypeEnum} from 'parabol-client/types/graphql'
import shortid from 'shortid'
import JiraDimensionField from './JiraDimensionField'

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
  jiraDimensionFields?: JiraDimensionField[]
  lastMeetingType: MeetingTypeEnum
  tier: TierEnum
  orgId: string
  isOnboardTeam: boolean
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
      updatedAt
    } = input
    this.name = name
    this.createdBy = createdBy
    this.orgId = orgId
    this.tier = tier
    this.id = id ?? shortid.generate()
    this.createdAt = createdAt ?? new Date()
    this.updatedAt = updatedAt ?? new Date()
    this.lastMeetingType = lastMeetingType ?? MeetingTypeEnum.retrospective
    this.isArchived = isArchived ?? false
    this.isOnboardTeam = isOnboardTeam ?? false
    this.isPaid = isPaid ?? true
  }
}
