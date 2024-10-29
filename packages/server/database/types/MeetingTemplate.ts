import {Insertable} from 'kysely'
import generateUID from '../../generateUID'
import {MeetingTypeEnum} from '../../postgres/types/Meeting'
import {MeetingTemplate as MeetingTemplateDB} from '../../postgres/types/pg'

export type SharingScopeEnum = 'ORGANIZATION' | 'PUBLIC' | 'TEAM' | 'USER'

interface Input {
  name: string
  teamId: string
  scope?: SharingScopeEnum
  orgId: string
  parentTemplateId?: string
  lastUsedAt?: Date | null
  type: MeetingTypeEnum
  isStarter?: boolean
  isFree?: boolean
  mainCategory: string
  illustrationUrl: string
}

export default class MeetingTemplate implements Insertable<MeetingTemplateDB> {
  id: string
  createdAt: Date
  isActive: boolean
  updatedAt: Date
  name: string
  teamId: string
  lastUsedAt: Date | null
  scope: SharingScopeEnum
  orgId: string
  parentTemplateId: string | null
  type: MeetingTypeEnum
  isStarter: boolean
  isFree: boolean
  mainCategory: string
  illustrationUrl: string
  hideStartingAt: Date | null
  hideEndingAt: Date | null

  constructor(input: Input) {
    const {
      name,
      teamId,
      scope,
      orgId,
      parentTemplateId,
      lastUsedAt,
      type,
      isStarter,
      isFree,
      mainCategory,
      illustrationUrl
    } = input
    const now = new Date()
    this.id = generateUID()
    this.createdAt = now
    this.isActive = true
    this.name = name
    this.teamId = teamId
    this.updatedAt = now
    this.scope = scope || 'ORGANIZATION'
    this.orgId = orgId
    this.parentTemplateId = parentTemplateId || null
    this.lastUsedAt = lastUsedAt || null
    this.type = type
    this.isStarter = isStarter || false
    this.isFree = isFree || false
    this.mainCategory = mainCategory
    this.illustrationUrl = illustrationUrl
    this.hideStartingAt = null
    this.hideEndingAt = null
  }
}
