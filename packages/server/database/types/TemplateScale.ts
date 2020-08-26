import shortid from 'shortid'

export interface TemplateScaleInput {
  id?: string
  name: string
  values: string[]
  teamId: string
  unit?: string
  createdAt?: Date
  updatedAt?: Date
  deletedAt?: Date
}

export default class TemplateScale {
  id: string
  name: string
  values: string[]
  teamId: string
  unit: string | null
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null

  constructor(input: TemplateScaleInput) {
    const {id, name, values, teamId, createdAt, updatedAt, deletedAt, unit} = input
    const now = new Date()
    this.id = id || shortid.generate()
    this.createdAt = createdAt || now
    this.updatedAt = updatedAt || now
    this.deletedAt = deletedAt || null
    this.name = name || ''
    this.values = values || []
    this.teamId = teamId
    this.unit = unit || null
  }
}
