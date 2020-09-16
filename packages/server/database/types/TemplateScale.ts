import shortid from 'shortid'
import TemplateScaleValue from './TemplateScaleValue'

export interface TemplateScaleInput {
  teamId: string
  templateId: string
  sortOrder: number
  name: string
  values: TemplateScaleValue[]
}

export default class TemplateScale {
  id: string
  createdAt = new Date()
  name: string
  isActive = true
  sortOrder: number
  values: TemplateScaleValue[]
  teamId: string
  templateId: string
  updatedAt = new Date()

  constructor(input: TemplateScaleInput) {
    const {name, sortOrder, values, teamId, templateId} = input
    this.id = shortid.generate()
    this.sortOrder = sortOrder
    this.name = name
    this.values = values
    this.teamId = teamId
    this.templateId = templateId
  }
}
