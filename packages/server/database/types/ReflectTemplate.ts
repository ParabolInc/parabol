import shortid from 'shortid'

interface Input {
  name: string
  teamId: string
  scope?: string
  orgId: string
  parentTemplateId?: string
  lastUsedAt?: Date
}

export default class ReflectTemplate {
  id: string
  createdAt: Date
  isActive: boolean
  updatedAt: Date
  name: string
  teamId: string
  lastUsedAt: Date | undefined
  scope: string
  orgId: string
  parentTemplateId?: string

  constructor(input: Input) {
    const {name, teamId, scope, orgId, parentTemplateId, lastUsedAt} = input
    const now = new Date()
    this.id = shortid.generate()
    this.createdAt = now
    this.isActive = true
    this.name = name
    this.teamId = teamId
    this.updatedAt = now
    this.scope = scope || 'TEAM'
    this.orgId = orgId
    this.parentTemplateId = parentTemplateId
    this.lastUsedAt = lastUsedAt ?? undefined
  }
}
