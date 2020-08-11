import shortid from 'shortid'

export interface TemplateDimensionInput {
  id?: string
  name: string
  teamId: string
  templateId?: string
  scaleId?: string
  createdAt?: Date
  updatedAt?: Date
  deletedAt?: Date
}

export default class TemplateDimension {
  id: string
  name: string
  teamId: string
  templateId: string | null
  scaleId: string | null
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null

  constructor(input: TemplateDimensionInput) {
    const {id, name, teamId, templateId, scaleId, createdAt, updatedAt, deletedAt} = input
    const now = new Date()
    this.id = id || shortid.generate()
    this.name = name || ''
    this.teamId = teamId
    this.templateId = templateId || null
    this.scaleId = scaleId || null
    this.createdAt = createdAt || now
    this.updatedAt = updatedAt || now
    this.deletedAt = deletedAt || null
  }
}
