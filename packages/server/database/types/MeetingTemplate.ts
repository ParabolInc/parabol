import {Insertable} from 'kysely'
import generateUID from '../../generateUID'
import {MeetingTemplate as MeetingTemplateDB} from '../../postgres/pg'
import {MeetingTypeEnum} from '../../postgres/types/Meeting'

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

  constructor(input: Input) {
    const {name, teamId, scope, orgId, parentTemplateId, lastUsedAt, type, isStarter, isFree} =
      input
    const now = new Date()
    this.id = generateUID()
    this.createdAt = now
    this.isActive = true
    this.name = name
    this.teamId = teamId
    this.updatedAt = now
    this.scope = scope || 'TEAM'
    this.orgId = orgId
    this.parentTemplateId = parentTemplateId || null
    this.lastUsedAt = lastUsedAt || null
    this.type = type
    this.isStarter = isStarter || false
    this.isFree = isFree || false
  }
}
