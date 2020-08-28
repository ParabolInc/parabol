import shortid from 'shortid'

export interface TemplateDimensionInput {
  id?: string
  name: string
  teamId: string
  templateId: string
  scaleId: string
  createdAt?: Date
  updatedAt?: Date
}

export default class TemplateDimension {
  id: string
  name: string
  teamId: string
  templateId: string
  scaleId: string
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date

  constructor(input: TemplateDimensionInput) {
    const {id, name, teamId, templateId, scaleId, createdAt, updatedAt} = input
    const now = new Date()
    this.id = id || shortid.generate()
    this.name = name
    this.teamId = teamId
    this.templateId = templateId
    this.scaleId = scaleId
    this.createdAt = createdAt || now
    this.updatedAt = updatedAt || now
  }
}
