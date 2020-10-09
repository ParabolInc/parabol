import shortid from 'shortid'
import TemplateScaleValue from './TemplateScaleValue'

export interface TemplateScaleInput {
  teamId: string
  sortOrder: number
  name: string
  values: TemplateScaleValue[]
  parentScaleId?: string
}

export default class TemplateScale {
  id: string
  createdAt = new Date()
  name: string
  isActive = true
  sortOrder: number
  values: TemplateScaleValue[]
  teamId: string
  updatedAt = new Date()
  parentScaleId?: string

  constructor(input: TemplateScaleInput) {
    const {name, sortOrder, values, teamId, parentScaleId} = input
    this.id = shortid.generate()
    this.sortOrder = sortOrder
    this.name = name
    this.values = values
    this.teamId = teamId
    this.parentScaleId = parentScaleId
  }
}
