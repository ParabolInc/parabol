import shortid from 'shortid'

export interface TemplateDimensionInput {
  name: string
  description: string
  teamId: string
  templateId: string
  sortOrder: number
  scaleId: string
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
  createdAt = new Date()
  updatedAt = new Date()

  constructor(input: TemplateDimensionInput) {
    const {name, description, teamId, templateId, sortOrder, scaleId} = input
    this.id = shortid.generate()
    this.name = name
    this.description = description
    this.teamId = teamId
    this.templateId = templateId
    this.sortOrder = sortOrder
    this.scaleId = scaleId
  }
}
