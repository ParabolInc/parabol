import shortid from 'shortid'

export interface TemplateDimensionInput {
  id?: string
  name: string
  description: string
  teamId: string
  templateId: string
  sortOrder: number
  scaleId: string
  createdAt?: Date
  updatedAt?: Date
}

export default class TemplateDimension {
  id: string
  name: string
  description: string
  teamId: string
  templateId: string
  isActive = true
  sortOrder: number
  scaleId: string
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date

  constructor(input: TemplateDimensionInput) {
    const {
      id,
      name,
      description,
      teamId,
      templateId,
      sortOrder,
      scaleId,
      createdAt,
      updatedAt
    } = input
    const now = new Date()
    this.id = id || shortid.generate()
    this.name = name
    this.description = description
    this.teamId = teamId
    this.templateId = templateId
    this.sortOrder = sortOrder
    this.scaleId = scaleId
    this.createdAt = createdAt || now
    this.updatedAt = updatedAt || now
  }
}
