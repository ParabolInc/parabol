import shortid from 'shortid'
import TemplateScaleValue from './TemplateScaleValue'

export interface TemplateScaleInput {
  teamId: string
  sortOrder: number
  name: string
  values?: TemplateScaleValue[]
  parentScaleId?: string
  isStarter?: boolean
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
  isStarter?: boolean

  constructor(input: TemplateScaleInput) {
    const {name, sortOrder, values, teamId, parentScaleId, isStarter} = input
    this.id = shortid.generate()
    this.sortOrder = sortOrder
    this.name = name
    this.values = values || [] as TemplateScaleValue[]
    this.teamId = teamId
    this.parentScaleId = parentScaleId
    this.isStarter = isStarter
  }
}
